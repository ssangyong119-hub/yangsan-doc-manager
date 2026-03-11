# 양산학교급식협동조합 - 서류 만료 관리 시스템

EAT(공공급식통합플랫폼) 등록 서류의 만료일을 자동 추적하고 알림을 제공하는 웹 앱입니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **스타일링**: Tailwind CSS v4
- **데이터베이스**: Supabase (PostgreSQL)
- **배포**: Vercel
- **인증**: JWT (jose) + bcryptjs

---

## 배포 가이드 (처음부터 끝까지)

### STEP 1. Supabase 프로젝트 생성

1. https://supabase.com 에 접속하여 로그인 (GitHub 계정 사용 가능)
2. 대시보드에서 **"New Project"** 클릭
3. 아래 정보를 입력:
   - **Organization**: 기본값 또는 새로 생성
   - **Name**: `yangsan-doc-manager`
   - **Database Password**: 안전한 비밀번호 입력 (따로 메모해 둘 것)
   - **Region**: `Northeast Asia (Seoul)` 선택
4. **"Create new project"** 클릭 후 2-3분 대기

### STEP 2. 데이터베이스 테이블 생성

1. Supabase 대시보드 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 클릭
3. 프로젝트의 `supabase/schema.sql` 파일 내용을 **전체 복사**하여 붙여넣기
4. **"Run"** 버튼 클릭 (또는 Ctrl+Enter)
5. `Success. No rows returned` 메시지가 나오면 성공

### STEP 3. 초기 데이터 삽입

1. SQL Editor에서 다시 **"New query"** 클릭
2. 프로젝트의 `supabase/seed.sql` 파일 내용을 **전체 복사**하여 붙여넣기
3. **"Run"** 버튼 클릭
4. 성공 후 왼쪽 메뉴 **"Table Editor"** 에서 데이터 확인:
   - `app_settings`: 1행 (비밀번호 해시)
   - `companies`: 5행 (히든식품 외 4개 업체)
   - `documents`: 7행 (히든식품 서류 7종)

### STEP 4. Supabase API 키 확인

1. Supabase 대시보드 왼쪽 메뉴 → **"Settings"** (톱니바퀴 아이콘)
2. **"API"** 탭 클릭
3. 아래 3가지 값을 메모:

| 항목 | 위치 | 용도 |
|------|------|------|
| **Project URL** | `https://xxxxxxxx.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon (public)** | Project API keys 섹션 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role (secret)** | Project API keys 섹션 (Reveal 클릭) | `SUPABASE_SERVICE_ROLE_KEY` |

> service_role 키는 절대 클라이언트에 노출하면 안 됩니다. 서버 사이드에서만 사용됩니다.

### STEP 5. GitHub 저장소 생성 및 푸시

```bash
# 프로젝트 폴더에서 실행
cd yangsan-doc-manager

git init
git add .
git commit -m "Initial commit: 양산학교급식협동조합 서류 만료 관리 시스템"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/yangsan-doc-manager.git
git push -u origin main
```

> `YOUR_USERNAME`은 실제 GitHub 사용자명으로 변경하세요.
> GitHub에서 먼저 빈 저장소를 생성해야 합니다 (README 체크 해제).

### STEP 6. Vercel 배포

1. https://vercel.com 에 접속하여 GitHub 계정으로 로그인
2. **"Add New..." → "Project"** 클릭
3. GitHub 저장소 목록에서 `yangsan-doc-manager` 선택 → **"Import"**
4. **Environment Variables** 섹션에서 아래 5개 변수를 추가:

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY      = eyJhbGciOi...
JWT_SECRET                     = (32자 이상 랜덤 문자열)
CRON_SECRET                    = (자유 설정)
```

**JWT_SECRET 생성 방법** (터미널에서):
```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]])

# 또는 아무 32자 이상 문자열 직접 입력
```

5. **"Deploy"** 클릭
6. 빌드 완료 후 제공되는 URL (예: `yangsan-doc-manager.vercel.app`)로 접속

### STEP 7. 접속 확인

1. 배포된 URL에 접속
2. 비밀번호 입력: `yangsan2026`
3. 대시보드에서 히든식품 서류 7종이 D-day와 함께 표시되는지 확인
4. 설정 페이지에서 관리자 모드 진입: `admin2026!`

### STEP 8. (선택) 일일 만료 체크 Cron 설정

프로젝트 루트에 `vercel.json` 파일을 생성하면 매일 자동으로 만료를 체크합니다:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-expiry",
      "schedule": "0 0 * * *"
    }
  ]
}
```

> Vercel Cron은 UTC 기준입니다. `0 0 * * *`은 UTC 00:00 = KST 09:00입니다.
> Vercel의 Hobby 플랜에서는 일 1회 Cron이 무료로 제공됩니다.

---

## 로컬 개발 환경

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 파일 생성
cp .env.example .env.local
# .env.local 파일을 열어 실제 Supabase 키 입력

# 3. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인합니다.

---

## 기본 비밀번호

| 용도 | 비밀번호 | 변경 방법 |
|------|---------|----------|
| 공용 접속 | `yangsan2026` | 설정 → 관리자 모드 → 접속 비밀번호 변경 |
| 관리자 모드 | `admin2026!` | 설정 → 관리자 모드 → 관리자 비밀번호 변경 |

> 배포 후 반드시 두 비밀번호를 모두 변경하세요.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (authenticated)/     # 인증 필요한 페이지들
│   │   ├── dashboard/       # 대시보드 (메인)
│   │   ├── documents/       # 서류 관리 (목록/상세)
│   │   ├── calendar/        # 캘린더 뷰
│   │   ├── companies/       # 업체 관리 (목록/상세)
│   │   └── settings/        # 설정
│   ├── api/                 # API 라우트
│   └── page.tsx             # 로그인 페이지
├── components/              # UI 컴포넌트
├── hooks/                   # 커스텀 훅
├── lib/                     # 유틸리티
└── types/                   # TypeScript 타입
supabase/
├── schema.sql               # DB 테이블 생성 스크립트
└── seed.sql                 # 초기 데이터 삽입 스크립트
```
