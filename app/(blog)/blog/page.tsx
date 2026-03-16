import { PostCard } from "@/components/blog/post-card";
import { fetchPublishedPosts } from "@/lib/notion-api";

/** ISR: 60초마다 재검증 */
export const revalidate = 60;

/**
 * 블로그 글 목록 페이지 — /blog
 * 발행된 전체 글을 카드 그리드로 표시합니다.
 * Phase 4에서 카테고리 필터 및 검색 UI가 추가될 예정입니다.
 */
export default async function BlogPage() {
  const posts = await fetchPublishedPosts();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">블로그</h1>
        <p className="text-muted-foreground">총 {posts.length}개의 글</p>
      </div>

      {/* Phase 4: 카테고리 필터 및 검색 UI 영역 — 추후 추가 */}

      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          아직 발행된 글이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
