import { DocumentCategory, DocumentStatus, RiskLevel, StatusConfig } from '@/types';

export const STATUS_CONFIG: Record<DocumentStatus, StatusConfig> = {
  expired:  { label: '만료됨',   color: '#E53E3E', bg: '#FED7D7', textColor: '#9B2C2C', priority: 0 },
  today:    { label: '오늘만료', color: '#E53E3E', bg: '#FED7D7', textColor: '#9B2C2C', priority: 1 },
  urgent:   { label: '긴급',    color: '#DD6B20', bg: '#FEEBC8', textColor: '#9C4221', priority: 2 },
  caution:  { label: '주의',    color: '#D69E2E', bg: '#FEFCBF', textColor: '#975A16', priority: 3 },
  interest: { label: '관심',    color: '#3182CE', bg: '#BEE3F8', textColor: '#2A4365', priority: 4 },
  safe:     { label: '양호',    color: '#38A169', bg: '#C6F6D5', textColor: '#276749', priority: 5 },
};

export const RISK_LABELS: Record<RiskLevel, { label: string; emoji: string; color: string }> = {
  critical: { label: 'Critical', emoji: '🔴', color: '#E53E3E' },
  high:     { label: 'High',     emoji: '🟠', color: '#DD6B20' },
  medium:   { label: 'Medium',   emoji: '🟡', color: '#D69E2E' },
  low:      { label: 'Low',      emoji: '🟢', color: '#38A169' },
};

export const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: '인증', label: '인증' },
  { value: '보험', label: '보험' },
  { value: '건강', label: '건강' },
  { value: '위생', label: '위생' },
  { value: '차량', label: '차량' },
  { value: '기타', label: '기타' },
];

export const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  '인증': '📋',
  '보험': '🛡️',
  '건강': '💊',
  '위생': '🧹',
  '차량': '🚛',
  '기타': '📁',
};

export const DEFAULT_RENEWAL_CYCLES: Record<string, number> = {
  '인증정보': 365,
  '차량책임/종합보험': 365,
  '생산물배상책임보험': 365,
  '건강진단결과서': 365,
  '사업장소독필증': 180,
  '차량소독필증': 180,
  '차량등록증': 730,
  '인증정보(취급업체)': 1095,
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: '홈', icon: 'home' },
  { href: '/documents', label: '서류', icon: 'document' },
  { href: '/calendar', label: '캘린더', icon: 'calendar' },
  { href: '/companies', label: '업체', icon: 'company' },
  { href: '/settings', label: '설정', icon: 'settings' },
] as const;
