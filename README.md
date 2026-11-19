# 마크업 품질 체크리스트

퍼블리싱 결과물(HTML)을 검수하는 체크리스트입니다. 9개 카테고리, 88개 항목으로 구성되어 있습니다.

- 체크리스트 화면: https://dreamcode0331.github.io/markup-checklist/
- 검수 기준 문서: [`docs/markup-checklist.md`](docs/markup-checklist.md)
- 기준 출처: marketplace `markup-rules-review`(정적 소스 검수), `markup-a11y`(WCAG 2.2 AA, KWCAG 2.2 병기)

Claude Code가 검수 기준 문서대로 HTML을 검수해 결과 JSON을 만들고, 체크리스트 화면에서 그 JSON을 불러와 남은 항목을 확인하는 방식입니다.

## 구성

| 구분 | 파일 | 역할 |
|---|---|---|
| 검수 기준 | `docs/markup-checklist.md` | Claude Code가 읽는 체크리스트 항목, 검수 원칙, 보고서 형식, 결과 JSON 형식 |
| 체크리스트 화면 | GitHub Pages | 결과 JSON을 불러와 항목을 체크하고 보고서를 내보내는 화면 |

체크리스트 화면은 프로젝트와 상관없이 위 주소에서 바로 쓸 수 있습니다. 다른 프로젝트에 가져갈 것은 검수 기준 문서 하나입니다.

## 다른 프로젝트에서 사용하기

### 1. 검수 기준 연결 (프로젝트마다 한 번)

1. `docs/markup-checklist.md`를 검수할 프로젝트의 `docs/` 폴더에 복사합니다.
2. 그 프로젝트 최상위의 `CLAUDE.md`에 아래 한 줄을 추가합니다. `CLAUDE.md`가 없으면 새로 만듭니다.

   ```md
   @./docs/markup-checklist.md
   ```

> 파일만 넣어 두면 적용되지 않습니다. Claude Code는 `CLAUDE.md`는 자동으로 읽지만 `docs/` 폴더의 파일은 읽지 않으므로 반드시 `CLAUDE.md`에 연결합니다.

`CLAUDE.md`를 수정하지 않으려면 요청할 때마다 문서를 직접 지정해도 됩니다.

```
docs/markup-checklist.md 기준으로 main.html 검수해줘
```

### 2. Claude Code에 검수 요청

그 프로젝트 폴더에서 Claude Code를 열고 요청합니다.

```
src/html/main.html 검수해줘
```

결과는 두 가지로 나옵니다.

- 터미널 보고서: `■ 마크업 검수 결과 — main.html` 형식
- 결과 JSON: `qa-results/checklist/main.html-YYYYMMDD.json` (검수한 프로젝트 안에 저장)

각 항목은 아래 상태 중 하나로 기록됩니다.

| 상태 | 의미 | 체크리스트 화면 |
|---|---|---|
| `pass` | 통과 | 자동 체크 |
| `na` | 해당 없음 (예: 테이블이 없는 페이지의 테이블 항목) | 자동 체크 |
| `fail` | 수정 필요 | 체크 해제 + 수정 방향과 `file:line` 표시 |
| `check` | 확인 필요 (소스만으로 판정 불가) | 체크 해제 + 담당 검수 표시 |

### 3. 체크리스트 화면에 결과 불러오기

1. [체크리스트 화면](https://dreamcode0331.github.io/markup-checklist/)을 엽니다.
2. 이전 검수 내용이 남아 있으면 **초기화**를 누릅니다.
3. **AI 결과 불러오기**를 누르고 2번에서 만든 JSON 파일을 선택합니다.

### 4. 확인 필요 항목 직접 확인

소스만으로 판정할 수 없는 항목입니다. 직접 확인하고 문제가 없으면 체크합니다.

| 항목 | 확인 방법 |
|---|---|
| 키보드 조작, 포커스 표시·가려짐, 타깃 크기, 확대·텍스트 간격 | `/markup-a11y:a11y-audit` 실행 또는 Tab 키로 직접 이동 |
| 자막, 번쩍임, hover 콘텐츠, 시간 제한 등 | `a11y-audit` 수동 체크리스트 |
| 레이아웃 깨짐, 가로 스크롤 | 320px~1920px로 창 크기 조절 또는 `markup-visual-qa` |
| 크로스브라우징 | Chrome, Safari, Firefox, Edge, Samsung Internet에서 확인 |
| LCP | 크롬 개발자 도구 Lighthouse |

### 5. 수정 후 재검수

`수정 필요` 항목을 고친 뒤 2번부터 다시 진행합니다. **수정 필요가 0건이면 통과**입니다. 전역 컨벤션·참고·확인 필요 항목은 통과 여부에 영향을 주지 않습니다.

### 6. 보고서 내보내기

**내보내기**를 누르면 마크다운 보고서(`.md`)가 내려받아집니다.

- 체크하지 않은 항목은 `수정 필요`로 집계됩니다.
- AI가 `check`로 남겼는데 아직 체크하지 않은 항목은 `확인 필요`로 집계됩니다.

## 알아두기

- 검수할 프로젝트에 `.claude/rules/`가 있으면 그 컨벤션(클래스 네이밍, 주석 규칙 등)을 먼저 적용합니다. 없으면 일반 기준으로 판정하고 보고서에 그 사실을 적습니다.
- 체크 상태와 불러온 결과는 사용 중인 브라우저에만 저장됩니다. 다른 사람과 공유할 때는 내보낸 보고서를 사용합니다.
- 체크리스트 항목이 바뀌면 이전에 만든 결과 JSON에는 새 항목이 없습니다. 새 항목이 `수정 필요`로 집계되므로 다시 검수해서 사용합니다.
- 검수 기준 문서가 업데이트되면 각 프로젝트에 복사한 파일도 새 버전으로 바꿔야 합니다.

## 체크리스트 수정·배포 (관리자용)

```bash
npm install        # 최초 1회
npm run dev        # 개발 서버 (http://localhost:3000, 수정 시 자동 새로고침)
npm run build      # dist/ 생성 (CSS 압축, HTML·JS 복사)
```

- 항목을 추가·수정할 때는 `index.html`과 `docs/markup-checklist.md`의 항목 id·우선순위·문구를 함께 맞춥니다.
- 스타일은 `css/pages/checklist.scss`, 동작은 `js/checklist.js`에서 수정합니다.
- 배포는 `npm run build`로 만든 `dist/` 내용을 `gh-pages` 브랜치에 올리면 GitHub Pages에 반영됩니다.
