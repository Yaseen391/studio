import { z } from 'zod';

const requiredString = z.string({ required_error: "یہ خانہ خالی نہیں چھوڑا جا سکتا" }).min(1, "یہ خانہ خالی نہیں چھوڑا جا سکتا");

export const reportSchema = z.object({
  courtName: requiredString,
  partyA: requiredString,
  partyB: requiredString,
  cmsNo: requiredString,
  reportGenerator: z.enum(['decree-holder', 'judgment-debtor'], { required_error: "براہ کرم منتخب کریں" }),
  counselName: z.string().optional(),
  startDate: z.date({ required_error: "براہ کرم تاریخ منتخب کریں" }),
  endDate: z.date({ required_error: "براہ کرم تاریخ منتخب کریں" }),
  recipients: z.array(z.object({
    id: z.string(),
    name: requiredString,
    relationship: requiredString,
    amount: z.number({ required_error: "رقم ڈالیں", invalid_type_error: "رقم ڈالیں"}).min(1, "رقم 0 سے زیادہ ہونی چاہیے"),
  })).min(1, "کم از کم ایک وصول کنندہ شامل کریں"),
  yearlyIncrease: z.number().optional().default(0),
  increaseType: z.enum(['progressive', 'fixed']),
  otherAmounts: z.array(z.object({
    id: z.string(),
    description: z.string(),
    amount: z.number().optional(),
  })).optional(),
  payments: z.array(z.object({
    id: z.string(),
    date: z.date().optional(),
    amount: z.number().optional(),
    receivedBy: z.enum(['decree-holder', 'representative']).optional(),
  })).optional(),
  partiallySatisfied: z.boolean(),
  partialSatisfactionDate: z.date().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: "اختتامی تاریخ آغاز کی تاریخ کے بعد ہونی چاہیے",
  path: ["endDate"],
})
.refine(data => {
  if (data.partiallySatisfied) {
    return !!data.partialSatisfactionDate;
  }
  return true;
}, {
  message: "جزوی اطمینان کی تاریخ درکار ہے",
  path: ["partialSatisfactionDate"],
})
.refine(data => {
    if (data.partiallySatisfied && data.partialSatisfactionDate) {
        return data.partialSatisfactionDate > data.startDate && data.partialSatisfactionDate < data.endDate;
    }
    return true;
}, {
    message: "جزوی اطمینان کی تاریخ آغاز اور اختتامی تاریخ کے درمیان ہونی چاہیے",
    path: ["partialSatisfactionDate"],
});
