/**
 * 태그 Badge 목록 컴포넌트
 * 여러 태그를 Badge 목록으로 표시
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  /** 표시할 태그 목록 */
  tags: string[];
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 태그 배열을 Badge 목록으로 렌더링하는 컴포넌트
 * @param tags - 표시할 태그 문자열 배열
 * @param className - 추가 CSS 클래스 (wrapper div에 적용)
 */
export function TagBadge({ tags, className }: TagBadgeProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
