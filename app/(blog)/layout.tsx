import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * 블로그 섹션 공통 레이아웃
 * 사이드바 없는 단순 Header + main + Footer 구조.
 * (blog) 라우트 그룹은 URL에 영향을 주지 않습니다.
 * @param children - 레이아웃 내부에 렌더링될 페이지 컨텐츠
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
