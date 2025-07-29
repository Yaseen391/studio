"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { reportSchema } from '@/lib/validators';
import { type Report, type CalculatedReport } from '@/lib/types';
import { calculateDecree } from '@/lib/calculator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import ReportPreview from './ReportPreview';

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFormProps {
  initialData?: Report;
  onSave: (data: Report) => void;
  onCancel: () => void;
}

const formatDateForInput = (date: Date) => {
    return date.toLocaleDateString('ur-PK-u-nu-latn', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function ReportForm({ initialData, onSave, onCancel }: ReportFormProps) {
  const [calculatedReport, setCalculatedReport] = useState<CalculatedReport | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData ? {
      ...initialData,
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
      partialSatisfactionDate: initialData.partialSatisfactionDate ? new Date(initialData.partialSatisfactionDate) : undefined,
      payments: initialData.payments?.map(p => ({...p, date: p.date ? new Date(p.date) : undefined}))
    } : {
      courtName: '',
      partyA: '',
      partyB: '',
      cmsNo: '',
      counselName: '',
      increaseType: 'progressive',
      yearlyIncrease: 10,
      recipients: [{ id: uuidv4(), name: '', relationship: '', amount: 0 }],
      otherAmounts: [{ id: uuidv4(), description: '', amount: undefined }],
      payments: [],
      partiallySatisfied: false,
    },
  });

  const { fields: recipientFields, append: appendRecipient, remove: removeRecipient } = useFieldArray({
    control: form.control,
    name: "recipients",
  });

  const { fields: otherAmountFields, append: appendOtherAmount, remove: removeOtherAmount } = useFieldArray({
    control: form.control,
    name: "otherAmounts",
  });
  
  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const watchReportGenerator = form.watch('reportGenerator');
  const watchPartiallySatisfied = form.watch('partiallySatisfied');

  const onSubmit = (data: ReportFormValues) => {
    const result = calculateDecree(data);
    setCalculatedReport(result);
    onSave({
      ...data,
      id: initialData?.id || uuidv4(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
  };
  
  const resetForm = () => {
    form.reset();
    setCalculatedReport(null);
  }

  const sections = [
    { title: "0. کیس کی تفصیلات", content: <CaseDetailsForm form={form} /> },
    { title: "1. رپورٹ جنریٹر", content: <ReportGeneratorForm form={form} /> },
    { title: "2. حساب کی مدت", content: <CalculationPeriodForm form={form} /> },
    { title: "3. دیکھ بھال کے وصول کنندگان", content: <MaintenanceRecipientsForm form={form} fields={recipientFields} append={appendRecipient} remove={removeRecipient} /> },
    { title: "4. اضافہ کی ترتیبات", content: <IncreaseSettingsForm form={form} /> },
    { title: "5. دیگر ڈیکریٹل رقوم", content: <OtherDecretalAmountsForm form={form} fields={otherAmountFields} append={appendOtherAmount} remove={removeOtherAmount} /> },
    ...(watchReportGenerator ? [{ title: "6. وصول شدہ/جمع شدہ رقوم", content: <PaymentsForm form={form} fields={paymentFields} append={appendPayment} remove={removePayment} reportGenerator={watchReportGenerator} /> }] : []),
    { title: "7. جزوی طور پر مطمئن ڈیکری", content: <PartialSatisfactionForm form={form} partiallySatisfied={watchPartiallySatisfied} /> },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Accordion type="multiple" defaultValue={["item-0", "item-1", "item-2", "item-3"]} className="w-full">
          {sections.map((section, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="bg-primary/10 px-4 rounded-t-md">{section.title}</AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" className="flex-1">کل حساب لگائیں</Button>
          <Button type="button" variant="outline" onClick={resetForm} className="flex-1">فارم ری سیٹ کریں</Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">منسوخ کریں</Button>
        </div>
      </form>
      {calculatedReport && <ReportPreview report={calculatedReport} />}
    </Form>
  );
}

// Sub-components for form sections

const CaseDetailsForm = ({ form }: { form: any }) => (
  <div className="space-y-4">
    <FormField control={form.control} name="courtName" render={({ field }) => (
      <FormItem>
        <FormLabel>عدالت کا نام</FormLabel>
        <FormControl>
          <Input placeholder="مثلاً بعدالت جناب ربنواز قاری صاحب جج فیملی کورٹ کبیروالا" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
    <div className="flex items-center gap-2">
      <FormField control={form.control} name="partyA" render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Input placeholder="مثلاً مسماۃ فاطمہ بی بی" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <span>بنام</span>
      <FormField control={form.control} name="partyB" render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Input placeholder="مثلاً محمد علی" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
    <p>کیس کیٹیگری: فیملی ایگزیکیوشن پٹیشن</p>
    <FormField control={form.control} name="cmsNo" render={({ field }) => (
      <FormItem>
        <FormLabel>CMS نمبر</FormLabel>
        <FormControl>
          <Input placeholder="CMS نمبر درج کریں" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </div>
);

const ReportGeneratorForm = ({ form }: { form: any }) => (
    <div className="space-y-4">
        <FormField control={form.control} name="reportGenerator" render={({ field }) => (
            <FormItem>
                <FormLabel>رپورٹ تیار کنندہ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="منتخب کریں"/>
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="decree-holder">ڈگری ہولڈر</SelectItem>
                        <SelectItem value="judgment-debtor">ججمنٹ ڈیٹر</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage/>
            </FormItem>
        )}/>
        <FormField control={form.control} name="counselName" render={({ field }) => (
            <FormItem>
                <FormLabel>وکیل کا نام (اختیاری)</FormLabel>
                <FormControl>
                    <Input placeholder="وکیل کا نام درج کریں" {...field} />
                </FormControl>
                <FormMessage/>
            </FormItem>
        )}/>
    </div>
);


const CalculationPeriodForm = ({ form }: { form: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField control={form.control} name="startDate" render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>آغاز کی تاریخ</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                <CalendarIcon className="ml-2 h-4 w-4" />
                {field.value ? formatDateForInput(field.value) : <span>تاریخ منتخب کریں</span>}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )} />
    <FormField control={form.control} name="endDate" render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>اختتام کی تاریخ</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                <CalendarIcon className="ml-2 h-4 w-4" />
                {field.value ? formatDateForInput(field.value) : <span>تاریخ منتخب کریں</span>}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )} />
  </div>
);

const MaintenanceRecipientsForm = ({ form, fields, append, remove }: { form: any, fields: any[], append: any, remove: any }) => (
  <div className="space-y-4">
    {fields.map((field, index) => (
      <Card key={field.id} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <FormField control={form.control} name={`recipients.${index}.name`} render={({ field }) => (
            <FormItem>
              <FormLabel>نام</FormLabel>
              <FormControl><Input placeholder="نام" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`recipients.${index}.relationship`} render={({ field }) => (
            <FormItem>
              <FormLabel>رشتہ</FormLabel>
              <FormControl><Input placeholder="رشتہ" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`recipients.${index}.amount`} render={({ field }) => (
            <FormItem>
              <FormLabel>ماہانہ رقم (PKR)</FormLabel>
              <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 ml-2" /> حذف کریں</Button>
      </Card>
    ))}
    <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), name: '', relationship: '', amount: 0 })}>
      <PlusCircle className="h-4 w-4 ml-2" /> وصول کنندہ شامل کریں
    </Button>
  </div>
);

const IncreaseSettingsForm = ({ form }: { form: any }) => (
  <div className="space-y-4">
    <FormField control={form.control} name="yearlyIncrease" render={({ field }) => (
      <FormItem>
        <FormLabel>سالانہ اضافہ (%)</FormLabel>
        <FormControl><Input type="number" placeholder="مثلاً 10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
    <FormField control={form.control} name="increaseType" render={({ field }) => (
      <FormItem>
        <FormLabel>اضافہ کی قسم</FormLabel>
        <FormControl>
          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
            <FormItem className="flex items-center space-x-2 space-x-reverse">
              <FormControl><RadioGroupItem value="progressive" /></FormControl>
              <FormLabel className="font-normal">پروگریسو (مرکب)</FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2 space-x-reverse">
              <FormControl><RadioGroupItem value="fixed" /></FormControl>
              <FormLabel className="font-normal">فکسڈ (ابتدائی رقم کا فلیٹ٪)</FormLabel>
            </FormItem>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </div>
);

const OtherDecretalAmountsForm = ({ form, fields, append, remove }: { form: any, fields: any[], append: any, remove: any }) => (
  <div className="space-y-4">
    {fields.map((field, index) => (
      <Card key={field.id} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <FormField control={form.control} name={`otherAmounts.${index}.description`} render={({ field }) => (
            <FormItem>
              <FormLabel>تفصیل</FormLabel>
              <FormControl><Input placeholder="مثلاً جہیز، سونا، عدت" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`otherAmounts.${index}.amount`} render={({ field }) => (
            <FormItem>
              <FormLabel>رقم (PKR)</FormLabel>
              <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 ml-2" /> حذف کریں</Button>
      </Card>
    ))}
    <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), description: '', amount: undefined })}>
      <PlusCircle className="h-4 w-4 ml-2" /> دیگر رقم شامل کریں
    </Button>
  </div>
);

const PaymentsForm = ({ form, fields, append, remove, reportGenerator }: { form: any, fields: any[], append: any, remove: any, reportGenerator: 'decree-holder' | 'judgment-debtor' }) => (
  <div className="space-y-4">
    {fields.map((field, index) => (
      <Card key={field.id} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <FormField control={form.control} name={`payments.${index}.date`} render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>تاریخ</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {field.value ? formatDateForInput(field.value) : <span>تاریخ منتخب کریں</span>}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name={`payments.${index}.amount`} render={({ field }) => (
                <FormItem>
                    <FormLabel>رقم (PKR)</FormLabel>
                    <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            {reportGenerator === 'judgment-debtor' && (
                <FormField control={form.control} name={`payments.${index}.receivedBy`} render={({ field }) => (
                    <FormItem>
                        <FormLabel>وصول کنندہ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="منتخب کریں" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="decree-holder">ڈگری ہولڈر</SelectItem>
                                <SelectItem value="representative">نمائندہ</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            )}
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 ml-2" /> حذف کریں</Button>
      </Card>
    ))}
    <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), date: undefined, amount: undefined, receivedBy: 'decree-holder' })}>
      <PlusCircle className="h-4 w-4 ml-2" /> رقم شامل کریں
    </Button>
  </div>
);

const PartialSatisfactionForm = ({ form, partiallySatisfied }: { form: any, partiallySatisfied: boolean }) => (
  <div className="space-y-4">
    <FormField control={form.control} name="partiallySatisfied" render={({ field }) => (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 space-x-reverse">
        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>کیا ڈیکری جزوی طور پر مطمئن ہو کر ریکارڈ روم میں داخل ہو گئی تھی؟</FormLabel>
        </div>
      </FormItem>
    )} />
    {partiallySatisfied && (
      <FormField control={form.control} name="partialSatisfactionDate" render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>جزوی اطمینان کی تاریخ</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="ml-2 h-4 w-4"/>
                            {field.value ? formatDateForInput(field.value) : <span>تاریخ منتخب کریں</span>}
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                </PopoverContent>
            </Popover>
          <FormMessage />
        </FormItem>
      )} />
    )}
  </div>
);
