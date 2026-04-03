# 마크업 품질 체크리스트

퍼블리싱 전 아래 항목을 기준으로 HTML을 검수한다.
항목을 위반하거나 누락된 경우 수정 방향을 함께 제안할 것.

---

## HTML 문서 구조

- [ ] `<!DOCTYPE html>` 최상단 선언 확인
- [ ] `<html lang="ko">` 언어 속성 명시
- [ ] `<meta charset="UTF-8">` 문자 인코딩 선언
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` 뷰포트 설정
- [ ] `<title>` 태그 작성 — 페이지별 고유하고 명확한 제목
- [ ] 헤딩 계층 구조 준수 — h1 → h2 → h3 순서, 건너뛰기 금지

---

## 시맨틱 마크업

- [ ] 시맨틱 태그 사용 — `header`, `nav`, `main`, `footer`, `article`, `section` 등
- [ ] `div` / `span` 남용 금지 — 의미 없는 래퍼 최소화
- [ ] 목록 태그 목적에 맞게 구분 — `ul`(비순서), `ol`(순서), `dl`(설명 목록)
- [ ] 데이터 테이블에만 `<table>` 사용 — `<thead>`, `<tbody>`, `<caption>` 포함
- [ ] 이동은 `<a>`, 동작은 `<button>` — 용도에 맞는 태그 사용

---

## 접근성 (Accessibility)

- [ ] 모든 `<img>`에 `alt` 속성 작성 — 장식 이미지는 `alt=""`
- [ ] `<label>`의 `for` ↔ `<input>`의 `id` 연결 확인
- [ ] 탭 키만으로 전체 기능 접근 가능 여부 확인
- [ ] 색상 대비 비율 준수 — 본문 텍스트 4.5:1 이상, 대형 텍스트 3:1 이상
- [ ] ARIA 속성 적절히 사용 — `aria-label`, `role` 등 과용 금지
- [ ] 포커스 스타일 유지 — `outline` 제거 시 대체 스타일 반드시 제공

---

## CSS / 스타일

- [ ] 스타일시트 외부 파일로 분리 — 인라인 `style` 속성 최소화
- [ ] 클래스 네이밍 규칙 일관성 유지 — BEM, SMACSS 등 프로젝트 규칙 통일
- [ ] `!important` 사용 최소화 — 남용 시 유지보수 어려움
- [ ] 반응형 브레이크포인트 확인 — 모바일, 태블릿, 데스크톱 모두 점검
- [ ] 미사용 CSS 제거 — 불필요한 스타일 정리

---

## 성능 / 로딩

- [ ] 이미지 최적화 — 적절한 포맷(WebP 권장)과 크기 사용
- [ ] CSS/JS 로딩 순서 — CSS는 `<head>`, JS는 `<body>` 하단 또는 `defer` / `async` 적용
- [ ] 불필요한 HTTP 요청 최소화 — 리소스 병합 및 스프라이트 검토
- [ ] 웹폰트 최적화 — `font-display: swap`, 서브셋 적용

---

## 크로스 브라우저 / 디바이스 호환성

- [ ] 주요 브라우저 확인 — Chrome, Safari, Firefox, Edge
- [ ] 모바일 기기 확인 — iOS Safari, Android Chrome
- [ ] 벤더 프리픽스 필요 여부 확인 — `-webkit-`, `-moz-` 등 호환성 속성
- [ ] 레거시 IE 지원 범위 확인 — 지원 범위에 따라 폴리필 적용

---

## 사용 방법

Claude Code에서 이 파일을 참조하려면 `CLAUDE.md`에 아래 한 줄을 추가한다.

```md
@./docs/markup-checklist.md
```

특정 파일 타입(HTML, Nunjucks 등)에서만 적용하려면 파일 상단에 아래 프론트매터를 추가한다.

```md
---
paths:
  - "**/*.html"
  - "**/*.njk"
---
```
