"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Report } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'sdc-reports';

const isServer = typeof window === 'undefined';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isServer) return;
    try {
      const storedReports = localStorage.getItem(STORAGE_KEY);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    } catch (error) {
      console.error("Failed to load reports from local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveReportsToStorage = useCallback((updatedReports: Report[]) => {
    if (isServer) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    } catch (error) {
      console.error("Failed to save reports to local storage", error);
    }
  }, []);

  const addReport = useCallback((newReportData: Omit<Report, 'id' | 'createdAt'>) => {
    const newReport: Report = {
      ...newReportData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    saveReportsToStorage(updatedReports);
    return newReport;
  }, [reports, saveReportsToStorage]);

  const updateReport = useCallback((updatedReportData: Report) => {
    const updatedReports = reports.map(report =>
      report.id === updatedReportData.id ? updatedReportData : report
    );
    setReports(updatedReports);
    saveReportsToStorage(updatedReports);
    return updatedReportData;
  }, [reports, saveReportsToStorage]);

  const deleteReport = useCallback((reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    saveReportsToStorage(updatedReports);
  }, [reports, saveReportsToStorage]);
  
  const getReportById = useCallback((reportId: string) => {
    return reports.find(report => report.id === reportId);
  }, [reports]);

  const importReport = useCallback((reportData: any) => {
    // Basic validation
    if(reportData.id && reportData.partyA && reportData.partyB) {
       // Check if already exists
      const exists = reports.some(r => r.id === reportData.id);
      if (exists) {
        // Optionally update existing report
        const updatedReports = reports.map(r => r.id === reportData.id ? reportData : r);
        setReports(updatedReports);
        saveReportsToStorage(updatedReports);
      } else {
        const updatedReports = [reportData, ...reports];
        setReports(updatedReports);
        saveReportsToStorage(updatedReports);
      }
      return true;
    }
    return false;
  }, [reports, saveReportsToStorage]);

  return { reports, isLoading, addReport, updateReport, deleteReport, getReportById, importReport };
}
