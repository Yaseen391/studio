"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Edit, Eye, Plus, Trash2, Upload, Files, Calculator, Scale } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { reports, isLoading, deleteReport, importReports, importReport } = useReports();
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSingleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleMultipleFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const readers = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result;
              if (typeof content === 'string') {
                const reportData = JSON.parse(content);
                resolve(reportData);
              }
            } catch (error) {
              reject(new Error(`File ${file.name} is corrupted.`));
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read file ${file.name}.`));
          reader.readAsText(file);
        });
      });

      Promise.all(readers)
        .then(results => {
          // Handle single file with array of reports
          if(results.length === 1 && Array.isArray(results[0])) {
            const reportsToImport = results[0];
            if(importReports(reportsToImport)) {
               toast({ title: "کامیابی", description: `${reportsToImport.length} رپورٹس کامیابی سے درآمد ہو گئیں۔` });
            } else {
               toast({ variant: "destructive", title: "خرابی", description: "کچھ رپورٹس درآمد نہیں ہو سکیں۔" });
            }
          } else { // Handle multiple report files
            if(importReports(results)) {
               toast({ title: "کامیابی", description: `${results.length} رپورٹس کامیابی سے درآمد ہو گئیں۔` });
            } else {
               toast({ variant: "destructive", title: "خرابی", description: "کچھ رپورٹس درآمد نہیں ہو سکیں۔" });
            }
          }
        })
        .catch(error => {
          toast({ variant: "destructive", title: "خرابی", description: error.message });
        });
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

  const downloadAllReports = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reports, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `all-sdc-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };


  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl font-headline font-bold flex items-center gap-4">
          <Calculator className="w-10 h-10" />
          سمارٹ ڈگری کیلکولیٹر
          <Scale className="w-10 h-10" />
        </h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/report/new" passHref>
           <Button className="w-full" size="lg"><Plus className="ml-2 h-5 w-5" /> نئی رپورٹ بنائیں</Button>
        </Link>
        <Button variant="outline" className="w-full" size="lg" onClick={() => singleFileInputRef.current?.click()}>
          <Upload className="ml-2 h-5 w-5" /> رپورٹ اپ لوڈ کریں
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={() => multipleFileInputRef.current?.click()}>
          <Files className="ml-2 h-5 w-5" /> تمام رپورٹس اپ لوڈ کریں
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={downloadAllReports}>
          <Download className="ml-2 h-5 w-5" /> تمام رپورٹس ڈاؤن لوڈ کریں
        </Button>
        <input type="file" ref={singleFileInputRef} onChange={handleSingleFileUpload} className="hidden" accept=".json" />
        <input type="file" ref={multipleFileInputRef} onChange={handleMultipleFilesUpload} className="hidden" accept=".json" multiple />
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
                    <TableHead className="text-center">نمبر شمار</TableHead>
                    <TableHead className="text-center">عنوان مقدمہ</TableHead>
                    <TableHead className="text-center">CMS نمبر</TableHead>
                    <TableHead className="text-center">کارروائیاں</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report, index) => (
                    <TableRow key={report.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="text-center">{report.partyA} بنام {report.partyB}</TableCell>
                        <TableCell className="text-center">{report.cmsNo}</TableCell>
                        <TableCell>
                        <div className="flex gap-2 justify-center">
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
              <Link href="/report/new" passHref>
                  <Button className="mt-4">اپنی پہلی رپورٹ بنائیں</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
