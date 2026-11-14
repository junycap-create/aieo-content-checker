<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AIEO Content Checker (Message House)

PR·마케팅 콘텐츠를 AI 검색(Gemini, ChatGPT, Perplexity, Claude)의 인용에 맞춰 진단하는 도구입니다.
프론트엔드는 React + Vite로 빌드되고, Gemini 호출은 **Vercel Serverless Function**인 `api/gemini.ts`가 대신 수행합니다.

## 구조

```
브라우저 (React)              Vercel Serverless Function           Google
services/geminiService.ts  →  api/gemini.ts  →  server/gemini-core.ts  →  Gemini API
        (키 없음)                (GEMINI_API_KEY 사용)
```

- `api/gemini.ts` — 유일한 HTTP 진입점
  - `GET  /api/gemini` → `{ ok, keyConfigured, model }`
  - `POST /api/gemini` `{ action: "analyze" | "rewrite" | "embed" | "health", text }`
  - 오류는 `error.code`와 함께 HTTP 상태로 내려갑니다: `402` 크레딧 소진, `429` 요청 한도, `503` 키 미설정/모델 과부하, `502` 키 거부·업스트림 오류, `400` 잘못된 요청.
- `server/gemini-core.ts` — 프롬프트·응답 스키마·오류 분류를 담은 서버 전용 모듈 (브라우저 번들에 포함되지 않습니다).
- `services/geminiService.ts` — `/api/gemini`를 호출하는 클라이언트. API 키를 절대 갖지 않습니다.

## 로컬 실행

**Prerequisites:** Node.js 20+

1. 의존성 설치
   `npm install`
2. `.env` 파일에 서버용 키를 넣습니다 (`.env.example` 참고)

   ```
   GEMINI_API_KEY=your-key
   ```

   `VITE_` 접두사를 쓰지 마세요. 접두사가 붙은 값은 브라우저 번들에 그대로 인라인됩니다.
3. 개발 서버 실행
   `npm run dev`

   `npm run dev`는 `api/gemini.ts`를 Vite 개발 서버 미들웨어로 그대로 띄우므로 별도 도구 없이 `/api/gemini`가 동작합니다.
   Vercel 환경을 그대로 재현하려면 `npx vercel dev`를 사용해도 됩니다.

## Vercel 배포

1. Project Settings → Environment Variables 에 `GEMINI_API_KEY`를 등록합니다 (Production / Preview / Development).
2. 재배포합니다. 키를 바꾸면 서버가 매 요청마다 환경변수를 다시 읽으므로 재배포만으로 반영됩니다.
3. 배포 후 `https://<도메인>/api/gemini` 를 열어 `{"ok":true,"keyConfigured":true,...}` 인지 확인합니다.

## 보안 원칙

- Gemini API 키는 서버 환경변수로만 보관합니다. 저장소·클라이언트 번들·`vite.config.ts`의 `define` 어디에도 넣지 않습니다.
- 빌드 결과물 검증: `npm run build` 후 `grep -r "AIza" dist/` 결과가 비어 있어야 합니다.
- 내부 기획 문서(프롬프트·대화 히스토리)는 저장소에 두지 않습니다. 필요하면 로컬에 보관하세요.

## 스크립트

- `npm run dev` — 개발 서버 (프론트 + `/api/gemini`)
- `npm run lint` — `tsc --noEmit` 타입 체크
- `npm run build` — 프로덕션 빌드 (`dist/`)
- `npm run preview` — 빌드 결과 미리보기 (API 호출은 배포된 함수가 필요합니다)
