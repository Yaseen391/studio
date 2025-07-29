import { differenceInDays, addDays, addYears, format, differenceInMonths, getDaysInMonth, startOfMonth, endOfMonth, isSameDay, addMonths } from 'date-fns';
import { type Report, type CalculatedReport, type YearlyBreakdown, type RecipientCalculation, type OtherAmount, type Payment } from './types';

function getPeriodDisplay(startDate: Date, endDate: Date): string {
    if (endDate < startDate) return "0 مہینے";

    const inclusiveEndDate = addDays(endDate, 1);
    let totalMonths = differenceInMonths(inclusiveEndDate, startDate);
    let tempDate = addYears(startDate, Math.floor(totalMonths / 12));
    tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + (totalMonths % 12), tempDate.getDate());
    
    let daysDiff = differenceInDays(inclusiveEndDate, tempDate);
    
    if (daysDiff >= getDaysInMonth(tempDate)) {
        totalMonths++;
        daysDiff = 0;
    }

    if (daysDiff === 0 && totalMonths > 0) {
        return `${totalMonths} مہینے`;
    }
    
    const dayPart = daysDiff > 0 ? `${daysDiff} دن` : '';
    const monthPart = totalMonths > 0 ? `${totalMonths} مہینے` : '';
    
    return [monthPart, dayPart].filter(Boolean).join(', ');
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
    
    if (partiallySatisfied && partialSatisfactionDate && partialSatisfactionDate > startDate) {
        let yearsPassed = differenceInMonths(partialSatisfactionDate, startDate) / 12;
        if (increaseType === 'progressive') {
            currentRate = baseAmount * Math.pow((1 + yearlyIncrease / 100), Math.floor(yearsPassed));
        } else {
            currentRate = baseAmount + (baseAmount * (yearlyIncrease / 100) * Math.floor(yearsPassed));
        }
    }

    let loopStartDate = new Date(effectiveStartDate);

    while (loopStartDate <= endDate) {
      const anniversaryYearStartDate = new Date(startDate.getFullYear() + (loopStartDate.getFullYear() - startDate.getFullYear()), startDate.getMonth(), startDate.getDate());
      
      let nextAnniversary = new Date(anniversaryYearStartDate);
      if (nextAnniversary <= loopStartDate) {
          nextAnniversary = addYears(nextAnniversary, 1);
      }

      const periodEndDate = new Date(Math.min(endDate.getTime(), addDays(nextAnniversary, -1).getTime()));

      const months = differenceInMonths(periodEndDate, loopStartDate);
      const daysInPeriod = differenceInDays(periodEndDate, addMonths(loopStartDate, months)) + 1;
      const daysInMonth = getDaysInMonth(periodEndDate);

      const periodDuration = months + (daysInPeriod / daysInMonth);
      const totalPeriodAmount = currentRate * periodDuration;
      
      totalRecipientAmount += totalPeriodAmount;
      
      yearlyBreakdown.push({
        year: `${yearlyBreakdown.length + 1} سال`,
        startDate: new Date(loopStartDate),
        endDate: new Date(periodEndDate),
        basicAmount: baseAmount,
        increasedAmount: currentRate,
        durationDisplay: getPeriodDisplay(loopStartDate, periodEndDate),
        totalPeriod: totalPeriodAmount,
      });

      loopStartDate = addDays(periodEndDate, 1);
      
      if (loopStartDate <= endDate) {
          if (increaseType === 'progressive') {
            currentRate *= (1 + yearlyIncrease / 100);
          } else { 
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
