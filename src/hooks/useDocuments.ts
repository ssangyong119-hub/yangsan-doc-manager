'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, DocumentWithStatus, CreateDocumentRequest, RenewDocumentRequest } from '@/types';
import { processDocuments, sortByDday } from '@/lib/utils';

export function useDocuments(companyId?: string) {
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (companyId) params.set('company_id', companyId);
      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error('서류 목록을 불러올 수 없습니다');
      const data: Document[] = await res.json();
      setDocuments(sortByDday(processDocuments(data)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (data: CreateDocumentRequest) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '서류 추가에 실패했습니다');
    }
    await fetchDocuments();
    return res.json();
  };

  const updateDocument = async (id: string, data: Partial<CreateDocumentRequest>) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('서류 수정에 실패했습니다');
    await fetchDocuments();
    return res.json();
  };

  const deleteDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('서류 삭제에 실패했습니다');
    await fetchDocuments();
  };

  const renewDocument = async (id: string, data: RenewDocumentRequest) => {
    const res = await fetch(`/api/documents/${id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('서류 갱신에 실패했습니다');
    await fetchDocuments();
    return res.json();
  };

  return {
    documents,
    isLoading,
    error,
    refresh: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    renewDocument,
  };
}
