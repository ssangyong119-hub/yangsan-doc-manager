import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '양산학교급식협동조합 - 서류 만료 관리',
  description: 'EAT 서류 만료일 자동 추적 및 알림 시스템',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a365d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#F7FAFC] text-[#1A202C]`}>
        {children}
      </body>
    </html>
  );
}
