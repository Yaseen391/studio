"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Report } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { reportSchema } from '@/lib/validators';
import { useAuth } from './use-auth';

const STORAGE_KEY = 'sdc-reports';

const isServer = typeof window === 'undefined';

const parseReportDates = (report: any): Report => {
    return {
        ...report,
        startDate: new Date(report.startDate),
        endDate: new Date(report.endDate),
        createdAt: report.createdAt,
        partialSatisfactionDate: report.partialSatisfactionDate ? new Date(report.partialSatisfactionDate) : undefined,
        payments: report.payments?.map((p: any) => ({
            ...p,
            date: p.date ? new Date(p.date) : undefined,
        })) || [],
    };
};

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isServer || !isAuthenticated) {
      setIsLoading(false);
      return;
    };
    
    let storedReports;
    try {
      storedReports = localStorage.getItem(STORAGE_KEY);
      if (storedReports) {
        setReports(JSON.parse(storedReports).map(parseReportDates));
      }
    } catch (error) {
      console.error("Failed to load reports from local storage", error);
      setReports([]);
    } finally {
        setIsLoading(false);
    }
  }, [isAuthenticated]);

  const saveReportsToStorage = useCallback((updatedReports: Report[]) => {
    if (isServer) return;
    try {
      const sortedReports = updatedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedReports));
    } catch (error) {
      console.error("Failed to save reports to local storage", error);
    }
  }, []);

  const addReport = useCallback((newReportData: Omit<Report, 'id' | 'createdAt'>) => {
    const newReportWithDates = {
      ...newReportData,
      startDate: new Date(newReportData.startDate),
      endDate: new Date(newReportData.endDate),
    }

    const newReport: Report = {
      ...newReportWithDates,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    setReports(prevReports => {
        const updatedReports = [newReport, ...prevReports];
        saveReportsToStorage(updatedReports);
        return updatedReports.map(parseReportDates);
    });

    return newReport;
  }, [saveReportsToStorage]);

  const updateReport = useCallback((updatedReportData: Report) => {
    setReports(prevReports => {
        const updatedReports = prevReports.map(report =>
          report.id === updatedReportData.id ? {...updatedReportData, startDate: new Date(updatedReportData.startDate), endDate: new Date(updatedReportData.endDate)} : report
        );
        saveReportsToStorage(updatedReports);
        return updatedReports.map(parseReportDates);
    });
    return updatedReportData;
  }, [saveReportsToStorage]);

  const deleteReport = useCallback((reportId: string) => {
    setReports(prevReports => {
        const updatedReports = prevReports.filter(report => report.id !== reportId);
        saveReportsToStorage(updatedReports);
        return updatedReports;
    });
  }, [saveReportsToStorage]);
  
  const getReportById = useCallback((reportId: string) => {
    const report = reports.find(report => report.id === reportId);
    if(report) return parseReportDates(report);
    return undefined;
  }, [reports]);

  const importReport = useCallback((reportData: any) => {
    try {
      // Validate against Zod schema, ignoring ID and createdAt for this check
      const { id, createdAt, ...dataToValidate } = reportData;
      reportSchema.parse(dataToValidate);

      const parsedReport = parseReportDates(reportData);
      
      setReports(prevReports => {
          const exists = prevReports.some(r => r.id === parsedReport.id);
          let updatedReports;
          if (exists) {
            updatedReports = prevReports.map(r => r.id === parsedReport.id ? parsedReport : r);
          } else {
            updatedReports = [parsedReport, ...prevReports];
          }
          saveReportsToStorage(updatedReports);
          return updatedReports.map(parseReportDates);
      });
      return true;
    } catch (e) {
      console.error("Import failed: Invalid report data", e);
      return false;
    }
  }, [saveReportsToStorage]);

  const importReports = useCallback((reportsData: any[]) => {
    try {
        let successfulImports = 0;

        setReports(prevReports => {
            let currentReports = [...prevReports];
            reportsData.forEach(reportData => {
                try {
                    const { id, createdAt, ...dataToValidate } = reportData;
                    reportSchema.parse(dataToValidate);
                    const parsedReport = parseReportDates(reportData);
                    const existsIndex = currentReports.findIndex(r => r.id === parsedReport.id);

                    if (existsIndex > -1) {
                        currentReports[existsIndex] = parsedReport;
                    } else {
                        currentReports.unshift(parsedReport);
                    }
                    successfulImports++;
                } catch (e) {
                    console.error("Skipping invalid report during bulk import:", reportData.cmsNo || 'Unknown', e);
                }
            });
            saveReportsToStorage(currentReports);
            return currentReports.map(parseReportDates);
        });
        
        return successfulImports > 0;
    } catch (e) {
        console.error("Bulk import failed", e);
        return false;
    }
  }, [saveReportsToStorage]);


  return { reports, isLoading, addReport, updateReport, deleteReport, getReportById, importReport, importReports };
}
