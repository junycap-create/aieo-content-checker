# AIEO Content Checker (AI 정보 엔진 최적화 진단 도구)

> **"검색의 시대에서 답변의 시대로. AI가 당신의 브랜드를 기억하는 방식을 설계하세요."**

AIEO Content Checker는 보도자료, 블로그, 마케팅 문구 등 PR 콘텐츠가 ChatGPT, Gemini, Perplexity와 같은 **LLM 기반 검색 엔진(AI Answer Engines)**에서 어떻게 해석되고 인용될지 정량적으로 분석하고 최적화해주는 전략 도구입니다.

---

## 1. 서비스 요약

본 서비스는 기존의 키워드 중심 SEO(검색 엔진 최적화)를 넘어, AI가 정보를 추출하고 구조화하기 용이하도록 만드는 **AIEO(AI Information Engine Optimization)** 전략을 지원합니다.

*   **정량적 진단:** 데이터 밀도, 구조적 명확성 등 4대 지표를 통해 100점 만점의 AIEO 점수 산출.
*   **답변 시뮬레이션:** 주요 AI 엔진들이 해당 콘텐츠를 어떤 형태의 Q&A 스니펫으로 요약할지 미리보기 제공.
*   **리라이트 엔진:** 블로그, 링크드인, 뉴스룸 등 채널별 특성에 맞춰 AI가 선호하는 구조로 문장을 자동 재구성.
*   **신뢰성 강화:** Google Gemini API의 엄격한 JSON Schema를 활용한 정확한 분석 리포트 생성.

---

## 2. 기술 스펙 (Tech Stack)

*   **Core:** React 19.2 (ESM)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Data Visualization:** Recharts (RadialBar, BarChart, AreaChart)
*   **AI Engine:** Google Gemini 2.5 Flash API (`@google/genai`)
*   **Architecture:** Component-based Architecture, Service-oriented Logic
*   **Formatting:** Enforced JSON Response Schema for reliable parsing
*   **Deployment:** Optimized for Vercel and similar static hosting environments

---

## 3. 주요 개발 프로세스

1.  **AIEO 프레임워크 설계:** RAG(검색 증강 생성) 알고리즘이 정보를 인출(Retrieve)하기 좋은 텍스트의 특성(정보 밀도, 구조화, 명확한 정의 등)을 지표화했습니다.
2.  **프롬프트 엔지니어링:** AI 모델이 일관된 분석 결과를 출력하도록 `responseSchema`를 적용하여 데이터의 무결성을 확보하고, 엄격한 채점 기준(Strict Scoring)을 수립했습니다.
3.  **UI/UX 디자인:** '메시지 하우스' 브랜드 아이덴티티를 반영한 전문적인 인터페이스와 인터랙티브한 데이터 시각화를 구현했습니다.
4.  **Admin 및 보안:** 실시간 분석 로그 및 시스템 관리를 위한 관리자 대시보드와 소셜 공유 최적화(OG Meta) 기능을 통합했습니다.

---

## 4. 사용 프로세스 (Usage Flow)

1.  **콘텐츠 입력:** 분석할 텍스트(보도자료, 블로그 등)를 입력창에 붙여넣습니다 (최소 50자 이상 권장).
2.  **AI 진단 실행:** '분석 시작' 버튼을 누르면 AI가 실시간으로 4대 지표를 진단합니다.
3.  **결과 분석:**
    *   **Total Score:** 콘텐츠의 전반적인 AI 친화도를 점수로 확인합니다.
    *   **AI 스니펫:** AI 검색 엔진이 답변으로 활용할 예상 텍스트를 검토합니다.
4.  **콘텐츠 최적화:**
    *   **리라이트 엔진:** 블로그, 링크드인 등 각 채널에 최적화된 재작성 결과를 복사합니다.
    *   **체크리스트:** 제안된 개선 포인트를 원본 콘텐츠에 반영합니다.
5.  **리포트 활용:** PDF 저장 기능을 통해 분석 결과를 문서화하거나 팀원들과 공유합니다.

---

### Copyright

**Copyright © 2025 이중대 (Message House). All rights reserved.**
본 소프트웨어와 관련된 모든 권리는 이중대(메시지 하우스)에 있으며, 무단 복제 및 상업적 이용을 금합니다.
