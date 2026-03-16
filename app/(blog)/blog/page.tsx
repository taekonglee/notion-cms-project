import type { Metadata } from "next";
import { fetchPublishedPosts, fetchCategories } from "@/lib/notion-api";
import { BlogListClient } from "@/components/blog/blog-list-client";

/** ISR: 60초마다 재검증 */
export const revalidate = 60;

/** 블로그 목록 페이지 SEO 메타데이터 */
export const metadata: Metadata = {
  title: "블로그 | Dev Blog",
  description: "개발 관련 글을 모아둔 블로그입니다.",
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

/**
 * 블로그 글 목록 페이지 — /blog
 * 카테고리 필터(URL ?category=)와 제목 검색을 지원합니다.
 * 서버에서 카테고리 pre-filter 후 BlogListClient로 전달합니다.
 * @param searchParams - URL 쿼리 파라미터 ({ category?: string })
 */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const selectedCategory = category ? decodeURIComponent(category) : null;

  // 글 목록과 카테고리 목록 병렬 조회
  const [allPosts, categories] = await Promise.all([
    fetchPublishedPosts({ pageSize: 100 }),
    fetchCategories(),
  ]);

  // 카테고리 선택 시 서버에서 pre-filter
  const filteredPosts = selectedCategory
    ? allPosts.filter((p) => p.category === selectedCategory)
    : allPosts;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">블로그</h1>
        <p className="text-muted-foreground">총 {filteredPosts.length}개의 글</p>
      </div>

      <BlogListClient
        initialPosts={filteredPosts}
        categories={categories}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
