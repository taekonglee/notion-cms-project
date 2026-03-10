import { Users, Activity, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

/** 통계 카드 데이터 */
const stats = [
  {
    title: "총 방문자",
    value: "48,295",
    change: "+12.5%",
    positive: true,
    icon: Users,
  },
  {
    title: "활성 사용자",
    value: "2,847",
    change: "+8.2%",
    positive: true,
    icon: Activity,
  },
  {
    title: "수익",
    value: "₩12,450,000",
    change: "+23.1%",
    positive: true,
    icon: DollarSign,
  },
  {
    title: "전환율",
    value: "3.24%",
    change: "-0.4%",
    positive: false,
    icon: TrendingUp,
  },
];

/** 최근 활동 데이터 */
const activities = [
  { id: 1, message: "새 사용자 가입: user@example.com", time: "방금 전" },
  { id: 2, message: "결제 완료: ₩99,000", time: "2분 전" },
  { id: 3, message: "새 댓글이 달렸습니다", time: "5분 전" },
  { id: 4, message: "사용자 프로필 업데이트", time: "12분 전" },
  { id: 5, message: "새 주문 접수: #ORD-2847", time: "18분 전" },
  { id: 6, message: "이메일 캠페인 발송 완료", time: "25분 전" },
  { id: 7, message: "서버 백업 완료", time: "1시간 전" },
  { id: 8, message: "새 사용자 가입: dev@test.com", time: "2시간 전" },
];

/**
 * 대시보드 메인 페이지
 * 통계 카드 4개와 최근 활동 목록을 표시합니다.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">환영합니다! 주요 지표를 확인하세요.</p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                <Badge
                  variant={stat.positive ? "default" : "destructive"}
                  className="mt-1 text-xs"
                >
                  {stat.change}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{activity.message}</span>
                  <span className="text-muted-foreground whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
