'use client';

import { useState, useEffect } from 'react';
import { Company, Document, DocumentWithStatus } from '@/types';
import { addDocumentStatus } from '@/lib/utils';
import { useAdminMode } from '@/hooks/useAdminMode';
import AdminVerifyModal from '@/components/auth/AdminVerifyModal';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, verifyAdmin } = useAdminMode();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', color: '#2563EB', contact_name: '', contact_phone: '' });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/companies').then((r) => r.json()),
      fetch('/api/documents').then((r) => r.json()),
    ])
      .then(([comps, docs]) => {
        setCompanies(comps);
        setDocuments((docs as Document[]).map(addDocumentStatus));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewCompany({ name: '', color: '#2563EB', contact_name: '', contact_phone: '' });
      fetchData();
    }
  };

  const handleDeleteCompany = async (e: React.MouseEvent, companyId: string, companyName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`"${companyName}" 업체를 삭제하시겠습니까?\n해당 업체의 서류 데이터도 함께 삭제됩니다.`)) return;
    const res = await fetch(`/api/companies/${companyId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData();
    } else {
      alert('업체 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin w-8 h-8 border-3 border-[#3182CE] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1A202C]">업체 관리</h2>
        {isAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 bg-[#3182CE] text-white text-sm font-medium rounded-lg hover:bg-[#2B6CB0] transition-colors"
          >
            + 업체 추가
          </button>
        ) : (
          <button
            onClick={() => setShowAdminModal(true)}
            className="h-9 px-4 bg-gray-100 text-[#718096] text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔒 관리자
          </button>
        )}
      </div>

      <div className="space-y-3">
        {companies.map((company) => {
          const compDocs = documents.filter((d) => d.company_id === company.id);
          const expired = compDocs.filter((d) => d.status === 'expired' || d.status === 'today').length;
          const urgent = compDocs.filter((d) => d.status === 'urgent').length;
          const caution = compDocs.filter((d) => d.status === 'caution').length;
          const safe = compDocs.filter((d) => d.status === 'safe' || d.status === 'interest').length;

          return (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: company.color }}
                >
                  {company.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-[#1A202C]">{company.name}</h3>
                  <p className="text-xs text-[#718096]">서류 {compDocs.length}건</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteCompany(e, company.id, company.name)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="업체 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                {expired > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                    만료 {expired}
                  </span>
                )}
                {urgent > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    긴급 {urgent}
                  </span>
                )}
                {caution > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                    주의 {caution}
                  </span>
                )}
                {safe > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    양호 {safe}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Add company modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-xl animate-slide-up p-6">
            <h3 className="text-lg font-bold mb-4">업체 추가</h3>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">업체명 *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">구분 색상</label>
                <input
                  type="color"
                  value={newCompany.color}
                  onChange={(e) => setNewCompany({ ...newCompany, color: e.target.value })}
                  className="w-full h-11 rounded-xl border border-gray-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">담당자명</label>
                <input
                  type="text"
                  value={newCompany.contact_name}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_name: e.target.value })}
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">연락처</label>
                <input
                  type="tel"
                  value={newCompany.contact_phone}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })}
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 border border-gray-200 rounded-xl text-[#718096] font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#3182CE] text-white font-bold rounded-xl"
                >
                  추가하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminVerifyModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerified={() => setShowAdminModal(false)}
        verifyAdmin={verifyAdmin}
      />
    </div>
  );
}
