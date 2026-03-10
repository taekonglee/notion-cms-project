/**
 * Auth 레이아웃
 * 로그인, 회원가입 등 인증 페이지용 전체화면 중앙정렬 레이아웃입니다.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}
