# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md

## 명령어

```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 검사
```

테스트 명령어는 현재 설정되어 있지 않습니다.

shadcn/ui 컴포넌트 추가:
```bash
npx shadcn@latest add <component-name>
```

## 아키텍처

### 라우팅 구조

App Router 기반이며, `(dashboard)` 라우트 그룹을 사용합니다.
**라우트 그룹은 URL에 영향을 주지 않습니다.**

```
app/
  layout.tsx              # RootLayout — Providers, Geist 폰트
  page.tsx                # / — 홈 소개 페이지
  globals.css             # Tailwind v4 CSS 변수 및 테마
  (dashboard)/
    layout.tsx            # 사이드바 + 헤더 2단 레이아웃
    dashboard/page.tsx    # /dashboard
    analytics/page.tsx    # /analytics  (URL: /analytics, NOT /dashboard/analytics)
    settings/page.tsx     # /settings   (URL: /settings,  NOT /dashboard/settings)
```

### 레이아웃 계층

- **RootLayout** (`app/layout.tsx`): `<Providers>`로 감싸 ThemeProvider + Toaster 제공
- **DashboardLayout** (`app/(dashboard)/layout.tsx`): 데스크탑은 `Sidebar` + `Header` + `main`, 모바일은 `Header` 안의 `MobileNav`로 사이드바 접근

### 컴포넌트

- `components/providers.tsx` — ThemeProvider(`attribute="class"`, `defaultTheme="system"`) + Toaster
- `components/layout/header.tsx` — sticky 헤더, ThemeToggle, MobileNav 포함
- `components/layout/sidebar.tsx` — `usePathname`으로 활성 링크 감지, `onNavClick` prop으로 모바일 Sheet 닫기
- `components/layout/mobile-nav.tsx` — Sheet 기반 드로어, `<Sidebar>`를 재사용
- `components/layout/footer.tsx` — 저작권 + 기술스택 링크 푸터
- `components/ui/` — shadcn/ui 자동 생성 컴포넌트 (직접 수정 주의)

### 하이드레이션 패턴

테마 등 클라이언트 전용 값을 렌더링할 때 `useEffect` + `setState` 대신 `useSyncExternalStore`를 사용합니다.
(`react-hooks/exhaustive-deps` 관련 lint 에러 방지)

```ts
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
```

### 스타일링

- Tailwind CSS v4 (`@import "tailwindcss"`) — CSS 변수 기반 테마, `oklch` 색상
- 다크모드: `.dark` 클래스 전환 방식 (`@custom-variant dark (&:is(.dark *))`)
- shadcn/ui 토큰: `--sidebar-*`, `--chart-*` 등 CSS 변수로 정의 (`globals.css`)
- 유틸리티: `cn()` = `clsx` + `tailwind-merge` (`lib/utils.ts`)

### 주요 라이브러리

| 용도 | 라이브러리 |
|------|-----------|
| 폼 | react-hook-form + zod + @hookform/resolvers |
| 날짜 | date-fns |
| 토스트 | sonner |
| 다크모드 | next-themes |
| 아이콘 | lucide-react |

### Server / Client Component 구분

| 파일 | 타입 |
|------|------|
| app/layout.tsx | Server |
| app/page.tsx | Server |
| app/(dashboard)/layout.tsx | Server |
| app/(dashboard)/dashboard/page.tsx | Server |
| app/(dashboard)/analytics/page.tsx | Server |
| app/(dashboard)/settings/page.tsx | Client (`"use client"`) |
| components/providers.tsx | Client |
| components/layout/header.tsx | Client |
| components/layout/sidebar.tsx | Client |
| components/layout/mobile-nav.tsx | Client |
| components/layout/footer.tsx | Server |

### 폼 패턴

react-hook-form + zod + shadcn `<Form>` 컴포넌트 조합 패턴:

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({
  field: z.string().min(1, "필수 항목입니다"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { field: "" },
  });

  async function onSubmit(data: FormData) {
    try {
      // API 호출 등
      toast.success("성공했습니다");
    } catch (error) {
      toast.error("오류가 발생했습니다");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>라벨</FormLabel>
              <FormControl>
                <Input placeholder="입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">제출</Button>
      </form>
    </Form>
  );
}
```

### shadcn/ui 설정

- style: `new-york`, baseColor: `neutral`, cssVariables: `true`, iconLibrary: `lucide`
- 설치된 컴포넌트 (18개): avatar, badge, breadcrumb, button, card, dialog, dropdown-menu, form, input, label, scroll-area, separator, sheet, skeleton, sonner, switch, textarea, tooltip

### Path Alias

`tsconfig.json`에 `@/*` 별칭이 설정되어 있습니다 (프로젝트 루트 기준):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

예: `import { cn } from "@/lib/utils"` → `./lib/utils`
