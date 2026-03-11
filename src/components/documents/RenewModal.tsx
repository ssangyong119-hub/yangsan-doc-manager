'use client';

import { useState } from 'react';
import { DocumentWithStatus, RenewDocumentRequest } from '@/types';
import { formatDate, calculateNewExpiry } from '@/lib/utils';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentWithStatus;
  onSubmit: (id: string, data: RenewDocumentRequest) => Promise<void>;
}

export default function RenewModal({ isOpen, onClose, document: doc, onSubmit }: RenewModalProps) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [renewalDate, setRenewalDate] = useState('');
  const [manualExpiry, setManualExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculatedExpiry = renewalDate ? calculateNewExpiry(renewalDate, doc.renewal_cycle) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data: RenewDocumentRequest = {
        new_expiry_date: mode === 'auto' ? calculatedExpiry : manualExpiry,
        renewal_date: renewalDate || undefined,
        notes: notes || undefined,
      };
      await onSubmit(doc.id, data);
      onClose();
    } catch {
      // handled upstream
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold">서류 갱신</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-[#718096]">현재 만료일</p>
            <p className="font-bold text-[#1A202C]">{formatDate(doc.expiry_date)}</p>
            <p className="text-xs text-[#718096] mt-1">갱신주기: {doc.renewal_cycle}일</p>
          </div>

          {/* 갱신 방법 선택 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                mode === 'auto'
                  ? 'bg-[#3182CE] text-white'
                  : 'bg-gray-100 text-[#718096]'
              }`}
            >
              ① 자동 계산
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-[#3182CE] text-white'
                  : 'bg-gray-100 text-[#718096]'
              }`}
            >
              ② 직접 입력
            </button>
          </div>

          {mode === 'auto' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
                  갱신일(발급일) *
                </label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
              </div>
              {calculatedExpiry && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-sm text-blue-700">
                    새 만료일: <span className="font-bold">{formatDate(calculatedExpiry)}</span>
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5">
                    = 갱신일 + {doc.renewal_cycle}일
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-1.5">
                새 만료일 직접 입력 *
              </label>
              <input
                type="date"
                value={manualExpiry}
                onChange={(e) => setManualExpiry(e.target.value)}
                className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                required
              />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
                <p className="text-xs text-amber-700">
                  ⚠️ EAT 플랫폼 화면에서 확인한 만료일을 그대로 입력해주세요
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1A202C] mb-1.5">메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="갱신 관련 메모 (선택)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (mode === 'auto' && !calculatedExpiry) || (mode === 'manual' && !manualExpiry)}
            className="w-full h-12 bg-[#38A169] text-white font-bold rounded-xl hover:bg-[#2F855A] transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? '갱신 중...' : '갱신 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
