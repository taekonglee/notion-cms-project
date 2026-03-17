/**
 * On-Demand ISR 재검증 API 핸들러
 *
 * Notion 글 발행/수정 시 외부 HTTP 요청으로 Next.js 캐시를 즉시 무효화합니다.
 * 기존 revalidate=60 ISR을 보완하여 변경사항을 즉시 반영할 수 있습니다.
 *
 * 인증 방식: Authorization: Bearer <REVALIDATE_SECRET>
 *
 * 요청 body (JSON):
 *   { path?: string }  -- 특정 경로만 재검증 (예: /blog)
 *   { slug?: string }  -- 특정 글만 재검증 (예: my-post-slug)
 *   {}                 -- 전체 주요 경로 일괄 재검증
 *
 * 응답:
 *   200: { revalidated: true, paths: string[] }
 *   401: { error: string }
 *   500: { error: string }
 */
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/** 전체 재검증 시 대상이 되는 주요 경로 목록 */
const DEFAULT_PATHS = [
  "/",
  "/blog",
  "/blog/[slug]",
  "/category/[category]",
] as const;

/**
 * On-Demand ISR POST 핸들러
 * Authorization Bearer 토큰 인증 후 revalidatePath()로 캐시를 즉시 무효화합니다.
 *
 * @param request - NextRequest 객체
 * @returns NextResponse (200 성공 / 401 인증 실패 / 500 서버 오류)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. 환경변수 확인
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) {
      console.error("[api/revalidate] REVALIDATE_SECRET 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 2. Authorization 헤더 검증
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // "Bearer " 제거
    if (token !== secret) {
      return NextResponse.json(
        { error: "유효하지 않은 인증 토큰입니다." },
        { status: 401 }
      );
    }

    // 3. 요청 body 파싱
    let body: { path?: string; slug?: string } = {};
    try {
      body = await request.json();
    } catch {
      // body가 없거나 파싱 실패 시 전체 재검증으로 처리
    }

    // 4. 재검증 경로 결정 및 실행
    const revalidatedPaths: string[] = [];

    if (body.path) {
      // 특정 경로만 재검증
      revalidatePath(body.path);
      revalidatedPaths.push(body.path);
    } else if (body.slug) {
      // 특정 글 상세 페이지만 재검증
      const slugPath = `/blog/${body.slug}`;
      revalidatePath(slugPath);
      revalidatedPaths.push(slugPath);
    } else {
      // 전체 주요 경로 일괄 재검증
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath("/blog/[slug]", "page");
      revalidatePath("/category/[category]", "page");
      revalidatedPaths.push(...DEFAULT_PATHS);
    }

    return NextResponse.json({ revalidated: true, paths: revalidatedPaths });
  } catch (error) {
    console.error("[api/revalidate] 재검증 처리 중 오류가 발생했습니다:", error);
    return NextResponse.json(
      { error: "재검증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}