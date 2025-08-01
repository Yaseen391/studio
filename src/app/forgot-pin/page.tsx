"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { SdcLogo } from '@/components/icons/SdcLogo';
import { CnicInput } from '@/components/CnicInput';

const forgotPinSchema = z.object({
  cnic: z.string().min(15, "CNIC is required and must be 13 digits.").max(15),
  pin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
});

type ForgotPinFormValues = z.infer<typeof forgotPinSchema>;

export default function ForgotPinPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<ForgotPinFormValues>({
    resolver: zodResolver(forgotPinSchema),
    defaultValues: { cnic: '', pin: '' },
  });
  
  const onSubmit = (data: ForgotPinFormValues) => {
    if (user && user.cnic === data.cnic) {
      updateUser({ ...user, pin: data.pin });
      toast({
        title: 'کامیابی',
        description: 'آپ کا پن کامیابی سے تبدیل ہو گیا ہے۔',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'خرابی',
        description: 'CNIC نمبر درست نہیں ہے۔',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4" dir="ltr">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <SdcLogo className="w-24 h-24" />
          </div>
          <CardTitle className="text-2xl">پن بھول گئے</CardTitle>
          <CardDescription>اپنا پن دوبارہ ترتیب دینے کے لئے اپنا CNIC نمبر درج کریں۔</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cnic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC نمبر</FormLabel>
                    <FormControl>
                        <CnicInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نیا 4 ہندسوں کا پن</FormLabel>
                    <FormControl>
                      <Input type="password" maxLength={4} placeholder="****" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">پن تبدیل کریں</Button>
            </form>
          </Form>
           <Button variant="link" onClick={() => router.push('/')} className="mt-4 w-full">
              واپس لاگ ان پر جائیں
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
