/**
 * 블로그 글 목록 카드 컴포넌트
 * 글 제목, 카테고리, 태그, 발행일을 카드 형태로 표시
 */
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/blog";
import { CategoryBadge } from "./category-badge";
import { TagBadge } from "./tag-badge";

interface PostCardProps {
  /** 표시할 블로그 글 데이터 */
  post: BlogPost;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 블로그 글 목록에서 사용하는 카드 컴포넌트
 * 클릭 시 /blog/[slug] 페이지로 이동
 *
 * @param post - BlogPost 타입의 글 데이터
 * @param className - 추가 CSS 클래스
 */
export function PostCard({ post, className }: PostCardProps) {
  const { title, category, tags, publishedAt, slug } = post;

  // 발행일 포맷: "2025. 03. 16." 형식
  const formattedDate = publishedAt
    ? format(parseISO(publishedAt), "yyyy. MM. dd.", { locale: ko })
    : "";

  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <Card
        data-testid="post-card"
        className={cn(
          "flex flex-col h-full transition-all duration-200",
          "hover:shadow-md hover:-translate-y-0.5",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring",
          className
        )}
      >
        <CardHeader className="pb-3">
          <CategoryBadge category={category} />
        </CardHeader>

        <CardContent className="flex-1 pt-0">
          <h2 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h2>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 pt-3">
          <TagBadge tags={tags} />
          {formattedDate && (
            <time
              dateTime={publishedAt}
              className="text-xs text-muted-foreground"
            >
              {formattedDate}
            </time>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
