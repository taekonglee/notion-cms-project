import { Eye, MousePointer, Globe, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** 방문자 추이 데이터 */
const visitorStats = [
  {
    title: "페이지 조회수",
    value: "124,592",
    change: "+18.3%",
    positive: true,
    icon: Eye,
  },
  {
    title: "클릭률 (CTR)",
    value: "4.87%",
    change: "+1.2%",
    positive: true,
    icon: MousePointer,
  },
  {
    title: "해외 방문자",
    value: "31.4%",
    change: "-2.5%",
    positive: false,
    icon: Globe,
  },
  {
    title: "모바일 비율",
    value: "62.1%",
    change: "+5.8%",
    positive: true,
    icon: Smartphone,
  },
];

/** 트래픽 소스 데이터 */
const trafficSources = [
  { source: "자연 검색", visitors: 42350, percentage: 45 },
  { source: "직접 접속", visitors: 23800, percentage: 25 },
  { source: "소셜 미디어", visitors: 18960, percentage: 20 },
  { source: "이메일", visitors: 9480, percentage: 10 },
];

/** 기기 유형 데이터 */
const deviceTypes = [
  { device: "모바일", sessions: 58200, percentage: 62 },
  { device: "데스크탑", sessions: 28400, percentage: 30 },
  { device: "태블릿", sessions: 7500, percentage: 8 },
];

/**
 * 분석 페이지
 * 방문자 추이, 트래픽 소스, 기기 유형 통계를 표시합니다.
 */
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">분석</h1>
        <p className="text-muted-foreground">트래픽 및 방문자 통계를 확인하세요.</p>
      </div>

      {/* 방문자 추이 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visitorStats.map((stat) => {
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 트래픽 소스 */}
        <Card>
          <CardHeader>
            <CardTitle>트래픽 소스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{item.source}</span>
                    <span className="text-muted-foreground">
                      {item.visitors.toLocaleString()}명 ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 기기 유형 */}
        <Card>
          <CardHeader>
            <CardTitle>기기 유형</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceTypes.map((item) => (
                <div key={item.device}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{item.device}</span>
                    <span className="text-muted-foreground">
                      {item.sessions.toLocaleString()}세션 ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
