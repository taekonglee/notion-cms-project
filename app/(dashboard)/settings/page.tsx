"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/* ========== 스키마 정의 ========== */

const profileSchema = z.object({
  firstName: z.string().min(1, "이름은 필수입니다."),
  lastName: z.string().min(1, "성은 필수입니다."),
  email: z.string().email("유효한 이메일을 입력하세요."),
  bio: z.string().max(160, "소개는 160자 이하여야 합니다."),
});

const notificationsSchema = z.object({
  marketing: z.boolean(),
  security: z.boolean(),
  weeklyReport: z.boolean(),
});

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호는 필수입니다."),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "비밀번호 확인은 필수입니다."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type NotificationsFormValues = z.infer<typeof notificationsSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

/**
 * 설정 페이지
 * 프로필, 알림, 보안 섹션으로 구성됩니다.
 */
export default function SettingsPage() {
  /* ========== 프로필 폼 ========== */
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    toast.success("프로필이 저장되었습니다.");
    console.log("Profile submitted:", data);
  };

  /* ========== 알림 폼 ========== */
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      marketing: false,
      security: true,
      weeklyReport: true,
    },
  });

  const onNotificationsSubmit = (data: NotificationsFormValues) => {
    toast.success("알림 설정이 저장되었습니다.");
    console.log("Notifications submitted:", data);
  };

  /* ========== 보안 폼 ========== */
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSecuritySubmit = (data: SecurityFormValues) => {
    toast.success("비밀번호가 변경되었습니다.");
    console.log("Security submitted:", data);
    securityForm.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-muted-foreground">계정 및 애플리케이션 설정을 관리하세요.</p>
      </div>

      {/* ========== 프로필 설정 ========== */}
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>공개 프로필 정보를 업데이트합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input placeholder="홍" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>성</FormLabel>
                      <FormControl>
                        <Input placeholder="길동" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hong@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소개</FormLabel>
                    <FormControl>
                      <Textarea placeholder="간단한 자기소개를 입력하세요." {...field} />
                    </FormControl>
                    <FormDescription>최대 160자</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">프로필 저장</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* ========== 알림 설정 ========== */}
      <Card>
        <CardHeader>
          <CardTitle>알림</CardTitle>
          <CardDescription>이메일 및 푸시 알림 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
              <FormField
                control={notificationsForm.control}
                name="marketing"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>마케팅 이메일</FormLabel>
                      <FormDescription>새 기능 및 업데이트 소식을 받습니다.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="security"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>보안 알림</FormLabel>
                      <FormDescription>계정 로그인 및 보안 이벤트 알림을 받습니다.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="weeklyReport"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>주간 리포트</FormLabel>
                      <FormDescription>매주 통계 요약 리포트를 받습니다.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">알림 설정 저장</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* ========== 보안 설정 ========== */}
      <Card>
        <CardHeader>
          <CardTitle>보안</CardTitle>
          <CardDescription>비밀번호 및 계정 보안을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
              <FormField
                control={securityForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="현재 비밀번호 입력" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={securityForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="새 비밀번호 입력" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={securityForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="새 비밀번호 재입력" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="destructive">비밀번호 변경</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
