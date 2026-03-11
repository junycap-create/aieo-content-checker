
import React, { useState } from 'react';
import { ICONS, APP_NAME } from '../constants';
import FAQSection from './FAQSection';

interface ServiceIntroductionProps {
  onBack: () => void;
}

const ServiceIntroduction: React.FC<ServiceIntroductionProps> = ({ onBack }) => {
  const [activeUseCase, setActiveUseCase] = useState(0);

  const useCases = [
    {
        title: "Case 1: 보도자료 (Press Release)",
        desc: "모호한 표현을 데이터 중심의 팩트로 변환",
        before: {
            text: "우리 회사는 이번에 혁신적인 AI 마케팅 툴을 새롭게 선보였습니다. 이 제품은 기존 방식보다 훨씬 빠르고 효율적입니다. 업계 관계자들의 많은 관심을 받고 있으며, 앞으로 시장을 선도할 것입니다.",
            analysis: "주어가 불분명(우리 회사)하고, '혁신적', '훨씬 빠르다' 등 추상적인 표현이 많아 AI가 신뢰할 수 없는 정보로 분류합니다."
        },
        after: {
            text: "메시지 하우스(Message House)는 콘텐츠 제작 시간을 평균 80% 단축하는 AI 마케팅 솔루션 'MH-Engine'을 출시했습니다. 베타 테스트 결과, ROAS가 3.5배 증가하는 성과를 입증했습니다.",
            analysis: "구체적 엔터티(메시지 하우스, MH-Engine)와 정량적 수치(80%, 3.5배)를 포함하여 AI가 신뢰할 수 있는 정보(Fact)로 인식합니다."
        }
    },
    {
        title: "Case 2: 기술 블로그 (Tech Blog)",
        desc: "장황한 설명글을 Q&A 구조로 명확화",
        before: {
            text: "API 연동 과정에서 발생할 수 있는 타임아웃 문제는 네트워크 지연이나 서버 과부하 때문일 수 있는데, 이럴 때는 재시도 로직을 넣거나 타임아웃 설정을 늘리는 것이 좋습니다. 그리고 에러 로그를 확인하는 것도 중요합니다.",
            analysis: "문장이 길고 인과관계가 혼재되어 있어, AI가 '해결 방법'을 명확히 추출하여 답변으로 구성하기 어렵습니다."
        },
        after: {
            text: "Q. API 타임아웃 발생 시 해결 방법은?\n1. 재시도 로직(Retry Logic) 구현 (Exponential Backoff 권장)\n2. 클라이언트 타임아웃 설정 값을 30초 이상으로 증대\n3. 서버 에러 로그 분석을 통한 병목 구간 확인",
            analysis: "질문(Q)과 해결책(List)이 명확히 구분된 구조로, AI가 즉시 스니펫(Snippet)으로 인용하기 최적화되었습니다."
        }
    },
    {
        title: "Case 3: CEO 메시지 (Leadership)",
        desc: "감성적 문구를 전략적 비전 메시지로 변환",
        before: {
            text: "사랑하는 임직원 여러분, 작년 한 해 정말 고생 많으셨습니다. 올해는 우리가 더 높이 비상하는 한 해가 되었으면 좋겠습니다. 모두 힘을 합쳐서 고객에게 감동을 줍시다. 파이팅!",
            analysis: "감정적 호소에 집중되어 있어, 회사의 구체적인 내년도 목표나 전략 방향이 AI 검색 결과에 남지 않습니다."
        },
        after: {
            text: "2025년, 우리는 '고객 경험의 초개인화'를 최우선 목표로 삼습니다. 이를 위해 R&D 예산을 30% 증액하고, AI 전담 조직을 신설할 것입니다. 우리의 비전은 '기술로 만드는 따뜻한 연결'입니다.",
            analysis: "명확한 목표(초개인화), 구체적 실행안(예산 증액, 조직 신설), 핵심 비전이 담겨 있어 AI가 회사의 방향성을 정확히 학습합니다."
        }
    }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 selection:text-orange-900 animate-fade-in">
      {/* Navigation Bar - Unified Design */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
              {/* Brand Logo - Consistent Style */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                <div className="w-10 h-10 bg-[#1a4031] rounded-lg flex items-center justify-center shrink-0 border border-[#2f5d48]">
                    <span className="text-orange-500 font-mono font-bold text-lg tracking-tighter">MH</span>
                </div>
                <span className="font-bold font-mono text-xl text-zinc-900 hidden md:block tracking-tight">Message House</span>
              </div>
              
              {/* Badge & Context - Unified Style */}
              <div className="hidden md:flex items-center gap-4">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
                      OPEN Beta
                  </span>
                  <span className="text-sm font-medium text-zinc-500 border-l border-zinc-200 pl-4 py-1">
                      소개합니다
                  </span>
              </div>
          </div>

          {/* Right Side Button - Leads to Tool (Bypassing Login) with ORANGE color */}
          <button 
            onClick={onBack}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <span>분석 도구로 이동</span>
            <ICONS.ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-50">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.5
        }}></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold font-mono mb-8 border border-orange-200 uppercase tracking-wide">
            <ICONS.Zap className="w-4 h-4" />
            The New Standard for AI Search
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 mb-8 leading-tight tracking-tight">
            AI가 당신의 브랜드를<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a4031] to-[#2f5d48]">기억하는 방식</span>을 설계하세요.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed font-light mb-12">
            검색의 시대가 끝났습니다. 이제는 <strong>'답변의 시대'</strong>입니다.<br className="hidden md:block"/>
            AIEO Content Checker는 당신의 메시지가 AI 검색엔진의<br className="hidden md:block"/>
            최우선 답변(Top Answer)이 되도록 돕는 <strong>최초의 진단 솔루션</strong>입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={onBack}
                className="px-8 py-4 bg-[#1a4031] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 hover:bg-[#235240] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
                <ICONS.Search className="w-5 h-5" />
                지금 내 콘텐츠 진단하기
            </button>
            <a 
                href="https://www.messagehouse.kr/contact" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold text-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-2"
            >
                문의하기
            </a>
          </div>
        </div>
      </section>

      {/* Problem Statement: The Shift */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 font-mono">Why AIEO Matters?</h2>
            <p className="text-lg text-zinc-500">링크를 클릭하던 시대에서, 대화로 답을 얻는 시대로 변화했습니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-zinc-200 text-zinc-500 px-3 py-1 text-xs font-bold font-mono rounded-bl-lg">OLD WAY</div>
                <h3 className="text-2xl font-bold text-zinc-400 mb-6">SEO (Search Engine Optimization)</h3>
                <ul className="space-y-4 text-zinc-500">
                    <li className="flex items-center gap-3">
                        <ICONS.X className="w-5 h-5 text-zinc-300" />
                        <span>키워드 반복 및 백링크 중심</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <ICONS.X className="w-5 h-5 text-zinc-300" />
                        <span>'링크 목록' 상위 노출이 목표</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <ICONS.X className="w-5 h-5 text-zinc-300" />
                        <span>사람이 읽기엔 부자연스러운 글</span>
                    </li>
                </ul>
            </div>

            <div className="bg-[#1a4031] p-8 rounded-2xl border border-[#2f5d48] relative overflow-hidden shadow-xl transform md:scale-105 transition-transform">
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-bold font-mono rounded-bl-lg">NEW STANDARD</div>
                <h3 className="text-2xl font-bold text-white mb-6">AIEO (AI Information Engine Optimization)</h3>
                <ul className="space-y-4 text-green-50">
                    <li className="flex items-center gap-3">
                        <ICONS.Check className="w-5 h-5 text-orange-400" />
                        <span><strong>의도(Intent)</strong>와 <strong>맥락(Context)</strong> 중심</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <ICONS.Check className="w-5 h-5 text-orange-400" />
                        <span>AI가 생성하는 <strong>'답변'</strong>에 인용되는 것이 목표</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <ICONS.Check className="w-5 h-5 text-orange-400" />
                        <span>구조화된 데이터와 논리적 서사</span>
                    </li>
                </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6 font-mono">Core Capabilities</h2>
                <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                    단순한 글쓰기 도구가 아닙니다. <br/>
                    AIEO Content Checker는 AI의 사고방식을 시뮬레이션하는 전략 도구입니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 hover:border-green-800/30 transition-colors">
                    <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <ICONS.Chart className="w-7 h-7 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">1. 정량적 진단 (Scoring)</h3>
                    <p className="text-zinc-500 leading-relaxed">
                        구조적 명확성, 데이터 밀도, 일관성을 분석하여 0~100점의 객관적 지표로 환산합니다. 감에 의존하던 PR을 데이터로 관리하세요.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 hover:border-green-800/30 transition-colors">
                    <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <ICONS.ScanEye className="w-7 h-7 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">2. AI 스니펫 시뮬레이션</h3>
                    <p className="text-zinc-500 leading-relaxed">
                        Perplexity나 ChatGPT Search가 당신의 문서를 어떻게 요약할지 미리 보여줍니다. 의도치 않은 왜곡을 사전에 방지하세요.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 hover:border-green-800/30 transition-colors">
                    <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <ICONS.Wand2 className="w-7 h-7 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">3. 자동 최적화 (Rewriting)</h3>
                    <p className="text-zinc-500 leading-relaxed">
                        문제를 발견하는 데 그치지 않습니다. AI가 좋아하는 '두괄식 구조'와 'Q&A 포맷'으로 문장을 자동으로 재구성해 줍니다.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Before & After Comparison (Expanded) */}
      <section className="py-24 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6 font-mono">See the Difference</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                AI가 읽기 어려운 문장을, <span className="text-orange-600 font-bold">인용하고 싶은 문장</span>으로 바꿉니다.
            </p>
            </div>

            {/* Use Case Tabs */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
                {useCases.map((useCase, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveUseCase(idx)}
                        className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                            activeUseCase === idx 
                            ? 'bg-[#1a4031] text-white shadow-lg transform scale-105' 
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                    >
                        {useCase.title}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch animate-fade-in">
                {/* Before Card */}
                <div className="bg-zinc-50 rounded-xl p-8 border border-zinc-200 relative">
                    <div className="absolute top-0 left-0 bg-zinc-200 text-zinc-600 px-4 py-1.5 rounded-tl-xl rounded-br-xl text-xs font-bold font-mono uppercase tracking-wider">
                    Before
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="flex gap-3">
                            <ICONS.X className="w-5 h-5 text-red-400 shrink-0 mt-1" />
                            <p className="text-zinc-500 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                {useCases[activeUseCase].before.text}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-zinc-100 text-xs text-red-500 font-mono mt-4">
                            <span className="font-bold block mb-1">⚠️ AI Analysis:</span>
                            {useCases[activeUseCase].before.analysis}
                        </div>
                    </div>
                </div>

                {/* After Card */}
                <div className="bg-green-50/50 rounded-xl p-8 border border-green-100 relative ring-1 ring-green-500/20 shadow-lg shadow-green-900/5">
                    <div className="absolute top-0 left-0 bg-[#1a4031] text-white px-4 py-1.5 rounded-tl-xl rounded-br-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                    After <ICONS.Check className="w-3 h-3" />
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="flex gap-3">
                            <ICONS.Check className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                            <p className="text-zinc-800 leading-relaxed font-medium text-sm md:text-base whitespace-pre-wrap">
                                {useCases[activeUseCase].after.text}
                            </p>
                        </div>
                        <div className="p-4 bg-white/80 rounded-lg border border-green-100 text-xs text-green-700 font-mono mt-4">
                            <span className="font-bold block mb-1">✅ AI Optimization:</span>
                            {useCases[activeUseCase].after.analysis}
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-center text-zinc-400 mt-8 text-sm font-mono">{useCases[activeUseCase].desc}</p>
        </div>
      </section>

      {/* Target Audience & Benefit */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-12 font-mono">Who Needs This?</h2>
            
            <div className="space-y-4 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="bg-green-100 p-2 rounded shrink-0 text-green-800 font-bold font-mono text-sm">PR</div>
                    <div>
                        <h4 className="font-bold text-zinc-900 text-lg">홍보/커뮤니케이션 팀</h4>
                        <p className="text-zinc-500">보도자료가 기사화되는 것을 넘어, AI의 지식 베이스에 정확히 학습되길 원할 때.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="bg-orange-100 p-2 rounded shrink-0 text-orange-800 font-bold font-mono text-sm">MKT</div>
                    <div>
                        <h4 className="font-bold text-zinc-900 text-lg">콘텐츠 마케터</h4>
                        <p className="text-zinc-500">블로그와 브랜드 저널이 검색 결과 상단(Featured Snippet)에 노출되길 원할 때.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="bg-zinc-200 p-2 rounded shrink-0 text-zinc-800 font-bold font-mono text-sm">CEO</div>
                    <div>
                        <h4 className="font-bold text-zinc-900 text-lg">경영진 및 리더</h4>
                        <p className="text-zinc-500">회사의 비전과 메시지가 시장에서 왜곡 없이 정확하게 전달되길 원할 때.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer CTA */}
      <section className="py-24 bg-[#1a4031] text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
          당신의 메시지, <br/>
          <span className="text-orange-500">AI가 기억하도록</span> 만드세요.
        </h2>
        <p className="text-green-100/80 text-lg mb-12 max-w-2xl mx-auto">
            메시지 하우스는 AI 시대에 최적화된 커뮤니케이션 전략을 제안합니다. <br/>
            지금 바로 무료로 진단해보세요.
        </p>
        <button 
            onClick={onBack}
            className="px-10 py-5 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 shadow-lg shadow-orange-900/50 hover:-translate-y-1 transition-all"
        >
            무료로 진단 시작하기
        </button>
      </section>

      {/* Footer Info */}
      <footer className="bg-zinc-900 text-zinc-500 py-12 text-center text-sm font-mono border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-6">
            <p className="mb-4">© 2025 Message House. All rights reserved.</p>
            <div className="flex justify-center gap-6">
                <a href="https://www.messagehouse.kr" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">홈페이지(메시지하우스)</a>
                <a href="https://www.messagehouse.kr/contact" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">문의하기</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceIntroduction;
