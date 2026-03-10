"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

/**
 * 모바일 네비게이션 드로어 컴포넌트
 * md 이상 화면에서는 숨겨집니다.
 * Sheet(left) 기반으로 사이드바를 표시합니다.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="메뉴 열기">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">네비게이션 메뉴</SheetTitle>
          <Sidebar onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
