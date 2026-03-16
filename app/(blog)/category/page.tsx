import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/lib/notion-api";

/** ISR: 60초마다 재검증 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "카테고리 | Dev Blog",
  description: "블로그 글을 카테고리별로 탐색하세요.",
};

/**
 * 전체 카테고리 목록 인덱스 페이지 — /category
 * 카테고리 카드 그리드를 표시합니다.
 */
export default async function CategoryIndexPage() {
  const categories = await fetchCategories();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">카테고리</h1>
        <p className="text-muted-foreground">
          총 {categories.length}개의 카테고리
        </p>
      </div>

      {/* 카테고리 목록 */}
      {categories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          등록된 카테고리가 없습니다.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Button key={cat} variant="outline" size="lg" asChild>
              <Link href={`/category/${encodeURIComponent(cat)}`}>{cat}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
