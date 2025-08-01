"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { SdcLogo } from '@/components/icons/SdcLogo';
import { CnicInput } from '@/components/CnicInput';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const setupSchema = z.object({
  name: z.string().min(1, "نام درکار ہے۔"),
  designation: z.string().min(1, "عہدہ درکار ہے۔"),
  pin: z.string().regex(/^\d{4}$/, "پن 4 ہندسوں کا ہونا چاہیے۔"),
  cnic: z.string().min(15, "CNIC must be 13 digits.").max(15, "CNIC must be 13 digits.")
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const router = useRouter();
  const { user, isAuthLoading, setupUser } = useAuth();
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: '',
      designation: '',
      pin: '',
      cnic: '',
    },
  });

  const onSubmit = (data: SetupFormValues) => {
    setupUser(data);
    toast({
      title: 'سیٹ اپ مکمل',
      description: 'آپ کا پروفائل کامیابی سے بن گیا ہے۔',
    });
    router.push('/');
  };

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen">لوڈ ہو رہا ہے...</div>;
  }
  
  if(user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4" dir="ltr">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4">
             <SdcLogo className="w-24 h-24" />
          </div>
          <CardTitle className="text-2xl">ایپ سیٹ اپ</CardTitle>
          <CardDescription>
            جاری رکھنے سے پہلے براہ کرم اپنا پروفائل سیٹ اپ کریں۔
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام</FormLabel>
                    <FormControl>
                      <Input placeholder="آپ کا نام" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عہدہ</FormLabel>
                    <FormControl>
                      <Input placeholder="آپ کا عہدہ" {...field} />
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
                    <FormLabel>4 ہندسوں کا پن</FormLabel>
                    <FormControl>
                      <Input type="password" inputMode="numeric" maxLength={4} placeholder="****" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <span>CNIC نمبر</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>اگر آپ اپنا پن بھول جاتے ہیں تو CNIC نمبر پن کو تبدیل کرنے کے لیے ضروری ہوگا۔</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                       <CnicInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">سیٹ اپ مکمل کریں</Button>
            </form>
          </Form>
        </CardContent>
        {deferredPrompt && (
          <CardFooter className="flex-col gap-2">
            <p className="text-sm text-center text-muted-foreground">بہترین تجربے کے لیے، اس ایپ کو انسٹال کریں۔</p>
            <Button onClick={handleInstallClick} className="w-full">ایپ انسٹال کریں</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
