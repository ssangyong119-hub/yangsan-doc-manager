'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Document, DocumentWithStatus, RenewalHistory, Company, CreateDocumentRequest } from '@/types';
import { addDocumentStatus, formatDday, formatDate, formatDateKo, getProgressPercentage } from '@/lib/utils';
import { STATUS_CONFIG, CATEGORY_ICONS, RISK_LABELS } from '@/lib/constants';
import { useAdminMode } from '@/hooks/useAdminMode';
import RenewModal from '@/components/documents/RenewModal';
import AddDocumentModal from '@/components/documents/AddDocumentModal';
import AdminVerifyModal from '@/components/auth/AdminVerifyModal';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin, verifyAdmin } = useAdminMode();
  const [doc, setDoc] = useState<DocumentWithStatus | null>(null);
  const [history, setHistory] = useState<RenewalHistory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const fetchData = async () => {
    try {
      const [docRes, compRes] = await Promise.all([
        fetch(`/api/documents/${id}`),
        fetch('/api/companies'),
      ]);
      const docData = await docRes.json();
      const compData = await compRes.json();
      const withStatus = addDocumentStatus(docData as Document);
      setDoc(withStatus);
      setHistory(docData.renewal_history || []);
      setCompanies(compData);
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRenew = async (docId: string, data: { new_expiry_date: string; renewal_date?: string; notes?: string }) => {
    const res = await fetch(`/api/documents/${docId}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('갱신 실패');
    fetchData();
  };

  const handleEdit = async (data: CreateDocumentRequest) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('수정 실패');
    fetchData();
  };

  const handleDelete = async () => {
    if (!confirm('이 서류를 삭제하시겠습니까?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    router.push('/documents');
  };

  if (isLoading || !doc) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin w-8 h-8 border-3 border-[#3182CE] border-t-transparent rounded-full" />
      </div>
    );
  }

  const config = STATUS_CONFIG[doc.status];
  const icon = CATEGORY_ICONS[doc.category] || '📁';
  const risk = RISK_LABELS[doc.risk_level];
  const progress = getProgressPercentage(doc.dday, doc.renewal_cycle);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-[#718096] hover:text-[#1A202C] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        뒤로
      </button>

      {/* D-day Hero */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${config.color}15, ${config.color}08)` }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: config.textColor }}>
          {icon} {doc.category} · {doc.company?.name}
        </p>
        <h2 className="text-xl font-bold text-[#1A202C] mb-3">{doc.name}</h2>
        <div
          className="inline-block px-6 py-3 rounded-2xl"
          style={{ backgroundColor: config.bg }}
        >
          <p
            className="text-4xl font-bold font-mono"
            style={{ color: config.color }}
          >
            {formatDday(doc.dday)}
          </p>
          <p
            className="text-sm font-medium mt-1"
            style={{ color: config.textColor }}
          >
            {config.label}
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#718096] mb-0.5">만료일</p>
            <p className="font-semibold text-sm">{formatDateKo(doc.expiry_date)}</p>
          </div>
          <div>
            <p className="text-xs text-[#718096] mb-0.5">갱신주기</p>
            <p className="font-semibold text-sm">{doc.renewal_cycle}일</p>
          </div>
          <div>
            <p className="text-xs text-[#718096] mb-0.5">위험도</p>
            <p className="font-semibold text-sm">{risk.emoji} {risk.label}</p>
          </div>
          <div>
            <p className="text-xs text-[#718096] mb-0.5">카테고리</p>
            <p className="font-semibold text-sm">{icon} {doc.category}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-[#718096] mb-1">
            <span>갱신주기 진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: config.color }}
            />
          </div>
        </div>

        {doc.eat_reference && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-[#718096] mb-0.5">EAT 법규 근거</p>
            <p className="text-sm text-[#1A202C]">{doc.eat_reference}</p>
          </div>
        )}

        {doc.eat_impact && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-[#718096] mb-0.5">만료 시 영향</p>
            <p className="text-sm font-medium" style={{ color: risk.color }}>{doc.eat_impact}</p>
          </div>
        )}

        {doc.memo && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-[#718096] mb-0.5">메모</p>
            <p className="text-sm text-[#1A202C]">{doc.memo}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => isAdmin ? setShowRenewModal(true) : setShowAdminModal(true)}
          className="flex-1 h-12 bg-[#38A169] text-white font-bold rounded-xl hover:bg-[#2F855A] transition-colors active:scale-[0.98]"
        >
          갱신하기
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setShowEditModal(true)}
              className="h-12 px-4 border border-gray-200 text-[#718096] font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="h-12 px-4 border border-red-200 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </>
        )}
      </div>

      {/* Renewal history */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h3 className="font-bold text-[#1A202C]">📋 갱신 이력</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-6 text-center text-[#718096] text-sm">
            갱신 이력이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h) => (
              <div key={h.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {formatDate(h.previous_expiry)} → {formatDate(h.new_expiry)}
                  </span>
                  <span className="text-xs text-[#718096]">
                    {formatDate(h.created_at)}
                  </span>
                </div>
                {h.notes && (
                  <p className="text-xs text-[#718096]">{h.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showRenewModal && (
        <RenewModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          document={doc}
          onSubmit={handleRenew}
        />
      )}

      {showEditModal && (
        <AddDocumentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          companies={companies}
          editData={{
            id: doc.id,
            company_id: doc.company_id,
            name: doc.name,
            category: doc.category,
            expiry_date: doc.expiry_date,
            renewal_cycle: doc.renewal_cycle,
            risk_level: doc.risk_level,
            eat_reference: doc.eat_reference || '',
            eat_impact: doc.eat_impact || '',
            memo: doc.memo || '',
          }}
        />
      )}

      <AdminVerifyModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerified={() => {
          setShowAdminModal(false);
          setShowRenewModal(true);
        }}
        verifyAdmin={verifyAdmin}
      />
    </div>
  );
}
