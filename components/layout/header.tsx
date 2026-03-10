"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "./mobile-nav";

/**
 * SSR/CSR 환경에서 클라이언트 마운트 여부를 감지합니다.
 * useSyncExternalStore를 사용하여 하이드레이션 경고 없이 처리합니다.
 */
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * 테마 전환 드롭다운 컴포넌트
 * 하이드레이션 보호를 위해 mounted 상태 체크를 수행합니다.
 */
function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="테마 전환">
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          라이트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          다크
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          시스템
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 앱 헤더 컴포넌트
 * sticky 포지션으로 화면 상단에 고정됩니다.
 * 로고, 데스크탑 네비게이션, 테마 토글, 모바일 메뉴를 포함합니다.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* 로고 */}
        <Link href="/" className="font-bold text-lg mr-4">
          스타터킷
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">홈</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">대시보드</Link>
          </Button>
        </nav>

        {/* 우측 컨트롤 */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
