'use client';

import { useState, useEffect } from 'react';
import { Document, DocumentWithStatus, Company } from '@/types';
import { processDocuments, sortByDday } from '@/lib/utils';
import StatCards from '@/components/dashboard/StatCards';
import AlertBanner from '@/components/dashboard/AlertBanner';
import ExpiryTimeline from '@/components/dashboard/ExpiryTimeline';
import CompanySummary from '@/components/dashboard/CompanySummary';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/documents').then((r) => r.json()),
      fetch('/api/companies').then((r) => r.json()),
    ])
      .then(([docs, comps]) => {
        setDocuments(sortByDday(processDocuments(docs as Document[])));
        setCompanies(comps as Company[]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin w-8 h-8 border-3 border-[#3182CE] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <StatCards documents={documents} />
      <AlertBanner documents={documents} />
      <ExpiryTimeline documents={documents} />
      <CompanySummary documents={documents} companies={companies} />
    </div>
  );
}
