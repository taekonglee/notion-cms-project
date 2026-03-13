---
description: '프로덕션 빌드를 분석하여 번들 크기, 성능 메트릭을 확인합니다'
allowed-tools:
  [
    'Bash(npm run build:*)',
    'Bash(ls:*)',
    'Bash(find:*)',
    'Bash(du:*)',
  ]
---

# Claude 명령어: Build Analyze

프로덕션 빌드를 분석하여 번들 크기, 성능 메트릭을 확인합니다.

## 사용법

```
/build-analyze
```

## 프로세스

1. Next.js 프로덕션 빌드 실행
2. `.next` 디렉토리의 번들 크기 분석
3. 성능 메트릭 출력 (빌드 시간, 파일 크기)
4. 최적화 제안

## 출력 정보

- 빌드 시간
- 번들 크기 (JS, CSS)
- 페이지별 크기
- 최적화 가능 영역

## 최적화 포인트

### 번들 크기
- 큰 라이브러리 제거/대체
- Dynamic Import 활용
- Tree-shaking 확인

### 렌더링 성능
- 이미지 최적화
- 컴포넌트 분할
- 불필요한 re-render 제거

### 로딩 성능
- Code splitting
- Route prefetching
- Font 최적화

## 참고사항

- 빌드는 시간이 걸릴 수 있습니다 (1~3분)
- 기존 `.next` 디렉토리는 자동으로 삭제됩니다
- 분석 후 개선 항목은 별도 작업으로 진행
