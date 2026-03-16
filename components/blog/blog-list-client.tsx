"use client";

/**
 * 블로그 목록 페이지의 검색 + 카테고리 필터를 통합하는 클라이언트 래퍼 컴포넌트
 * 서버에서 pre-filter된 글 목록을 받아 클라이언트 검색 필터링을 추가로 처리합니다.
 */
import { useEffect, useState } from "react";
import type { BlogPost } from "@/types/blog";
import { CategoryFilterWrapper } from "./category-filter";
import { SearchInput } from "./search-input";
import { PostCard } from "./post-card";

/** BlogListClient 컴포넌트 Props */
interface BlogListClientProps {
  /** 서버에서 카테고리 pre-filter된 글 목록 */
  initialPosts: BlogPost[];
  /** 전체 카테고리 목록 */
  categories: string[];
  /** 현재 선택된 카테고리 (null이면 전체) */
  selectedCategory: string | null;
}

/**
 * 카테고리 필터와 제목 검색을 통합하는 클라이언트 컴포넌트
 * @param initialPosts - 서버에서 카테고리 pre-filter된 글 목록
 * @param categories - 전체 카테고리 목록
 * @param selectedCategory - 현재 선택된 카테고리 (null이면 전체)
 */
export function BlogListClient({
  initialPosts,
  categories,
  selectedCategory,
}: BlogListClientProps) {
  const [displayedPosts, setDisplayedPosts] =
    useState<BlogPost[]>(initialPosts);

  // 카테고리 탭 변경 시(initialPosts 교체) displayedPosts 초기화
  useEffect(() => {
    setDisplayedPosts(initialPosts);
  }, [initialPosts]);

  return (
    <div>
      {/* 카테고리 필터 탭 */}
      <div className="mb-4">
        <CategoryFilterWrapper
          categories={categories}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* 검색 입력 */}
      <div className="mb-6">
        <SearchInput posts={initialPosts} onFilter={setDisplayedPosts} />
      </div>

      {/* 글 목록 */}
      {displayedPosts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
