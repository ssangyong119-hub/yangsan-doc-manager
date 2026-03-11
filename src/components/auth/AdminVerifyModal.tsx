'use client';

import { useState } from 'react';

interface AdminVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  verifyAdmin: (password: string) => Promise<boolean>;
}

export default function AdminVerifyModal({
  isOpen,
  onClose,
  onVerified,
  verifyAdmin,
}: AdminVerifyModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await verifyAdmin(password);
    setIsLoading(false);
    if (result) {
      setPassword('');
      onVerified();
      onClose();
    } else {
      setError('관리자 비밀번호가 올바르지 않습니다');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-slide-up">
        <h3 className="text-lg font-bold text-[#1A202C] mb-1">관리자 인증</h3>
        <p className="text-sm text-[#718096] mb-4">
          관리자 비밀번호를 입력해주세요
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE] focus:ring-1 focus:ring-[#3182CE] transition-colors"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-[#718096] font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="flex-1 h-11 rounded-xl bg-[#3182CE] text-white font-medium hover:bg-[#2B6CB0] transition-colors disabled:opacity-50"
            >
              {isLoading ? '확인 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
