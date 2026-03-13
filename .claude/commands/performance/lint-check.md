---
description: 'ESLint와 성능 관련 문제를 검사하고, 자동 수정 가능한 항목을 처리합니다'
allowed-tools:
  [
    'Bash(npm run lint:*)',
    'Bash(npm run lint:fix:*)',
    'Bash(git diff:*)',
  ]
---

# Claude 명령어: Lint Check

ESLint와 성능 관련 문제를 검사하고, 자동 수정 가능한 항목을 처리합니다.

## 사용법

```
/lint-check
```

## 프로세스

1. ESLint 검사 실행
2. 자동 수정 가능한 문제 해결
3. 남은 문제 목록 분석
4. 성능 관련 경고 우선순위 표시

## 검사 항목

### 성능 관련
- `react-hooks/exhaustive-deps` — 불필요한 의존성
- `@next/next/no-img-element` — 최적화되지 않은 이미지
- `@next/next/no-unoptimized-font-files` — 폰트 최적화
- 미사용 변수/import

### 코드 품질
- 타입 관련 에러
- 문법 에러
- 스타일 규칙 위반

## 자동 수정 대상

- 들여쓰기 / 따옴표
- import 정렬
- 세미콜론
- 미사용 변수 제거

## 수동 검토 필요

- 의존성 추가/제거
- 컴포넌트 구조 변경
- 로직 리팩토링

## 참고사항

- 자동 수정 후 git diff로 변경 내용 확인
- 주요 규칙 위반은 별도 이슈로 추적
- 빌드 성공 후 실행 권장
