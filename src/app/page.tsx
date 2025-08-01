
"use client";

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Edit, Eye, Plus, Trash2, Upload, Files, Scale, Calculator, Settings, LogOut } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import PinEntry from '@/components/PinEntry';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { reports, isLoading, deleteReport, importReports, importReport } = useReports();
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
  
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/setup');
    }
  }, [user, isAuthLoading, router]);
  
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
          if(results.length === 1 && Array.isArray(results[0])) {
            const reportsToImport = results[0];
            if(importReports(reportsToImport)) {
               toast({ title: "کامیابی", description: `${reportsToImport.length} رپورٹس کامیابی سے درآمد ہو گئیں۔` });
            } else {
               toast({ variant: "destructive", title: "خرابی", description: "کچھ رپورٹس درآمد نہیں ہو سکیں۔" });
            }
          } else { 
            if(importReports(results as any[])) {
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
    if (reports.length === 0) {
        toast({
            variant: "destructive",
            title: "کوئی رپورٹ نہیں",
            description: "ڈاؤن لوڈ کرنے کے لئے کوئی رپورٹس نہیں ہیں۔",
        });
        return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reports, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `all-sdc-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };
  
  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen"> لوڈ ہو رہا ہے...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  if (!isAuthenticated) {
     return <PinEntry />;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-headline font-bold flex items-center gap-4">
          <Calculator className="w-10 h-10" />
          سمارٹ ڈگری کیلکولیٹر
          <Scale className="w-10 h-10" />
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-8 h-8" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>ترتیبات اور اختیارات</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.designation}</p>
                  </div>
                </div>
                 <Separator className="my-4" />
                <div className="grid gap-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => singleFileInputRef.current?.click()}>
                        <Upload className="ml-2 h-5 w-5" /> رپورٹ اپ لوڈ کریں
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => multipleFileInputRef.current?.click()}>
                        <Files className="ml-2 h-5 w-5" /> تمام رپورٹس اپ لوڈ کریں
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={downloadAllReports}>
                        <Download className="ml-2 h-5 w-5" /> تمام رپورٹس ڈاؤن لوڈ کریں
                    </Button>
                </div>
                <Separator className="my-4" />
                <Button variant="destructive" className="w-full" onClick={() => {
                    logout();
                    router.push('/setup');
                }}>
                  <LogOut className="ml-2 h-5 w-5" /> لاگ آؤٹ
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </header>

      <div className="mb-8">
        <Link href="/report/new" passHref>
           <Button className="w-full sm:w-auto" size="lg"><Plus className="ml-2 h-5 w-5" /> نئی رپورٹ بنائیں</Button>
        </Link>
      </div>
      
      <input type="file" ref={singleFileInputRef} onChange={handleSingleFileUpload} className="hidden" accept=".json" />
      <input type="file" ref={multipleFileInputRef} onChange={handleMultipleFilesUpload} className="hidden" accept=".json" multiple />

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
