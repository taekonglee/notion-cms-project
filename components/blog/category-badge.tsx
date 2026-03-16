/**
 * 카테고리 Badge 컴포넌트
 * shadcn/ui Badge를 래핑하여 카테고리 표시에 특화된 스타일 제공
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  /** 표시할 카테고리명 */
  category: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 카테고리를 Badge 형태로 표시하는 컴포넌트
 * @param category - 표시할 카테고리명
 * @param className - 추가 CSS 클래스
 */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) return null;

  return (
    <Badge variant="secondary" className={cn("text-xs", className)}>
      {category}
    </Badge>
  );
}
