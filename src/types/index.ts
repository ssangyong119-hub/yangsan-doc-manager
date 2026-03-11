// ===== Database Types =====
export interface Company {
  id: string;
  name: string;
  color: string;
  contact_name: string | null;
  contact_phone: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  name: string;
  category: DocumentCategory;
  expiry_date: string;
  renewal_cycle: number;
  risk_level: RiskLevel;
  eat_reference: string | null;
  eat_impact: string | null;
  memo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  company?: Company;
}

export interface RenewalHistory {
  id: string;
  document_id: string;
  previous_expiry: string;
  new_expiry: string;
  renewal_date: string;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  document_id: string | null;
  company_id: string | null;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  document?: Document;
  company?: Company;
}

export interface AppSettings {
  id: number;
  app_password_hash: string;
  admin_password_hash: string;
  created_at: string;
  updated_at: string;
}

// ===== Enums =====
export type DocumentCategory = '인증' | '보험' | '건강' | '위생' | '차량' | '기타';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type NotificationType = 'd90' | 'd30' | 'd7' | 'd1' | 'expired';
export type DocumentStatus = 'expired' | 'today' | 'urgent' | 'caution' | 'interest' | 'safe';

// ===== UI Types =====
export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  textColor: string;
  priority: number;
}

export interface DocumentWithStatus extends Document {
  dday: number;
  status: DocumentStatus;
}

// ===== API Types =====
export interface LoginRequest {
  password: string;
}

export interface AdminVerifyRequest {
  adminPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  type: 'app' | 'admin';
}

export interface CreateDocumentRequest {
  company_id: string;
  name: string;
  category: DocumentCategory;
  expiry_date: string;
  renewal_cycle: number;
  risk_level: RiskLevel;
  eat_reference?: string;
  eat_impact?: string;
  memo?: string;
}

export interface RenewDocumentRequest {
  renewal_date?: string;
  new_expiry_date: string;
  notes?: string;
}

export interface CreateCompanyRequest {
  name: string;
  color?: string;
  contact_name?: string;
  contact_phone?: string;
}
