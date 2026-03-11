'use client';

import { useState } from 'react';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useAuth } from '@/hooks/useAuth';
import AdminVerifyModal from '@/components/auth/AdminVerifyModal';

export default function SettingsPage() {
  const { isAdmin, verifyAdmin, exitAdmin } = useAdminMode();
  const { logout } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState<'app' | 'admin' | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: '새 비밀번호가 일치하지 않습니다' });
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: '비밀번호는 4자 이상이어야 합니다' });
      return;
    }

    setIsChanging(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          type: showPasswordForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: '비밀번호가 변경되었습니다' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        if (showPasswordForm === 'app') {
          setTimeout(() => logout(), 1500);
        }
      } else {
        setPasswordMsg({ type: 'error', text: data.error || '변경에 실패했습니다' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: '서버 오류가 발생했습니다' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold text-[#1A202C]">설정</h2>

      {/* Admin mode */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#1A202C]">관리자 모드</h3>
              <p className="text-sm text-[#718096] mt-0.5">
                {isAdmin ? '활성화됨 — 서류/업체 추가·수정·삭제 가능' : '비활성화 — 조회만 가능'}
              </p>
            </div>
            {isAdmin ? (
              <button
                onClick={exitAdmin}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                해제
              </button>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-4 py-2 bg-[#3182CE] text-white text-sm font-medium rounded-lg hover:bg-[#2B6CB0] transition-colors"
              >
                진입
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Password change (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-semibold text-[#1A202C]">비밀번호 변경</h3>
          </div>

          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                setShowPasswordForm(showPasswordForm === 'app' ? null : 'app');
                setPasswordMsg({ type: '', text: '' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">접속 비밀번호 변경</p>
                <p className="text-xs text-[#718096]">전체 사용자의 로그인 비밀번호</p>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordForm === 'app' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPasswordForm === 'app' && (
              <form onSubmit={handleChangePassword} className="px-3 pb-3 space-y-3">
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="현재 비밀번호"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="새 비밀번호"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="새 비밀번호 확인"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
                {passwordMsg.text && (
                  <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {passwordMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isChanging}
                  className="w-full h-11 bg-[#3182CE] text-white font-medium rounded-xl disabled:opacity-50"
                >
                  {isChanging ? '변경 중...' : '변경하기'}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowPasswordForm(showPasswordForm === 'admin' ? null : 'admin');
                setPasswordMsg({ type: '', text: '' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">관리자 비밀번호 변경</p>
                <p className="text-xs text-[#718096]">관리자 모드 진입용 비밀번호</p>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordForm === 'admin' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPasswordForm === 'admin' && (
              <form onSubmit={handleChangePassword} className="px-3 pb-3 space-y-3">
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="현재 관리자 비밀번호"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="새 관리자 비밀번호"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="새 관리자 비밀번호 확인"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3182CE]"
                  required
                />
                {passwordMsg.text && (
                  <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {passwordMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isChanging}
                  className="w-full h-11 bg-[#3182CE] text-white font-medium rounded-xl disabled:opacity-50"
                >
                  {isChanging ? '변경 중...' : '변경하기'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={logout}
          className="w-full p-5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-red-500 font-medium">로그아웃</span>
        </button>
      </div>

      {/* App info */}
      <div className="text-center text-xs text-[#718096] py-4">
        <p>양산학교급식협동조합 서류 만료 관리 시스템</p>
        <p className="mt-1">v1.0.0</p>
      </div>

      <AdminVerifyModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerified={() => setShowAdminModal(false)}
        verifyAdmin={verifyAdmin}
      />
    </div>
  );
}
