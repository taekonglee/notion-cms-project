This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 환경변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 실제 값을 입력하세요.

```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|--------|------|
| `NOTION_API_KEY` | Notion Integration 시크릿 키 ([my-integrations](https://www.notion.so/my-integrations)) |
| `NOTION_DATABASE_ID` | Notion 데이터베이스 ID (DB 페이지 URL에서 추출) |
| `REVALIDATE_SECRET` | On-Demand ISR 인증 토큰 (임의의 강력한 문자열) |

## On-Demand ISR (즉시 재검증)

Notion에서 글을 발행하거나 수정한 뒤 `POST /api/revalidate`를 호출하면 60초를 기다리지 않고 즉시 캐시를 무효화할 수 있습니다.

### 인증

`Authorization: Bearer <REVALIDATE_SECRET>` 헤더를 포함해야 합니다.

### curl 예시

**전체 주요 경로 재검증** (`/`, `/blog`, `/blog/[slug]`, `/category/[category]`)

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H 'Authorization: Bearer your_secret' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**특정 글만 재검증**

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H 'Authorization: Bearer your_secret' \
  -H 'Content-Type: application/json' \
  -d '{"slug": "my-post-slug"}'
```

**특정 경로만 재검증**

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H 'Authorization: Bearer your_secret' \
  -H 'Content-Type: application/json' \
  -d '{"path": "/blog"}'
```

### 응답

```json
{ "revalidated": true, "paths": ["/blog/my-post-slug"] }
```

### Notion Automation / Make / Zapier 연동

외부 자동화 도구에서 Notion DB 변경 이벤트 발생 시 위 엔드포인트를 HTTP POST로 호출하도록 설정하면 글 발행 즉시 블로그에 반영됩니다. 프로덕션 환경에서는 `http://localhost:3000` 대신 Vercel 배포 URL을 사용하세요.
