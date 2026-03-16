"use client";

/**
 * 카테고리 필터 탭 클라이언트 컴포넌트
 * URL ?category= 쿼리 파라미터 기반으로 카테고리 필터 상태를 관리합니다.
 * useSearchParams() 사용으로 인해 Suspense 경계가 필요합니다.
 * → CategoryFilterWrapper를 사용하거나 호출부에서 Suspense로 감싸세요.
 */
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/** CategoryFilter 컴포넌트 Props */
interface CategoryFilterProps {
  /** 전체 카테고리 목록 */
  categories: string[];
  /** 현재 선택된 카테고리 (null이면 전체) */
  selectedCategory: string | null;
}

/**
 * 카테고리 필터 탭을 렌더링하는 내부 컴포넌트
 * @param categories - 표시할 카테고리 목록
 * @param selectedCategory - 현재 선택된 카테고리명 (null이면 전체)
 */
function CategoryFilterInner({
  categories,
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  useSearchParams(); // URL 변경 감지용 (실제 값은 서버에서 전달받은 selectedCategory 사용)

  /**
   * 카테고리 탭 선택 핸들러
   * @param category - 선택한 카테고리명 (null이면 전체)
   */
  function handleSelect(category: string | null) {
    if (category === null) {
      router.push("/blog");
    } else {
      router.push("/blog?category=" + encodeURIComponent(category));
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 탭 */}
      <Button
        variant={selectedCategory === null ? "default" : "ghost"}
        size="sm"
        onClick={() => handleSelect(null)}
      >
        전체
      </Button>

      {/* 카테고리별 탭 */}
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}

/**
 * Suspense 경계를 포함한 CategoryFilter 래퍼 컴포넌트
 * useSearchParams()를 사용하는 컴포넌트는 반드시 Suspense로 감싸야 합니다.
 * @param categories - 표시할 카테고리 목록
 * @param selectedCategory - 현재 선택된 카테고리명 (null이면 전체)
 */
export function CategoryFilterWrapper(props: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="h-9" />}>
      <CategoryFilterInner {...props} />
    </Suspense>
  );
}
