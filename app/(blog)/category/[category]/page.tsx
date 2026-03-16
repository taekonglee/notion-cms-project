import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/blog/post-card";
import {
  fetchPublishedPosts,
  fetchCategories,
} from "@/lib/notion-api";

/** ISR: 60초마다 재검증 */
export const revalidate = 60;

interface Props {
  params: Promise<{ category: string }>;
}

/**
 * 빌드 시 카테고리 목록으로 정적 경로를 사전 생성
 * 한국어 카테고리명은 encodeURIComponent로 인코딩
 * @returns category 파라미터 배열
 */
export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((c) => ({ category: encodeURIComponent(c) }));
}

/**
 * 카테고리 페이지 동적 메타데이터 생성
 * @param params - URL 동적 세그먼트
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  return {
    title: `${decoded} | Dev Blog`,
    description: `${decoded} 카테고리의 블로그 글 목록입니다.`,
  };
}

/**
 * 카테고리별 글 목록 페이지 — /category/[category]
 * Promise.all로 글 목록과 카테고리 목록을 병렬 조회합니다.
 * @param params - URL 동적 세그먼트 ({ category: string })
 */
export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  // 글 목록과 카테고리 목록 병렬 조회
  const [allPosts, categories] = await Promise.all([
    fetchPublishedPosts(),
    fetchCategories(),
  ]);

  const filteredPosts = allPosts.filter(
    (post) => post.category === decodedCategory
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{decodedCategory}</h1>
        <p className="text-muted-foreground">
          총 {filteredPosts.length}개의 글
        </p>
      </div>

      {/* 카테고리 탭 내비게이션 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={cat === decodedCategory ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href={`/category/${encodeURIComponent(cat)}`}>{cat}</Link>
          </Button>
        ))}
      </div>

      {/* 글 목록 */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          이 카테고리에 발행된 글이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
