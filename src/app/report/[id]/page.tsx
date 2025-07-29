"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useReports } from '@/hooks/use-reports';
import { useToast } from '@/hooks/use-toast';
import ReportForm from '@/components/ReportForm';
import { SdcLogo } from '@/components/icons/SdcLogo';
import { type Report } from '@/lib/types';
import ReportPreview from '@/components/ReportPreview';
import { calculateDecree } from '@/lib/calculator';
import { Button } from '@/components/ui/button';

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { getReportById, addReport, updateReport, isLoading } = useReports();
  const [report, setReport] = useState<Report | undefined>(undefined);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = id === 'new';

  useEffect(() => {
    if (!isLoading && !isNew) {
      const foundReport = getReportById(id);
      setReport(foundReport);
      if (searchParams.get('preview') === 'true' && foundReport) {
        setIsReadOnly(true);
      }
    }
  }, [id, isLoading, isNew, getReportById, searchParams]);

  const handleSave = (data: Report) => {
    if (isNew) {
      addReport(data);
      toast({
        title: 'کامیابی',
        description: 'رپورٹ کامیابی سے بنائی گئی۔',
      });
    } else {
      updateReport(data);
      toast({
        title: 'کامیابی',
        description: 'رپورٹ کامیابی سے اپ ڈیٹ ہو گئی۔',
      });
    }
    // Don't navigate away, stay to show the preview
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading && !isNew) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <SdcLogo className="w-24 h-24 mb-4 animate-pulse" />
            <p>رپورٹ لوڈ ہو رہی ہے...</p>
        </div>
    );
  }

  if (!isNew && !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold">رپورٹ نہیں ملی</h2>
          <Button onClick={() => router.push('/')} className="mt-4">ڈیش بورڈ پر واپس جائیں</Button>
      </div>
    );
  }

  const pageTitle = isNew ? 'نئی ڈیکری رپورٹ بنائیں' : `رپورٹ میں ترمیم کریں: ${report?.partyA || ''} بنام ${report?.partyB || ''}`;
  
  if (isReadOnly && report) {
      const calculatedData = calculateDecree(report);
      return (
        <main className="container mx-auto p-4 md:p-8">
            <header className="flex flex-col items-center text-center mb-8">
                <h1 className="text-4xl font-headline font-bold">{pageTitle}</h1>
            </header>
            <ReportPreview report={calculatedData} />
            <div className="flex justify-center mt-8">
                <Button onClick={() => router.push('/')} className="mt-4">ڈیش بورڈ پر واپس جائیں</Button>
            </div>
        </main>
      );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl font-headline font-bold">{pageTitle}</h1>
      </header>
      <ReportForm 
        initialData={report} 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </main>
  );
}
