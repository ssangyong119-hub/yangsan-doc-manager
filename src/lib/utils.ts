import { differenceInDays, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DocumentStatus, Document, DocumentWithStatus } from '@/types';
import { STATUS_CONFIG } from './constants';

export function calculateDday(expiryDate: string): number {
  // 날짜 문자열만 사용하여 시간대/시간 오차 방지
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayDate = parseISO(todayStr);
  const expiry = parseISO(expiryDate.substring(0, 10));
  return differenceInDays(expiry, todayDate);
}

export function getDocumentStatus(dday: number): DocumentStatus {
  if (dday < 0) return 'expired';
  if (dday === 0) return 'today';
  if (dday <= 30) return 'urgent';
  if (dday <= 90) return 'caution';
  if (dday <= 180) return 'interest';
  return 'safe';
}

export function formatDday(dday: number): string {
  if (dday === 0) return 'D-Day';
  if (dday < 0) return `D+${Math.abs(dday)}`;
  return `D-${dday}`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy.MM.dd');
}

export function formatDateKo(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy년 M월 d일', { locale: ko });
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'M/d');
}

export function addDocumentStatus(doc: Document): DocumentWithStatus {
  const dday = calculateDday(doc.expiry_date);
  const status = getDocumentStatus(dday);
  return { ...doc, dday, status };
}

/**
 * 인증정보 D-day 연동 처리
 * - 인증정보는 자체 만료일이 아닌 같은 업체의 다른 서류 상태에 연동
 * - 다른 서류가 모두 만료 전이면 인증정보 = D-Day (0)
 * - 다른 서류 중 만료된 것이 있으면 가장 심한 값을 따라감 (예: D+2이면 인증정보도 D+2)
 */
export function adjustCertificationDday(docs: DocumentWithStatus[]): DocumentWithStatus[] {
  return docs.map((doc) => {
    if (doc.name !== '인증정보') return doc;

    // 같은 업체의 인증정보가 아닌 서류들
    const otherDocs = docs.filter((d) => d.company_id === doc.company_id && d.name !== '인증정보');

    if (otherDocs.length === 0) {
      // 다른 서류가 없으면 D-Day(0)
      return { ...doc, dday: 0, status: getDocumentStatus(0) };
    }

    // 다른 서류 중 가장 작은(가장 심한) D-day
    const worstDday = Math.min(...otherDocs.map((d) => d.dday));

    // 만료된 서류가 있으면 그 값을 따라가고, 없으면 0
    const certDday = worstDday < 0 ? worstDday : 0;
    return { ...doc, dday: certDday, status: getDocumentStatus(certDday) };
  });
}

/**
 * 서류 배열을 상태 부여 + 인증정보 연동까지 한번에 처리
 */
export function processDocuments(docs: Document[]): DocumentWithStatus[] {
  const withStatus = docs.map(addDocumentStatus);
  return adjustCertificationDday(withStatus);
}

export function sortByDday(docs: DocumentWithStatus[]): DocumentWithStatus[] {
  return [...docs].sort((a, b) => {
    const priorityA = STATUS_CONFIG[a.status].priority;
    const priorityB = STATUS_CONFIG[b.status].priority;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.dday - b.dday;
  });
}

export function calculateNewExpiry(renewalDate: string, renewalCycle: number): string {
  const date = parseISO(renewalDate);
  date.setDate(date.getDate() + renewalCycle);
  return format(date, 'yyyy-MM-dd');
}

export function getProgressPercentage(dday: number, renewalCycle: number): number {
  if (dday <= 0) return 100;
  const elapsed = renewalCycle - dday;
  return Math.max(0, Math.min(100, (elapsed / renewalCycle) * 100));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
