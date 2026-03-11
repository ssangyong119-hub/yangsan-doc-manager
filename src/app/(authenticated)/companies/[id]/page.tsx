'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Company, Document, DocumentWithStatus } from '@/types';
import { processDocuments, sortByDday } from '@/lib/utils';
import { useAdminMode } from '@/hooks/useAdminMode';
import DocumentCard from '@/components/documents/DocumentCard';
import AdminVerifyModal from '@/components/auth/AdminVerifyModal';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin, verifyAdmin } = useAdminMode();
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ contact_name: '', contact_phone: '', color: '' });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/companies/${id}`).then((r) => r.json()),
      fetch(`/api/documents?company_id=${id}`).then((r) => r.json()),
    ])
      .then(([comp, docs]) => {
        setCompany(comp);
        setEditForm({
          contact_name: comp.contact_name || '',
          contact_phone: comp.contact_phone || '',
          color: comp.color || '#2563EB',
        });
        setDocuments(sortByDday(processDocuments(docs as Document[])));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSaveEdit = async () => {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setIsEditing(false);
      fetchData();
    } else {
      alert('업체 정보 수정에 실패했습니다.');
    }
  };

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

      {/* 업체 정보 카드 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: company.color }}
          >
            {company.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#1A202C]">{company.name}</h2>
            <p className="text-sm text-[#718096]">서류 {documents.length}건</p>
          </div>
          {isAdmin && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="h-8 px-3 text-xs font-medium text-[#3182CE] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              수정
            </button>
          )}
          {!isAdmin && (
            <button
              onClick={() => setShowAdminModal(true)}
              className="h-8 px-3 text-xs font-medium text-[#718096] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔒
            </button>
          )}
        </div>

        {/* 담당자 정보 */}
        {isEditing ? (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#718096] mb-1">담당자명</label>
              <input
                type="text"
                value={editForm.contact_name}
                onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                placeholder="담당자 이름"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#718096] mb-1">연락처</label>
              <input
                type="tel"
                value={editForm.contact_phone}
                onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#718096] mb-1">구분 색상</label>
              <input
                type="color"
                value={editForm.color}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 h-10 text-sm border border-gray-200 rounded-xl text-[#718096] font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 h-10 text-sm bg-[#3182CE] text-white font-bold rounded-xl"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          (company.contact_name || company.contact_phone) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm text-[#718096]">
              {company.contact_name && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {company.contact_name}
                </span>
              )}
              {company.contact_phone && (
                <a href={`tel:${company.contact_phone}`} className="flex items-center gap-1 text-[#3182CE]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {company.contact_phone}
                </a>
              )}
            </div>
          )
        )}
      </div>

      {/* 서류 목록 */}
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

      <AdminVerifyModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerified={() => setShowAdminModal(false)}
        verifyAdmin={verifyAdmin}
      />
    </div>
  );
}
