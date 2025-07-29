import { type z } from 'zod';
import { type reportSchema } from '@/lib/validators';

export type Recipient = {
  id: string;
  name: string;
  relationship: string;
  amount: number;
};

export type OtherAmount = {
  id: string;
  description: string;
  amount: number;
};

export type Payment = {
  id: string;
  date: Date;
  amount: number;
  receivedBy?: 'decree-holder' | 'representative';
};

export type Report = z.infer<typeof reportSchema> & {
  id: string;
  createdAt: string;
};

export type YearlyBreakdown = {
  year: string;
  startDate: Date;
  endDate: Date;
  basicAmount: number;
  increasedAmount: number;
  durationDisplay: string;
  totalPeriod: number;
};

export type RecipientCalculation = {
  name: string;
  relationship: string;
  baseAmount: number;
  increaseType: 'progressive' | 'fixed';
  yearlyIncrease: number;
  totalRecipientAmount: number;
  currentMonthAmount: number;
  yearlyBreakdown: YearlyBreakdown[];
};

export type CalculatedReport = {
  caseDetails: {
    courtName: string;
    partyA: string;
    partyB: string;
    cmsNo: string;
  };
  reportGenerator: {
    generatedBy: 'decree-holder' | 'judgment-debtor';
    counselName: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
    periodDisplay: string;
  };
  partialSatisfaction?: {
    date: Date;
    effectiveStartDate: Date;
  };
  recipientCalculations: RecipientCalculation[];
  otherAmounts: Omit<OtherAmount, 'id'>[];
  payments: Omit<Payment, 'id'>[];
  summary: {
    grandTotalMaintenance: number;
    totalOtherAmounts: number;
    totalDecretalAmountBeforePayments: number;
    totalPayments: number;
    finalOutstandingAmount: number;
  };
  createdAt: Date;
};
