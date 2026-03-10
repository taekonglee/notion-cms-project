import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스명을 조건부로 병합합니다.
 * clsx로 조건 처리 후 tailwind-merge로 중복 클래스를 제거합니다.
 * @param inputs - 병합할 클래스값 목록 (문자열, 객체, 배열 등)
 * @returns 중복이 제거된 최종 클래스 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
