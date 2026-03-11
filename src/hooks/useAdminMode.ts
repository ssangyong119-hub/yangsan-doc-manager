'use client';

import { useState, useCallback, useEffect } from 'react';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('adminMode');
    if (stored === 'true') setIsAdmin(true);
  }, []);

  const verifyAdmin = useCallback(async (password: string): Promise<boolean> => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: password }),
      });
      const data = await res.json();
      if (data.verified) {
        setIsAdmin(true);
        sessionStorage.setItem('adminMode', 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const exitAdmin = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem('adminMode');
  }, []);

  return { isAdmin, verifyAdmin, exitAdmin, isVerifying };
}
