"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/** 사이드바 네비게이션 항목 정의 */
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/analytics", icon: BarChart3, label: "분석" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export interface SidebarProps {
  className?: string;
  /** 링크 클릭 시 호출되는 콜백 (모바일 Sheet 닫기용) */
  onNavClick?: () => void;
}

/**
 * 대시보드 사이드바 컴포넌트
 * usePathname으로 활성 경로를 감지하여 하이라이트 처리합니다.
 * @param className - 추가 CSS 클래스
 * @param onNavClick - 링크 클릭 콜백
 */
export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "w-64 h-full bg-sidebar border-r flex flex-col",
        className
      )}
    >
      {/* 로고 영역 */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="font-bold text-lg text-sidebar-foreground">
          스타터킷
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
