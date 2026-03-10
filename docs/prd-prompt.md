docs 디렉토리를 만들고 docs/PRD.md 파일로 Notion CMS 활용 웹 프로젝트 PRD를 작성해줘.

프로젝트 개요:
- 프로젝트명: 개인 개발 블로그
- 목적: Notion을 CMS로 활용한 개인 기술 블로그
- CMS 선택 이유: Notion에서 글 작성하면 자동으로 블로그에 반영

주요 기능:
1. Notion 데이터베이스에서 블로그 글 목록 가져오기
2. 개별 글 상세 페이지 표시
3. 카테고리별 필터링
4. 검색 기능
5. 반응형 디자인

기술 스택:
- Frontend: Next.js 15, TypeScript
- CMS: Notion API (@notionhq/client)
- Styling: Tailwind CSS, shadcn/ui
- Icons: Lucide React
- Deployment: Vercel

Notion 데이터베이스 구조:
- Title: 제목 (title)
- Category: 카테고리 (select)
- Tags: 태그 (multi_select)
- Published: 발행일 (date)
- Status: 상태 (select) - 초안/발행됨
- Content: 본문 (page content)

화면 구성:
- 홈: 최근 글 목록
- 글 상세: 개별 글 내용 표시
- 카테고리: 카테고리별 글 목록

MVP 범위:
- Notion API 연동
- 글 목록 및 상세 페이지
- 기본 스타일링
- 반응형 디자인

구현 단계:
1. Notion API 패키지 설치 및 환경 설정
2. Notion 데이터베이스 생성 및 API 키 설정
3. 글 목록 페이지 구현
4. 글 상세 페이지 구현
5. 스타일링 및 최적화