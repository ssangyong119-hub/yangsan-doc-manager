'use client';

import { useState, useEffect, useMemo } from 'react';
import { Document, DocumentWithStatus, Company, DocumentCategory, DocumentStatus, CreateDocumentRequest } from '@/types';
import { addDocumentStatus, sortByDday } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { useAdminMode } from '@/hooks/useAdminMode';
import DocumentCard from '@/components/documents/DocumentCard';
import AddDocumentModal from '@/components/documents/AddDocumentModal';
import AdminVerifyModal from '@/components/auth/AdminVerifyModal';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | ''>('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { isAdmin, verifyAdmin } = useAdminMode();

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/documents').then((r) => r.json()),
      fetch('/api/companies').then((r) => r.json()),
    ])
      .then(([docs, comps]) => {
        const withStatus = (docs as Document[]).map(addDocumentStatus);
        setDocuments(sortByDday(withStatus));
        setCompanies(comps as Company[]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (search && !doc.name.includes(search) && !doc.company?.name.includes(search)) return false;
      if (filterCategory && doc.category !== filterCategory) return false;
      if (filterStatus && doc.status !== filterStatus) return false;
      if (filterCompany && doc.company_id !== filterCompany) return false;
      return true;
    });
  }, [documents, search, filterCategory, filterStatus, filterCompany]);

  const handleAddDocument = async (data: CreateDocumentRequest) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('추가 실패');
    fetchData();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="서류명 또는 업체명 검색"
          className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs shrink-0"
        >
          <option value="">전체 업체</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | '')}
          className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs shrink-0"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | '')}
          className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs shrink-0"
        >
          <option value="">전체 상태</option>
          <option value="expired">만료</option>
          <option value="urgent">긴급</option>
          <option value="caution">주의</option>
          <option value="interest">관심</option>
          <option value="safe">양호</option>
        </select>
      </div>

      {/* Count + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#718096]">총 {filtered.length}건</p>
        {isAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 bg-[#3182CE] text-white text-sm font-medium rounded-lg hover:bg-[#2B6CB0] transition-colors active:scale-[0.97]"
          >
            + 서류 추가
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

      {/* Document list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-3 border-[#3182CE] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[#718096]">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      <AddDocumentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDocument}
        companies={companies}
      />

      <AdminVerifyModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerified={() => setShowAdminModal(false)}
        verifyAdmin={verifyAdmin}
      />
    </div>
  );
}
