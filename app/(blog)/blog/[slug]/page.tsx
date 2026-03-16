/**
 * 블로그 글 상세 페이지 — /blog/[slug]
 * Phase 3에서 Notion Blocks API 연동 및 실제 본문 렌더링으로 교체됩니다.
 * @param params - URL 동적 세그먼트 ({ slug: string })
 */
export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="py-16 px-6">
      <h1 className="text-3xl font-bold">글 상세</h1>
      <p className="text-muted-foreground mt-2">slug: {params.slug}</p>
    </div>
  );
}
