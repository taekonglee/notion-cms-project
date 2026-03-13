# 코드 리뷰어 메모리 — claude-nextjs-starters

## 첫 번째 전체 코드 리뷰 결과 (2026-03-08)

### 확인된 패턴 (올바른 구현)
- `useSyncExternalStore`를 사용한 하이드레이션 보호 패턴 — header.tsx에서 `useIsMounted()` 로컬 함수로 구현
- `SheetTitle` + `sr-only` 클래스로 스크린리더 접근성 처리 — mobile-nav.tsx
- `suppressHydrationWarning`은 `<html>` 태그에만 적용 (RootLayout)
- `SidebarProps` 인터페이스 분리 및 내보내기(export)는 현재 미사용 (sidebar.tsx에 선언만 있음)
- 모든 외부 링크에 `rel="noopener noreferrer"` 적용 완료

### 발견된 공통 이슈
1. **JSDoc @param/@returns 누락**: `lib/utils.ts`의 `cn()` 함수, `DashboardLayout`, `SettingsPage`, `AnalyticsPage`, `DashboardPage`, `MobileNav` 등 다수 함수에 JSDoc 없음
2. **프로필 설정 폼이 Server Component**: settings/page.tsx의 버튼에 onClick 핸들러 없고 "use client" 없음 — 실제 기능 없는 정적 UI
3. **알림 설정에 Switch 미사용**: 알림 ON/OFF를 Badge로 표시 중 (shadcn Switch 컴포넌트가 더 적합)
4. **`SidebarProps` 인터페이스 export 누락**: 외부에서 재사용 불가
5. **데이터 파일 분리 없음**: stats, activities, trafficSources 등 하드코딩된 mock 데이터가 페이지 컴포넌트 안에 직접 선언됨
6. **`bio` 필드에 Textarea 미사용**: Input으로 단일 라인 처리 중

### 파일별 주요 특이사항
- `app/layout.tsx`: React import 없음 (Next.js 13+에서는 불필요, 정상)
- `components/layout/footer.tsx`: JSDoc 있으나 @param/@returns 미존재 (props가 없는 컴포넌트라 허용 가능)
- `lib/utils.ts`: shadcn/ui 자동 생성 파일 — JSDoc 없음이 프로젝트 관례
- `app/page.tsx`: Server Component인데 Header 안에 MobileNav 포함 → MobileNav는 "use client"인데 Server에서 import 가능 (정상, Next.js가 자동 처리)

### 아키텍처 준수 여부
- (dashboard) 라우트 그룹 URL 구조 올바름 (/analytics, /settings — /dashboard/ 접두사 없음)
- DashboardLayout의 Sidebar + Header 2단 레이아웃 패턴 올바름
- ThemeProvider attribute="class", defaultTheme="system" 올바름
- Providers 컴포넌트에 "use client" 선언 올바름

자세한 내용: `patterns.md` 참고 (생성 예정)
