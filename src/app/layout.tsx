/**
 * @file layout.tsx
 * @description Next.js 애플리케이션의 루트 레이아웃 파일입니다.
 * 모든 페이지에 공통적으로 적용되는 기본 구조, 스타일, 컨텍스트 프로바이더를 정의합니다.
 */

import type { Metadata } from "next";
import "./globals.css"; // 전역 CSS 스타일 가져오기
import { AuthProvider } from "@/context/AuthContext"; // 인증 상태 관리를 위한 컨텍스트 프로바이더
import Header from "@/components/layout/Header"; // 공통 헤더 컴포넌트

// 메타데이터 설정: 페이지의 제목과 설명을 정의합니다.
export const metadata: Metadata = {
  title: "K4CUT - Life Four Cuts AI",
  description: "Create your own Life Four Cuts with AI",
};

/**
 * RootLayout 컴포넌트
 * @param children - 레이아웃 내부에 렌더링될 하위 컴포넌트들 (페이지 컨텐츠)
 * @returns HTML 문서의 기본 구조를 포함한 레이아웃
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 
        body 스타일링:
        - min-h-screen: 최소 높이를 화면 전체로 설정
        - flex flex-col: 자식 요소들을 수직 방향으로 배치
        - bg-background text-foreground: 테마에 따른 배경색과 글자색 적용
        - antialiased: 폰트 렌더링 부드럽게 처리
      */}
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {/* AuthProvider로 애플리케이션 전체를 감싸 인증 상태 공유 */}
        <AuthProvider>
          {/* 모든 페이지 상단에 표시될 헤더 */}
          <Header />
          <div className="flex-1 flex flex-col items-center w-full">
            <main className="w-full flex-1">
              {children}
            </main>
          </div>
          <footer className="py-12 border-t border-border mt-auto">
            <div className="container-custom text-center space-y-2">
              <p className="text-secondary text-sm font-medium tracking-wide">K4CUT STUDIO</p>
              <p className="text-xs text-secondary/60 font-mono">
                © 2025 K4CUT. All rights reserved.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
