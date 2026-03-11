'use client';

import Link from 'next/link';
import { DocumentWithStatus, Company } from '@/types';

interface CompanySummaryProps {
  documents: DocumentWithStatus[];
  companies: Company[];
}

export default function CompanySummary({ documents, companies }: CompanySummaryProps) {
  const companyStats = companies.map((company) => {
    const companyDocs = documents.filter((d) => d.company_id === company.id);
    const expired = companyDocs.filter((d) => d.status === 'expired' || d.status === 'today').length;
    const urgent = companyDocs.filter((d) => d.status === 'urgent').length;
    const caution = companyDocs.filter((d) => d.status === 'caution').length;
    return { company, total: companyDocs.length, expired, urgent, caution };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="p-4 border-b border-gray-50">
        <h3 className="font-bold text-[#1A202C]">📊 업체별 현황</h3>
      </div>
      <div className="p-3 flex gap-3 overflow-x-auto">
        {companyStats.map(({ company, total, expired, urgent }) => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            className="shrink-0 w-32 rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-all active:scale-[0.97]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: company.color }}
              />
              <span className="text-sm font-semibold text-[#1A202C] truncate">
                {company.name}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-[#718096]">서류 {total}건</span>
            </div>
            {(expired > 0 || urgent > 0) && (
              <div className="flex gap-1 mt-1.5">
                {expired > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                    🔴{expired}
                  </span>
                )}
                {urgent > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                    🟠{urgent}
                  </span>
                )}
              </div>
            )}
            {expired === 0 && urgent === 0 && (
              <span className="text-xs text-green-600 mt-1.5 inline-block">✅ 양호</span>
            )}
          </Link>
        ))}
        {companyStats.length === 0 && (
          <div className="py-4 text-center text-[#718096] text-sm w-full">
            등록된 업체가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
