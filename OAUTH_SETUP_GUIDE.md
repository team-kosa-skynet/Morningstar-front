# OAuth 설정 가이드

## 현재 문제
- 백엔드가 OAuth 성공 후 `/auth/social`로 리다이렉트
- 프론트엔드는 HashRouter를 사용하므로 `/#/auth/social` 형태여야 함
- 이로 인해 Vercel에서 404 에러 발생

## 해결 방법

### 1. vercel.json 추가 (완료)
모든 경로를 index.html로 리다이렉트하는 설정을 추가했습니다.

### 2. 백엔드 설정 변경 필요
백엔드 개발자에게 다음 사항을 요청하세요:

#### OAuth 리다이렉트 URL 수정
```
현재: https://yourfrontend.vercel.app/auth/social
변경: https://yourfrontend.vercel.app/#/auth/social
```

#### 환경별 리다이렉트 URL 설정
- 개발: http://localhost:5173/#/auth/social
- 운영: https://yourfrontend.vercel.app/#/auth/social

## 임시 해결책
백엔드 수정이 어려운 경우, index.html에 다음 스크립트를 추가할 수 있습니다:

```html
<script>
  // OAuth 리다이렉트 처리
  if (window.location.pathname === '/auth/social') {
    const queryString = window.location.search;
    window.location.replace('/#/auth/social' + queryString);
  }
</script>
```

이 스크립트는 `/auth/social`로 접근 시 자동으로 `/#/auth/social`로 리다이렉트합니다.