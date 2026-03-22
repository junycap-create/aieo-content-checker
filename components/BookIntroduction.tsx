
import React from 'react';
import { ICONS } from '../constants';

interface BookIntroductionProps {
  onBack: () => void;
  onShowIntro: () => void;
}

const BookIntroduction: React.FC<BookIntroductionProps> = ({ onBack, onShowIntro }) => {
  const chapters = [
    {
      number: "01",
      title: "클릭은 사라지고 인용이 남는다",
      subtitle: "AI가 문장을 인용하는 시대",
      desc: "인용이 비즈니스를 좌우한다 / AI가 가져가기 쉽게 만드는 콘텐츠 전략, AIEO / 주요 4대 AI 검색 서비스의 작동 방식과 인용 기준의 결정적 차이"
    },
    {
      number: "02",
      title: "AI는 어디서 답을 가져올까?",
      subtitle: "소셜 미디어 채널별 전략",
      desc: "AI는 어떤 채널의 콘텐츠를 인용할까? / 주요 4대 채널별 AI 인용의 특성과 작동 기준 / 어디에 올려야 할까? - 4가지 실무자 유형별 AIEO 전략"
    },
    {
      number: "03",
      title: "AI는 어떤 콘텐츠를 믿을까?",
      subtitle: "EEAT, 토픽 권위도, 엔티티 현저성",
      desc: "AI가 인용하는 4대 기준 - EEAT로 선택받기 / 토픽 권위도 - 주제를 명확하게 보여 주기 / 엔티티 현저성 - 이름을 반복해서 노출하기"
    },
    {
      number: "04",
      title: "AI 시대의 문장 엔지니어링",
      subtitle: "AI와 인간을 동시에 설득하는 기술",
      desc: "이중 글쓰기 - AI가 인용하고 사람이 끝까지 읽는 문장 / AI와 인간을 동시에 설득하는 문단 조립법 / RAG - AI가 글을 집어 드는 방식 이해하기 / 청크 문장 - AI가 가져다 쓰기 좋은 문장으로 바꾸기 / 최종 점검! AIEO 적용 질문 10가지"
    }
  ];

  const highlights = [
    {
      title: "AI 인용의 정의",
      desc: "생성형 AI가 답변을 구성할 때 브랜드의 정보·문장·출처를 참고하거나 반영하는 상태를 의미합니다."
    },
    {
      title: "메시지 설계의 기술",
      desc: "AI가 이해하기 쉬운 구조와 사람이 신뢰하고 읽는 맥락을 함께 설계하여 AI 답변의 주인공이 됩니다."
    },
    {
      title: "국내 최초 AIEO 실무서",
      desc: "단순 노출을 넘어 브랜드의 정보가 AI 답변의 참고 대상으로 선택되는 구체적인 전략을 담았습니다."
    }
  ];

  const bookstoreLinks = [
    { name: "교보문고", url: "https://product.kyobobook.co.kr/detail/S000219385713" },
    { name: "Yes24", url: "https://www.yes24.com/product/goods/181117854" },
    { name: "알라딘", url: "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=387584181&srsltid=AfmBOopk156ehYJk9stWJqgF9a9pgwzp96NZaXyKVjeOUQQ_fSshac9Q" }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 selection:text-orange-900 animate-fade-in">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shrink-0 border border-zinc-800">
                    <span className="text-orange-500 font-mono font-bold text-lg tracking-tighter">MH</span>
                </div>
                <span className="font-bold font-mono text-xl text-zinc-900 hidden md:block tracking-tight">Message House</span>
              </div>
              <div className="hidden md:flex items-center gap-4">
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
                      NEW RELEASE
                  </span>
                  <span className="text-sm font-medium text-zinc-500 border-l border-zinc-200 pl-4 py-1">
                      신간 도서 소개
                  </span>
              </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onShowIntro} className="hidden md:block text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors">서비스 소개</button>
            <button 
              onClick={onBack}
              className="bg-zinc-900 hover:bg-black text-white px-4 md:px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <span>분석 도구로 돌아가기</span>
              <ICONS.ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 leading-tight tracking-tight">
              검색 상위노출만으로는<br/>충분하지 않습니다.
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-[#4CAF50] mb-10 leading-snug">
              이제 중요한 것은,<br/>
              AI 답변에 어떤 정보와 문장이<br/>
              반영되는가입니다
            </h3>
            
            <div className="space-y-6 text-zinc-600 leading-relaxed mb-10">
              <p>
                생성형 AI가 질문에 직접 답하는 환경이 빠르게 확산되면서, 사용자는 링크를 하나씩 비교하기보다 AI가 먼저 정리한 답변을 확인하는 데 익숙해지고 있습니다.
              </p>
              <p>
                이제 콘텐츠 경쟁은 단순한 노출을 넘어, 브랜드의 정보와 문장이 AI 답변의 참고 대상으로 선택될 수 있는가로 이동하고 있습니다.
              </p>
              <p>
                이 페이지에서 말하는 ‘AI 인용’은, 생성형 AI가 답변을 구성할 때 브랜드의 정보·문장·출처를 참고하거나 반영하는 상태를 뜻합니다.
              </p>
              <p className="font-medium text-zinc-900">
                메시지하우스는 이 변화에 맞춰, AI가 이해하기 쉬운 구조와 사람이 신뢰하고 읽는 맥락을 함께 설계하는 방법을 책과 컨설팅으로 제안합니다.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">온라인 서점 구매하기</p>
                <div className="flex flex-wrap gap-3">
                  {bookstoreLinks.map((link) => (
                    <a 
                      key={link.name}
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                      <ICONS.Download className="w-4 h-4" />
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-4 bg-orange-500/10 rounded-[2rem] blur-2xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
              <img 
                src="https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791163038320.jpg"
                alt="된다! AI 상위 노출 책 표지"
                referrerPolicy="no-referrer"
                className="relative w-full max-w-[320px] md:max-w-[400px] h-auto shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-lg transform rotate-2 hover:rotate-0 transition-transform duration-500 z-10 border border-zinc-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why this book? */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">왜 이 책을 읽어야 하는가?</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, idx) => (
              <div key={idx} className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  {idx === 0 ? <ICONS.Book className="w-6 h-6 text-orange-600" /> : 
                   idx === 1 ? <ICONS.Zap className="w-6 h-6 text-orange-600" /> : 
                   <ICONS.Search className="w-6 h-6 text-orange-600" />}
                </div>
                <h4 className="font-bold text-xl mb-4 text-zinc-900">{highlight.title}</h4>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  {highlight.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="py-24 bg-zinc-900 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center font-mono uppercase tracking-widest">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {chapters.map((chapter, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="text-4xl font-black text-orange-500/30 group-hover:text-orange-500 transition-colors font-mono">
                  {chapter.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-orange-400 transition-colors">{chapter.title}</h3>
                  {chapter.subtitle && (
                    <p className="text-orange-500/80 text-xs font-bold mb-3 uppercase tracking-wider">{chapter.subtitle}</p>
                  )}
                  <p className="text-zinc-400 text-sm leading-relaxed">{chapter.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-24 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-start gap-12">
            <div className="w-56 aspect-[3/4] bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 border-4 border-zinc-50 shadow-2xl overflow-hidden group/author">
             <img 
               src="/author_profile.jpg" 
               alt="저자 이중대 프로필"
               referrerPolicy="no-referrer"
               className="w-full h-full object-cover group-hover/author:scale-105 transition-transform duration-700"
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = "https://picsum.photos/seed/leejungdae/600/800";
               }}
             />
          </div>
          <div className="flex-1">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">저자 소개: 이중대</h3>
              <p className="text-orange-600 font-bold text-sm">PR & 디지털 콘텐츠 전략 컨설턴트</p>
            </div>
            
            <div className="text-zinc-600 leading-relaxed space-y-4 mb-8 text-sm md:text-base">
              <p>
                PR과 디지털 콘텐츠, 리더십 커뮤니케이션 전략 컨설턴트. 글로벌 PR 에이전시인 에델만(Edelman)과 웨버샌드윅(Weber Shandwick)에서 다국적 기업부터 스타트업까지 브랜드 전략 프로젝트를 수행했고, 디지털 콘텐츠 마케팅 회사인 소셜링크(Social Link)를 창업해 운영했다.
              </p>
              <p>
                현재 전략 커뮤니케이션 컨설팅을 주 업무로 하는 메시지하우스(Message House)에서 기업과 조직이 "무엇을, 어떻게, 어떤 언어로 말해야 하는가"를 설계한다. 최근에는 생성형 AI와 검색 환경 변화에 주목해, AIEO(AI Information Engine Optimization) 관점에서 콘텐츠와 메시지를 재설계하는 방법론을 연구하고 실무에 적용하고 있다. 이 책은 그 과정에서 받은 질문과 실험, 그리고 현장에서 검증된 인사이트를 정리한 결과물이다.
              </p>
              <p className="font-medium text-zinc-900 italic">
                "기술이 아무리 진화해도, 결국 선택받는 것은 구조화된 사고와 일관된 메시지다."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">주요 경력</h4>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    <span>(현) 메시지하우스 대표</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                    <span>(전) 에델만코리아 이사</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                    <span>(전) 웨버샌드윅코리아 대표</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                    <span>(전) 소셜링크 대표</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">저자와 소통하기</h4>
                <div className="space-y-3">
                   <a href="https://www.messagehouse.kr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-orange-600 transition-colors">
                     <ICONS.Zap className="w-4 h-4 text-orange-500" />
                     홈페이지
                   </a>
                   <a href="https://www.linkedin.com/in/junycap/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-orange-600 transition-colors">
                     <ICONS.Search className="w-4 h-4 text-orange-500" />
                     링크드인
                   </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-orange-600 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
          AI 검색 결과의 <span className="underline decoration-white/30">주인공</span>이 되세요.
        </h2>
        <p className="text-orange-100 text-lg mb-12 max-w-2xl mx-auto">
          지금 바로 서점에서 '된다! AI 상위 노출'을 만나보세요. <br/>
          당신의 마케팅 성과가 180도 달라집니다.
        </p>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bookstoreLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-5 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-zinc-50 shadow-xl transition-all flex flex-col items-center justify-center gap-1"
              >
                <span className="text-xs opacity-60 font-medium">{link.name}에서</span>
                <span>도서 주문하기</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-500 py-12 text-center text-sm font-mono">
        <p>© 2025 Message House & Easy Publishing. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BookIntroduction;
