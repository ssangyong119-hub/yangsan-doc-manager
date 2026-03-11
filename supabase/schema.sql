-- ============================================================
-- 양산학교급식협동조합 서류 만료 관리 시스템
-- Database Schema for Supabase (PostgreSQL)
-- ============================================================
-- 실행 방법: Supabase Dashboard → SQL Editor → New query → 이 파일 전체 복사 후 실행
-- ============================================================

-- ===== 1. 앱 설정 (비밀번호 등) =====
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  app_password_hash TEXT NOT NULL,
  admin_password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 2. 업체 =====
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#2563EB',
  contact_name VARCHAR(50),
  contact_phone VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 3. 서류 =====
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL,
  expiry_date DATE NOT NULL,
  renewal_cycle INTEGER DEFAULT 365,
  risk_level VARCHAR(10) DEFAULT 'medium',
  eat_reference TEXT,
  eat_impact TEXT,
  memo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 4. 갱신 이력 =====
CREATE TABLE renewal_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  previous_expiry DATE NOT NULL,
  new_expiry DATE NOT NULL,
  renewal_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 5. 알림 로그 =====
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 6. 인덱스 =====
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_is_active ON documents(is_active);
CREATE INDEX idx_renewal_history_document_id ON renewal_history(document_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_document_id ON notifications(document_id);

-- ===== 7. updated_at 자동 갱신 트리거 =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== 8. Row Level Security =====
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- service_role 키를 사용하는 서버 사이드 API만 전체 접근 허용
-- (Supabase의 service_role 키는 RLS를 자동 우회하므로 별도 정책 불필요)
-- anon 키 사용 시를 위한 읽기 정책 (현재 앱에서는 service_role만 사용)
CREATE POLICY "Allow service role full access" ON app_settings FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON companies FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON documents FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON renewal_history FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON notifications FOR ALL USING (true);
