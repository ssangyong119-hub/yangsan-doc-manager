'use client';

import { useState, useEffect } from 'react';
import { Company, DocumentCategory, RiskLevel, CreateDocumentRequest } from '@/types';
import { CATEGORIES, DEFAULT_RENEWAL_CYCLES } from '@/lib/constants';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDocumentRequest) => Promise<void>;
  companies: Company[];
  editData?: Partial<CreateDocumentRequest> & { id?: string };
}

export default function AddDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  companies,
  editData,
}: AddDocumentModalProps) {
  const [form, setForm] = useState({
    company_id: '',
    name: '',
    category: '인증' as DocumentCategory,
    expiry_date: '',
    renewal_cycle: 365,
    risk_level: 'medium' as RiskLevel,
    eat_reference: '',
    eat_impact: '',
    memo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm((prev) => ({ ...prev, ...editData }));
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      renewal_cycle: DEFAULT_RENEWAL_CYCLES[name] || prev.renewal_cycle,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
      setForm({
        company_id: '',
        name: '',
        category: '인증',
        expiry_date: '',
        renewal_cycle: 365,
        risk_level: 'medium',
        eat_reference: '',
        eat_impact: '',
        memo: '',
      });
    } catch {
      // error handled upstream
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl animate-slide-up">
        <div className="sticky top-0 bg-white rounded-t-2xl p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold">{editData?.id ? '서류 수정' : '서류 추가'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 업체 선택 */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">업체 *</label>
            <select
              value={form.company_id}
              onChange={(e) => setForm({ ...form, company_id: e.target.value })}
              className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE] bg-white"
              required
            >
              <option value="">업체를 선택하세요</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 서류명 */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">서류명 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 인증정보, 건강진단결과서"
              className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE]"
              required
            />
          </div>

          {/* 카테고리 & 위험도 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">카테고리 *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">위험도 *</label>
              <select
                value={form.risk_level}
                onChange={(e) => setForm({ ...form, risk_level: e.target.value as RiskLevel })}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE] bg-white"
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* 만료일 & 갱신주기 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">만료일 *</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">갱신주기(일) *</label>
              <input
                type="number"
                value={form.renewal_cycle}
                onChange={(e) => setForm({ ...form, renewal_cycle: Number(e.target.value) })}
                min={1}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE]"
                required
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              ⚠️ EAT 플랫폼의 만료일과 반드시 일치시켜주세요.
              시스템의 D-day가 EAT 화면과 다르면 오히려 혼란을 줄 수 있습니다.
            </p>
          </div>

          {/* EAT 근거 */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">EAT 근거</label>
            <input
              type="text"
              value={form.eat_reference}
              onChange={(e) => setForm({ ...form, eat_reference: e.target.value })}
              placeholder="예: 식품위생법 제37조"
              className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE]"
            />
          </div>

          {/* 만료 시 영향 */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">만료 시 영향</label>
            <input
              type="text"
              value={form.eat_impact}
              onChange={(e) => setForm({ ...form, eat_impact: e.target.value })}
              placeholder="예: 즉시 거래정지"
              className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE]"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">메모</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#3182CE] text-white font-bold rounded-xl hover:bg-[#2B6CB0] transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? '저장 중...' : editData?.id ? '수정 완료' : '추가하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
