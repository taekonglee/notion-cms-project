---
description: 'Lighthouse로 성능, 접근성, SEO, 최고의 관행을 감사합니다'
allowed-tools:
  [
    'Bash(npm run dev:*)',
    'Bash(npm run build:*)',
    'Bash(npm run start:*)',
    'Bash(curl:*)',
    'Bash(ps:*)',
  ]
---

# Claude 명령어: Lighthouse

Lighthouse로 성능, 접근성, SEO, 최고의 관행을 감사합니다.

## 사용법

```
/lighthouse
```

## 프로세스

1. 프로덕션 빌드 실행
2. 서버 시작
3. Lighthouse CI 또는 Chrome DevTools로 감사
4. 보고서 분석
5. 서버 종료

## 감사 항목

### Performance (성능)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

### Accessibility (접근성)
- ARIA 속성 검증
- 색상 명도 비율
- 포커스 관리
- 의미론적 HTML

### SEO
- 메타 태그
- 구조화된 데이터
- Mobile-friendly
- 페이지 속도

### Best Practices (최고의 관행)
- HTTPS 사용
- 콘솔 에러 없음
- 라이브러리 버전 관리
- 보안 취약점

## 개선 우선순위

1. **Performance** — 사용자 경험 직접 영향
2. **Accessibility** — 포용성과 법적 준수
3. **SEO** — 검색 가시성
4. **Best Practices** — 유지보수성

## 참고사항

- 감사는 네트워크 상태에 따라 변동
- 모바일과 데스크톱 모두 확인 권장
- 각 항목별 개선 제안 제공
- 점수 90점 이상 목표
