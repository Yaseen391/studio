"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { SdcLogo } from '@/components/icons/SdcLogo';

const pinSchema = z.object({
  pin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
});

type PinFormValues = z.infer<typeof pinSchema>;

export default function PinEntry() {
  const { checkPin, user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '' },
  });

  const onSubmit = (data: PinFormValues) => {
    if (!checkPin(data.pin)) {
      toast({
        variant: 'destructive',
        title: 'غلط پن',
        description: 'درج کردہ پن غلط ہے۔ براہ کرم دوبارہ کوشش کریں۔',
      });
      form.reset();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4" dir="ltr">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <SdcLogo className="w-24 h-24" />
          </div>
          <CardTitle className="text-2xl">خوش آمدید, {user?.name}!</CardTitle>
          <CardDescription>
            ایپ تک رسائی کے لیے براہ کرم اپنا پن درج کریں۔
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4 ہندسوں کا پن</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="****"
                        {...field}
                        className="text-center text-2xl tracking-[1rem]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                داخل ہوں
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Link href="/forgot-pin" passHref>
              <Button variant="link">پن بھول گئے؟</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
