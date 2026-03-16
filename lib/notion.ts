/**
 * Notion API 클라이언트 설정 및 재시도 유틸리티
 * Rate Limit(HTTP 429) 처리를 포함한 안전한 API 호출 래퍼 제공
 */
import { Client } from "@notionhq/client";

/** Notion API 클라이언트 싱글톤 인스턴스 */
export const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

/** 환경 변수에서 Notion 데이터베이스 ID 가져오기 */
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

/**
 * Notion API 호출 시 Rate Limit 재시도 래퍼
 * HTTP 429 응답 수신 시 Retry-After 헤더 값만큼 대기 후 재시도 (최대 3회)
 * Notion API 제한: 초당 평균 3개 요청
 *
 * @param fn - 실행할 비동기 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @returns 함수 실행 결과
 * @throws 429 외 에러 또는 최대 재시도 초과 시 에러 throw
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      // Notion API 에러 타입 체크 (HTTPResponseError)
      const isRateLimitError =
        error instanceof Error &&
        "status" in error &&
        (error as { status: number }).status === 429;

      if (!isRateLimitError || attempt >= maxRetries) {
        throw error;
      }

      // Retry-After 헤더에서 대기 시간 추출 (초 단위 → ms 변환)
      const retryAfterSeconds =
        error instanceof Error && "headers" in error
          ? Number(
              (error as { headers?: Record<string, string> }).headers?.[
                "retry-after"
              ] ?? "1"
            )
          : 1;

      const waitMs = retryAfterSeconds * 1000;

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      attempt++;
    }
  }

  // TypeScript를 위한 fallback (실제로는 도달하지 않음)
  throw new Error("최대 재시도 횟수를 초과했습니다.");
}
