import { differenceInDays, addDays, addYears, format } from 'date-fns';
import { type Report, type CalculatedReport, type YearlyBreakdown, type RecipientCalculation, type OtherAmount, type Payment } from './types';

const AVG_DAYS_IN_MONTH = 30.4375; // More precise average

function getPeriodDisplay(startDate: Date, endDate: Date): string {
    if (endDate < startDate) return "0 مہینے, 0 دن";
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    const totalMonths = Math.floor(daysDiff / AVG_DAYS_IN_MONTH);
    const remainingDays = Math.round(daysDiff - (totalMonths * AVG_DAYS_IN_MONTH));
    return `${totalMonths} مہینے, ${remainingDays} دن`;
}

export function calculateDecree(reportData: Omit<Report, 'id' | 'createdAt'>): CalculatedReport {
  const {
    startDate,
    endDate,
    recipients,
    yearlyIncrease = 0,
    increaseType,
    otherAmounts = [],
    payments = [],
    partiallySatisfied,
    partialSatisfactionDate,
  } = reportData;

  const effectiveStartDate = (partiallySatisfied && partialSatisfactionDate && partialSatisfactionDate > startDate)
    ? addDays(partialSatisfactionDate, 1)
    : startDate;

  let grandTotalMaintenance = 0;
  const recipientCalculations: RecipientCalculation[] = [];

  for (const recipient of recipients) {
    const baseAmount = recipient.amount;
    let totalRecipientAmount = 0;
    const yearlyBreakdown: YearlyBreakdown[] = [];
    let currentRate = baseAmount;
    
    // If partially satisfied, we need to calculate the rate at the partial satisfaction date
    if (partiallySatisfied && partialSatisfactionDate) {
        let rateCalcDate = new Date(startDate);
        const fixedIncreaseAmount = increaseType === 'fixed' ? (baseAmount * yearlyIncrease / 100) : 0;
        
        while(rateCalcDate < partialSatisfactionDate) {
            const nextAnniversary = addYears(rateCalcDate, 1);
            if(nextAnniversary <= partialSatisfactionDate) {
                if (increaseType === 'progressive') {
                    currentRate *= (1 + yearlyIncrease / 100);
                } else {
                    currentRate += fixedIncreaseAmount;
                }
                rateCalcDate = nextAnniversary;
            } else {
                break;
            }
        }
    }


    let loopStartDate = new Date(effectiveStartDate);

    while (loopStartDate <= endDate) {
      const anniversaryYear = loopStartDate.getFullYear();
      let periodEndDate: Date;

      // Determine the end of the current calculation period (either next anniversary or report end date)
      const nextAnniversary = addYears(loopStartDate, 1);
      
      if (nextAnniversary <= endDate) {
          periodEndDate = addDays(nextAnniversary, -1);
      } else {
          periodEndDate = endDate;
      }

      const daysInPeriod = differenceInDays(periodEndDate, loopStartDate) + 1;
      const periodMonths = daysInPeriod / AVG_DAYS_IN_MONTH;
      const totalPeriodAmount = currentRate * periodMonths;

      yearlyBreakdown.push({
        year: `سال ${yearlyBreakdown.length + 1}`,
        startDate: new Date(loopStartDate),
        endDate: new Date(periodEndDate),
        basicAmount: baseAmount,
        increasedAmount: currentRate,
        durationDisplay: getPeriodDisplay(loopStartDate, periodEndDate),
        totalPeriod: totalPeriodAmount,
      });

      totalRecipientAmount += totalPeriodAmount;
      loopStartDate = addDays(periodEndDate, 1);
      
      // Apply increase for the next period
      if (loopStartDate <= endDate) {
          if (increaseType === 'progressive') {
            currentRate *= (1 + yearlyIncrease / 100);
          } else { // fixed
            currentRate += (baseAmount * yearlyIncrease / 100);
          }
      }
    }

    recipientCalculations.push({
      name: recipient.name,
      relationship: recipient.relationship,
      baseAmount,
      increaseType,
      yearlyIncrease,
      totalRecipientAmount,
      currentMonthAmount: currentRate,
      yearlyBreakdown,
    });

    grandTotalMaintenance += totalRecipientAmount;
  }
  
  const validOtherAmounts = otherAmounts.filter(oa => oa.description && oa.amount && oa.amount > 0) as Omit<OtherAmount, 'id'>[];
  const totalOtherAmounts = validOtherAmounts.reduce((sum, item) => sum + (item.amount || 0), 0);

  const validPayments = payments.filter(p => p.date && p.amount && p.amount > 0) as Omit<Payment, 'id'>[];
  const totalPayments = validPayments.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const totalDecretalAmountBeforePayments = grandTotalMaintenance + totalOtherAmounts;
  const finalOutstandingAmount = totalDecretalAmountBeforePayments - totalPayments;

  return {
    caseDetails: {
      courtName: reportData.courtName,
      partyA: reportData.partyA,
      partyB: reportData.partyB,
      cmsNo: reportData.cmsNo,
    },
    reportGenerator: {
      generatedBy: reportData.reportGenerator,
      counselName: reportData.counselName || '',
    },
    period: {
      startDate: startDate,
      endDate: endDate,
      periodDisplay: getPeriodDisplay(startDate, endDate),
    },
    ...(partiallySatisfied && partialSatisfactionDate && { 
        partialSatisfaction: { 
            date: partialSatisfactionDate, 
            effectiveStartDate: effectiveStartDate 
        } 
    }),
    recipientCalculations,
    otherAmounts: validOtherAmounts,
    payments: validPayments,
    summary: {
      grandTotalMaintenance,
      totalOtherAmounts,
      totalDecretalAmountBeforePayments,
      totalPayments,
      finalOutstandingAmount,
    },
    createdAt: new Date(),
  };
}
