'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Company, Document, DocumentWithStatus } from '@/types';
import { addDocumentStatus, sortByDday } from '@/lib/utils';
import DocumentCard from '@/components/documents/DocumentCard';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/companies/${id}`).then((r) => r.json()),
      fetch(`/api/documents?company_id=${id}`).then((r) => r.json()),
    ])
      .then(([comp, docs]) => {
        setCompany(comp);
        const withStatus = (docs as Document[]).map(addDocumentStatus);
        setDocuments(sortByDday(withStatus));
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !company) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin w-8 h-8 border-3 border-[#3182CE] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-[#718096] hover:text-[#1A202C] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        뒤로
      </button>

      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: company.color }}
        >
          {company.name[0]}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A202C]">{company.name}</h2>
          <p className="text-sm text-[#718096]">서류 {documents.length}건</p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[#718096]">등록된 서류가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
