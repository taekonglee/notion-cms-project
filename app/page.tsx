import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PostCard } from "@/components/blog/post-card";
import { fetchPublishedPosts } from "@/lib/notion-api";

/** ISR: 60초마다 재검증 */
export const revalidate = 60;

/** 홈 페이지 SEO 메타데이터 */
export const metadata: Metadata = {
  title: "개발 블로그 | Dev Blog",
  description: "Notion으로 작성하고 자동으로 게시되는 개인 기술 블로그입니다.",
};

/**
 * 블로그 홈 페이지
 * 최근 발행된 글 최대 6개를 PostCard 그리드로 표시합니다.
 */
export default async function Home() {
  const posts = await fetchPublishedPosts({ limit: 6 });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        {/* 블로그 소개 헤더 */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">개발 블로그</h1>
          <p className="text-muted-foreground">
            Notion으로 작성하고 자동으로 게시되는 기술 블로그
          </p>
        </section>

        {/* 최근 글 목록 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">최근 글</h2>
            <Button variant="outline" asChild>
              <Link href="/blog">전체 글 보기</Link>
            </Button>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              아직 발행된 글이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
