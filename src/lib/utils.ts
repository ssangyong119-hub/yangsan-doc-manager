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
