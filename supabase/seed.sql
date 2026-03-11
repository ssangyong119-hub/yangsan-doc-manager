-- ============================================================
-- 양산학교급식협동조합 서류 만료 관리 시스템
-- Seed Data (초기 데이터)
-- ============================================================
-- 실행 방법: schema.sql 실행 후, 이 파일을 Supabase SQL Editor에서 실행
-- ============================================================

-- ===== 1. 앱 설정 (비밀번호) =====
-- 공용 접속 비밀번호: yangsan2026
-- 관리자 비밀번호: admin2026!
INSERT INTO app_settings (id, app_password_hash, admin_password_hash) VALUES (
  1,
  '$2b$10$Xa8GPwpzSQ92MxvUIJTR1.Pyy9O1KzMQ9T5EChY1on6rzKEFXQauO',
  '$2b$10$5o/4fAm/IXLcQ1m50yTOkOB/Unbz2Se8wTcTVBVwefnYHuaLc6MTC'
);

-- ===== 2. 초기 업체 5개 =====
INSERT INTO companies (name, color, contact_name, contact_phone, sort_order) VALUES
  ('히든식품', '#2563EB', NULL, NULL, 1),
  ('청정식품', '#0EA5E9', NULL, NULL, 2),
  ('한빛유통', '#10B981', NULL, NULL, 3),
  ('새벽농산', '#F59E0B', NULL, NULL, 4),
  ('푸른들식자재', '#EF4444', NULL, NULL, 5);

-- ===== 3. 히든식품 서류 7종 =====
-- 기획서 6.1 기준, 소상공인확인서는 업체 의무보유이므로 제외
-- 만료일과 갱신주기는 기본값이며, 직원이 EAT 화면 확인 후 수정 가능

INSERT INTO documents (company_id, name, category, expiry_date, renewal_cycle, risk_level, eat_reference, eat_impact)
SELECT
  c.id,
  d.name,
  d.category,
  d.expiry_date::DATE,
  d.renewal_cycle,
  d.risk_level,
  d.eat_reference,
  d.eat_impact
FROM companies c
CROSS JOIN (VALUES
  ('인증정보',             '인증', '2026-02-24', 365, 'critical',
   '식품위생법 제37조, 집단급식소 식품판매업 영업신고',
   '영업신고 만료 시 즉시 거래정지 및 EAT 등록 취소'),
  ('차량책임/종합보험',      '보험', '2026-12-11', 365, 'high',
   'EAT 자격제한 공통 - 차량보험 가입 의무',
   '보험 미가입 시 배송 불가 및 자격제한'),
  ('생산물배상책임보험',     '보험', '2026-10-24', 365, 'critical',
   'EAT 자격제한 공통 제1호 - 생산물배상책임보험 가입 의무',
   '미가입 시 즉시 거래정지'),
  ('건강진단결과서',        '건강', '2026-05-20', 365, 'high',
   '식품위생법, 학교급식 건강진단 적용기간 안내',
   '건강진단 미보유 시 현장심사 불합격'),
  ('사업장소독필증',        '위생', '2026-04-27', 180, 'medium',
   '식품위생법 시행규칙',
   '소독 미실시 시 현장심사 불합격'),
  ('차량소독필증',          '위생', '2026-04-27', 180, 'medium',
   '배송차량 위생관리 기준',
   '차량 소독 미실시 시 현장심사 불합격'),
  ('차량등록증',            '차량', '2027-02-26', 730, 'high',
   'eaT 배송차량 전수등록제도',
   '차량등록 만료 시 배송 불가')
) AS d(name, category, expiry_date, renewal_cycle, risk_level, eat_reference, eat_impact)
WHERE c.name = '히든식품';
