import { differenceInDays, addDays, addYears, format, differenceInMonths, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { type Report, type CalculatedReport, type YearlyBreakdown, type RecipientCalculation, type OtherAmount, type Payment } from './types';

function getPeriodDisplay(startDate: Date, endDate: Date): string {
    if (endDate < startDate) return "0 مہینے, 0 دن";

    let totalMonths = differenceInMonths(endDate, startDate);
    let tempDate = new Date(startDate);
    tempDate.setMonth(tempDate.getMonth() + totalMonths);
    
    let daysDiff = differenceInDays(endDate, tempDate);

    // Adjust if we've overshot the month
    if (daysDiff < 0) {
        totalMonths--;
        tempDate = new Date(startDate);
        tempDate.setMonth(tempDate.getMonth() + totalMonths);
        daysDiff = differenceInDays(endDate, tempDate);
    }
    
    // Add 1 to days to make it inclusive
    daysDiff += 1;

    if (daysDiff >= getDaysInMonth(endDate)) {
        totalMonths++;
        daysDiff = 0;
    }

    return `${totalMonths} مہینے, ${daysDiff} دن`;
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
    let baseAmount = recipient.amount;
    let totalRecipientAmount = 0;
    const yearlyBreakdown: YearlyBreakdown[] = [];
    
    let currentRate = baseAmount;
    
    // If partially satisfied, calculate the rate at the partial satisfaction date
    if (partiallySatisfied && partialSatisfactionDate) {
        let rateCalcDate = new Date(startDate);
        let rateAtSatisfaction = baseAmount;
        
        while(addYears(rateCalcDate, 1) <= partialSatisfactionDate) {
            if (increaseType === 'progressive') {
                rateAtSatisfaction *= (1 + yearlyIncrease / 100);
            } else { // fixed
                rateAtSatisfaction += (baseAmount * yearlyIncrease / 100);
            }
            rateCalcDate = addYears(rateCalcDate, 1);
        }
        currentRate = rateAtSatisfaction;
    }

    let loopStartDate = new Date(effectiveStartDate);
    let firstAnniversary = new Date(startDate);
    // Find the first anniversary that is after or on the loopStartDate
    while(firstAnniversary < loopStartDate) {
        firstAnniversary = addYears(firstAnniversary, 1);
    }

    while (loopStartDate <= endDate) {
      const anniversaryYear = loopStartDate.getFullYear();
      let periodEndDate: Date;
      let nextAnniversary = new Date(firstAnniversary);
       // Ensure nextAnniversary is in the future relative to loopStartDate
       while(nextAnniversary <= loopStartDate){
          nextAnniversary = addYears(nextAnniversary, 1);
       }
       
      if (nextAnniversary <= endDate) {
          periodEndDate = addDays(nextAnniversary, -1);
      } else {
          periodEndDate = endDate;
      }
      
      const monthsInPeriod = differenceInMonths(periodEndDate, loopStartDate);
      const daysInLastMonth = differenceInDays(periodEndDate, addDays(startOfMonth(periodEndDate), -1));
      const partialMonthFraction = daysInLastMonth / getDaysInMonth(periodEndDate);

      const totalMonthsForPeriod = monthsInPeriod + partialMonthFraction;

      const totalPeriodAmount = currentRate * 12;

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
