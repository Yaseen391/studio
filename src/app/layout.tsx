import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import ScrollButtons from '@/components/ScrollButtons';

const APP_NAME = "SDC: Smart Decree Calculator";
const APP_DESCRIPTION = "A smart calculator for decree amounts in family court cases.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "SDC: اسمارٹ ڈیکری کیلکولیٹر",
    template: `%s - ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#79A6D2",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ur" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <ScrollButtons />
      </body>
    </html>
  );
}
