import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/** 기술스택 카드 데이터 */
const techStack = [
  {
    name: "Next.js 16",
    description: "App Router 기반 풀스택 React 프레임워크",
  },
  {
    name: "Tailwind CSS v4",
    description: "유틸리티 퍼스트 CSS 프레임워크",
  },
  {
    name: "shadcn/ui",
    description: "Radix UI 기반 접근성 우선 컴포넌트",
  },
  {
    name: "TypeScript",
    description: "정적 타입으로 안전한 코드 작성",
  },
];

/** 주요 기능 목록 */
const features = [
  "다크모드 / 라이트모드 / 시스템 테마 전환",
  "SSR 안전한 FOUC 없는 테마 처리",
  "반응형 사이드바 + 모바일 드로어",
  "Sonner 기반 글로벌 토스트 알림",
  "React Hook Form + Zod 폼 검증",
  "shadcn/ui 컴포넌트 라이브러리",
  "대시보드 레이아웃 라우트 그룹",
  "TypeScript 완전 지원",
];

/**
 * 홈 소개 페이지
 * Hero, 기술스택, 주요 기능, 시작 가이드 섹션으로 구성됩니다.
 */
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero 섹션 */}
        <section className="py-20 px-6 text-center">
          <Badge variant="outline" className="mb-4">
            v1.0.0
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            모던 웹 스타터킷
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Next.js 16 + Tailwind CSS v4 + shadcn/ui로 구성된
            즉시 사용 가능한 웹 애플리케이션 스타터킷입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">대시보드 보기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
          </div>
        </section>

        {/* 기술스택 카드 */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">기술스택</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {techStack.map((tech) => (
                <Card key={tech.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{tech.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tech.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">주요 기능</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 시작 가이드 */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">시작하기</h2>
            <div className="rounded-lg bg-zinc-950 dark:bg-zinc-900 p-6 font-mono text-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">1</span>
                <span className="text-zinc-300">
                  git clone https://github.com/your-username/nextjs-starter
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">2</span>
                <span className="text-zinc-300">cd nextjs-starter</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">3</span>
                <span className="text-zinc-300">npm install</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">4</span>
                <span className="text-green-400">npm run dev</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
