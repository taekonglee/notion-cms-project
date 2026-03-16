/**
 * 글 목록 카드 로딩 Skeleton 컴포넌트
 * 데이터 로딩 중 CLS(Cumulative Layout Shift)를 방지하는 플레이스홀더
 */
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * PostCard 로딩 상태를 나타내는 Skeleton 플레이스홀더 컴포넌트
 * PostCard와 동일한 레이아웃 구조를 유지
 */
export function PostSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        {/* 카테고리 badge 자리 */}
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {/* 글 제목 자리 (2줄) */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-3">
        {/* 태그 badge 목록 자리 */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
        {/* 발행일 자리 */}
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}

interface PostSkeletonGridProps {
  /** 표시할 skeleton 카드 개수 (기본값: 6) */
  count?: number;
}

/**
 * PostSkeleton을 그리드 형태로 여러 개 렌더링하는 컴포넌트
 * @param count - 표시할 skeleton 카드 개수
 */
export function PostSkeletonGrid({ count = 6 }: PostSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}
