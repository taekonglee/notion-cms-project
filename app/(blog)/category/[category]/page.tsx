/**
 * 카테고리별 글 목록 페이지 — /category/[category]
 * Phase 4에서 Notion API 연동 및 카테고리 필터링으로 교체됩니다.
 * @param params - URL 동적 세그먼트 ({ category: string })
 */
export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  return (
    <div className="py-16 px-6">
      <h1 className="text-3xl font-bold">카테고리: {params.category}</h1>
      <p className="text-muted-foreground mt-2">카테고리 글 목록을 준비 중입니다.</p>
    </div>
  );
}
