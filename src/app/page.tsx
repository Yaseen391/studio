"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SdcLogo } from '@/components/icons/SdcLogo';
import { Download, Edit, Eye, Plus, Trash2, Upload } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { reports, isLoading, deleteReport, importReport } = useReports();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const reportData = JSON.parse(content);
            if(importReport(reportData)) {
              toast({
                title: "کامیابی",
                description: "رپورٹ کامیابی سے درآمد ہوگئی۔",
              });
            } else {
              throw new Error("Invalid file format");
            }
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "خرابی",
            description: "رپورٹ درآمد کرنے میں ناکامی۔ فائل خراب یا غلط فارمیٹ میں ہوسکتی ہے۔",
          });
        }
      };
      reader.readAsText(file);
    }
  };
  
  const downloadReport = (report: any) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `report-${report.cmsNo || report.id}.json`;
    link.click();
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col items-center text-center mb-8">
        <SdcLogo className="w-24 h-24 mb-4" />
        <h1 className="text-4xl font-headline font-bold">ایس ڈی سی: اسمارٹ ڈیکری کیلکولیٹر</h1>
        <p className="text-muted-foreground mt-2">اپنی ڈیکری کی رقوم کا حساب لگائیں، محفوظ کریں اور ان کا نظم کریں</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href="/report/new" passHref legacyBehavior>
          <Button className="flex-1" size="lg"><Plus className="ml-2 h-5 w-5" /> نئی رپورٹ بنائیں</Button>
        </Link>
        <Button variant="outline" className="flex-1" size="lg" onClick={() => fileInputRef.current?.click()}>
          <Upload className="ml-2 h-5 w-5" /> رپورٹ اپ لوڈ کریں (.json)
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>محفوظ شدہ رپورٹس</CardTitle>
          <CardDescription>یہاں آپ کی تمام پہلے سے تیار کردہ رپورٹس ہیں۔</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>لوڈ ہو رہا ہے...</p>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>نمبر شمار</TableHead>
                    <TableHead>عنوان مقدمہ</TableHead>
                    <TableHead>CMS نمبر</TableHead>
                    <TableHead className="text-left">کارروائیاں</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report, index) => (
                    <TableRow key={report.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{report.partyA} بنام {report.partyB}</TableCell>
                        <TableCell>{report.cmsNo}</TableCell>
                        <TableCell>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/report/${report.id}?preview=true`)} title="دیکھیں">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/report/${report.id}`)} title="ترمیم کریں">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => downloadReport(report)} title="ڈاؤن لوڈ">
                                <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="حذف کریں">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>کیا آپ کو یقین ہے؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        یہ عمل واپس نہیں لیا جا سکتا۔ یہ اس رپورٹ کو مستقل طور پر حذف کر دے گا۔
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>منسوخ کریں</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteReport(report.id)} className="bg-destructive hover:bg-destructive/90">حذف کریں</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">کوئی رپورٹ نہیں ملی۔</p>
              <Link href="/report/new" passHref legacyBehavior>
                  <Button className="mt-4">اپنی پہلی رپورٹ بنائیں</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
