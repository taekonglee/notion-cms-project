"use client";

/**
 * 블로그 글 제목 기반 검색 입력 컴포넌트
 * 300ms debounce를 적용하여 입력 중 과도한 필터링 연산을 방지합니다.
 */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { BlogPost } from "@/types/blog";

/** SearchInput 컴포넌트 Props */
interface SearchInputProps {
  /** 검색 대상 전체 글 목록 */
  posts: BlogPost[];
  /** 필터링 결과를 전달하는 콜백 함수 */
  onFilter: (filtered: BlogPost[]) => void;
}

/**
 * 글 제목 기반 실시간 검색 입력 컴포넌트
 * @param posts - 검색 대상 전체 글 목록
 * @param onFilter - 필터링된 글 목록을 부모로 전달하는 콜백
 */
export function SearchInput({ posts, onFilter }: SearchInputProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    // 300ms debounce: 입력이 멈춘 후 필터링 실행
    const timer = setTimeout(() => {
      const filtered =
        query.trim() === ""
          ? posts
          : posts.filter((p) =>
              p.title.toLowerCase().includes(query.toLowerCase())
            );
      onFilter(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, posts, onFilter]);

  return (
    <Input
      type="search"
      placeholder="글 제목으로 검색..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="max-w-sm"
    />
  );
}
