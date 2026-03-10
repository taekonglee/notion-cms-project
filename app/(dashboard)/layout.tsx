import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * 대시보드 레이아웃
 * 데스크탑: 좌측 사이드바 + 우측 콘텐츠(헤더 + main)
 * 모바일: 헤더의 MobileNav를 통해 사이드바 접근
 * @param children - 레이아웃 내부에 렌더링될 페이지 컨텐츠
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 데스크탑 사이드바 */}
      <Sidebar className="hidden md:flex" />

      {/* 우측 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
