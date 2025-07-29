"use client";

import React from 'react';
import html2canvas from 'html2canvas';
import { type CalculatedReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportPreviewProps {
  report: CalculatedReport;
}

const getTimestamp = () => {
    const now = new Date();
    return `Generated on: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString()}`;
};

const getDisclaimer = () => {
    return "This report is system-generated via the SDC: Smart Decree Calculator and requires no signature.";
};

const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ur-PK-u-nu-latn', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export default function ReportPreview({ report }: ReportPreviewProps) {
  const reportRef = React.useRef<HTMLDivElement>(null);

  const printReport = () => {
    if (!reportRef.current) return;
    
    const printContent = reportRef.current.innerHTML;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ڈیکری رپورٹ</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
              @page { size: legal; margin: 0.5in; }
              body { 
                font-family: 'Noto Nastaliq Urdu', serif; 
                direction: rtl;
                margin: 0;
                padding: 0.5in;
                position: relative;
                min-height: 90vh;
              }
              .report-content { padding-bottom: 50px; }
              .footer-text {
                font-size: 10px;
                text-align: center;
                position: fixed;
                bottom: 0.5in;
                width: calc(100% - 1in);
                border-top: 1px solid #ccc;
                padding-top: 5px;
                font-family: Arial, sans-serif;
                direction: ltr;
              }
              h1, h2, h3, h4, p, td, th { font-family: 'Noto Nastaliq Urdu', serif; }
              .court-name { font-size: 16pt; font-weight: bold; text-align: center; }
              .case-title { font-size: 14pt; font-weight: bold; text-align: center; }
              .report-section-title { font-size: 13pt; font-weight: bold; text-align: center; margin: 16px 0; background-color: #f0f4f8; padding: 8px; border-radius: 4px;}
              p, li { font-size: 12pt; line-height: 1.8; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 11pt; page-break-inside: avoid; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              th { background-color: #f2f2f2; }
              .highlight { font-weight: bold; }
              .no-print { display: none; }
              .text-right { text-align: right; }
              .recipient-info { text-align: right; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="report-content">
                ${printContent}
            </div>
            <div class="footer-text">
                ${getDisclaimer()} | ${getTimestamp()}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const downloadImage = () => {
    if (!reportRef.current) return;
    const elementToCapture = reportRef.current.cloneNode(true) as HTMLDivElement;

    const footerDiv = document.createElement('div');
    footerDiv.style.fontSize = '10px';
    footerDiv.style.textAlign = 'center';
    footerDiv.style.borderTop = '1px solid #ddd';
    footerDiv.style.paddingTop = '5px';
    footerDiv.style.marginTop = '15px';
    footerDiv.style.fontFamily = 'Arial, sans-serif';
    footerDiv.style.direction = 'ltr';
    footerDiv.innerHTML = `<p>${getDisclaimer()} | ${getTimestamp()}</p>`;
    elementToCapture.appendChild(footerDiv);

    document.body.appendChild(elementToCapture);

    html2canvas(elementToCapture, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      onclone: (document) => {
        elementToCapture.style.padding = '20px';
        elementToCapture.style.width = '800px';
      }
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Decree_Report_${report.caseDetails.cmsNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(elementToCapture);
    });
  };

  const downloadPdf = () => {
    if (!reportRef.current) return;
    printReport();
  };

  const generatorLabel = report.reportGenerator.generatedBy === 'decree-holder' ? 'ڈگری ہولڈر' : 'ججمنٹ ڈیٹر';

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl">پیدا شدہ رپورٹ</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={reportRef} className="report-container p-4 bg-white text-black" style={{ fontSize: '12pt', lineHeight: 1.8 }}>
          <h1 className="court-name">{report.caseDetails.courtName}</h1>
          <h2 className="case-title">{report.caseDetails.partyA} بنام {report.caseDetails.partyB}</h2>
          <p className="text-center"><strong>کیس کیٹیگری:</strong> فیملی ایگزیکیوشن پٹیشن</p>
          <p className="text-center"><strong>CMS نمبر:</strong> {report.caseDetails.cmsNo}</p>
          <br/>
          <p className="text-right"><span className="highlight">رپورٹ تیار کنندہ:</span> {generatorLabel}</p>
          {report.reportGenerator.counselName && <p className="text-right"><span className="highlight">وکیل:</span> {report.reportGenerator.counselName}</p>}
          {report.partialSatisfaction && (
            <p className="highlight text-right">نوٹ: ڈیکری جزوی طور پر {formatDate(report.partialSatisfaction.date)} کو مطمئن ہو کر ریکارڈ روم میں داخل ہو گئی تھی۔ حسابات غیر ادا شدہ مدت {formatDate(report.partialSatisfaction.effectiveStartDate)} سے {formatDate(report.period.endDate)} تک کے ہیں۔</p>
          )}
          <hr className="my-4"/>
          <h3 className="report-section-title">ڈیکریٹل رقوم کی تفصیلی رپورٹ</h3>
          <p className="text-center"><span className="highlight">مدت:</span> {formatDate(report.period.startDate)} تا {formatDate(report.period.endDate)} ({report.period.periodDisplay})</p>
          
          <h3 className="report-section-title">نان و نفقہ کا حساب</h3>
          {report.recipientCalculations.map((rec, index) => (
            <div key={index} className="mb-6">
              <div className="recipient-info">
                  <h4 className="highlight">وصول کنندہ {index + 1}: {rec.name} ({rec.relationship})</h4>
                  <p>بنیادی رقم: {rec.baseAmount.toFixed(2)} PKR/ماہ</p>
                  <p>اضافہ کی قسم: {rec.increaseType === 'fixed' ? 'فکسڈ' : 'پروگریسو'} ({rec.yearlyIncrease}%)</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>سال</TableHead>
                    <TableHead>مدت</TableHead>
                    <TableHead>بنیادی رقم</TableHead>
                    <TableHead>اضافہ شدہ رقم</TableHead>
                    <TableHead>کل رقم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rec.yearlyBreakdown.map((year, yIndex) => (
                    <TableRow key={yIndex}>
                      <TableCell>{year.year}</TableCell>
                      <TableCell>{year.durationDisplay}</TableCell>
                      <TableCell>{year.basicAmount.toFixed(2)}</TableCell>
                      <TableCell>{year.increasedAmount.toFixed(2)}</TableCell>
                      <TableCell>{year.totalPeriod.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell colSpan={4} className="text-right">کل برائے {rec.name}</TableCell>
                    <TableCell>{rec.totalRecipientAmount.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-right highlight mt-2">موجودہ ماہانہ رقم: {rec.currentMonthAmount.toFixed(2)} PKR</p>
            </div>
          ))}

          {report.otherAmounts.length > 0 && <>
              <h3 className="report-section-title">دیگر ڈیکریٹل رقوم</h3>
              <Table>
                  <TableHeader><TableRow><TableHead className="text-right">تفصیل</TableHead><TableHead>رقم (PKR)</TableHead></TableRow></TableHeader>
                  <TableBody>
                      {report.otherAmounts.map((oa, i) => <TableRow key={i}><TableCell className="text-right">{oa.description}</TableCell><TableCell>{oa.amount.toFixed(2)}</TableCell></TableRow>)}
                  </TableBody>
              </Table>
          </>}

          {report.payments.length > 0 && <>
              <h3 className="report-section-title">وصول شدہ / جمع شدہ رقوم</h3>
              <Table>
                  <TableHeader><TableRow><TableHead>تاریخ</TableHead><TableHead>رقم (PKR)</TableHead>{report.reportGenerator.generatedBy === 'judgment-debtor' && <TableHead>وصول کنندہ</TableHead>}</TableRow></TableHeader>
                  <TableBody>
                      {report.payments.map((p, i) => (
                          <TableRow key={i}>
                              <TableCell>{formatDate(p.date)}</TableCell>
                              <TableCell>{p.amount.toFixed(2)}</TableCell>
                              {report.reportGenerator.generatedBy === 'judgment-debtor' && <TableCell>{p.receivedBy === 'decree-holder' ? 'ڈگری ہولڈر' : 'نمائندہ'}</TableCell>}
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </>}

          <h3 className="report-section-title">خلاصہ</h3>
          <Table>
            <TableBody>
              <TableRow><TableCell className="highlight text-right">کل نان و نفقہ کا خرچ</TableCell><TableCell>PKR {report.summary.grandTotalMaintenance.toFixed(2)}</TableCell></TableRow>
              <TableRow><TableCell className="highlight text-right">کل دیگر ڈیکریٹل رقوم</TableCell><TableCell>PKR {report.summary.totalOtherAmounts.toFixed(2)}</TableCell></TableRow>
              <TableRow className="bg-accent/20"><TableCell className="highlight text-right">ادائیگیوں سے پہلے کل ڈیکریٹل رقم</TableCell><TableCell>PKR {report.summary.totalDecretalAmountBeforePayments.toFixed(2)}</TableCell></TableRow>
              <TableRow><TableCell className="highlight text-right">کل ادا شدہ رقم</TableCell><TableCell>PKR {report.summary.totalPayments.toFixed(2)}</TableCell></TableRow>
              <TableRow className="bg-primary/20 text-lg font-bold"><TableCell className="highlight text-right">حتمی بقایا ڈیکریٹل رقم</TableCell><TableCell>PKR {report.summary.finalOutstandingAmount.toFixed(2)}</TableCell></TableRow>
            </TableBody>
          </Table>

        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 no-print">
            <Button onClick={downloadPdf} className="flex-1">PDF کے طور پر محفوظ کریں</Button>
            <Button onClick={printReport} className="flex-1">رپورٹ پرنٹ کریں</Button>
            <Button onClick={downloadImage} className="flex-1">تصویر ڈاؤن لوڈ کریں</Button>
        </div>

      </CardContent>
    </Card>
  );
}
