
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { RewriteSet } from '../types';
import { ICONS } from '../constants';

interface RewriteEngineProps {
  rewrites: RewriteSet;
  originalText?: string;
  checklists: {
    basic: string[];
    linkedin: string[];
    newsroom: string[];
    faq: string[];
    tldr: string[];
  };
}

const RewriteEngine: React.FC<RewriteEngineProps> = ({ rewrites, checklists, originalText }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'linkedin' | 'newsroom' | 'faq' | 'tldr'>('basic');
  const [isCompareMode, setIsCompareMode] = useState(false);

  const tabs = [
    { id: 'basic', label: '최적화 기본형 (블로그)' },
    { id: 'linkedin', label: '링크드인 포스트' },
    { id: 'newsroom', label: '보도자료 스타일' },
    { id: 'faq', label: 'Q&A 구조' },
    { id: 'tldr', label: 'TL;DR (핵심 요약)' },
  ];

  const content = rewrites[activeTab];
  // Fix literal \n characters if they appear as text
  const processedContent = typeof content === 'string' ? content.replace(/\\n/g, '\n') : '';
  
  const activeChecklist = checklists && checklists[activeTab] ? checklists[activeTab] : [];

  const getChecklistTitle = (id: string) => {
    switch(id) {
        case 'basic': return '블로그 SEO 최적화 포인트';
        case 'linkedin': return '링크드인 인게이지먼트 전략';
        case 'newsroom': return '보도자료 신뢰도 강화 팁';
        case 'faq': return 'Q&A 명확성 개선 가이드';
        case 'tldr': return '핵심 메시지 전달 전략';
        default: return '최적화 인사이트';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-zinc-200/50 border border-zinc-200 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ICONS.Rewrite className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-zinc-900 font-mono">AIEO 리라이트 엔진</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 font-mono uppercase">비교 모드</span>
            <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isCompareMode ? 'bg-indigo-600' : 'bg-zinc-300'}`}
            >
                <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isCompareMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* Main Rewrite Area */}
        <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex flex-nowrap space-x-2 mb-4 bg-zinc-100 p-1 rounded-lg w-full overflow-x-auto no-scrollbar pr-4">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 text-[10px] sm:text-xs md:text-sm font-bold font-mono rounded-md transition-all whitespace-nowrap min-w-max shrink-0 ${
                    activeTab === tab.id
                        ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>

            <div className={`grid gap-4 ${isCompareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {isCompareMode && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 sm:p-6 flex flex-col">
                         <div className="flex items-center gap-2 mb-3 sm:mb-4 text-zinc-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
                            <ICONS.Alert className="w-3 h-3" /> 원본 텍스트
                        </div>
                        <div className="text-zinc-500 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {originalText || "원본 텍스트가 없습니다."}
                        </div>
                    </div>
                )}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 sm:p-8 relative group min-h-[300px] sm:min-h-[400px] flex flex-col">
                    {isCompareMode && (
                        <div className="flex items-center gap-2 mb-3 sm:mb-4 text-indigo-500 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
                            <ICONS.Zap className="w-3 h-3" /> AIEO 최적화 결과
                        </div>
                    )}
                    <div className="markdown-body text-zinc-800 font-serif tracking-wide mb-8 pr-0 sm:pr-12">
                        <Markdown 
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                                h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mt-4 sm:mt-6 mb-3 sm:mb-4 font-sans" {...props} />,
                                p: ({node, ...props}) => <p className="mb-3 sm:mb-4 leading-7 sm:leading-8 text-sm sm:text-base" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 sm:pl-5 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 sm:pl-5 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base" {...props} />,
                                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-zinc-900" {...props} />,
                            }}
                        >
                            {processedContent}
                        </Markdown>
                    </div>
                    {/* Fixed Copy Button */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                        <button 
                            onClick={() => navigator.clipboard.writeText(processedContent)}
                            className="text-[10px] sm:text-xs bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded font-mono hover:bg-black hover:text-white hover:border-black transition-all flex items-center gap-2 shadow-sm"
                        >
                            <ICONS.Content className="w-3 h-3" /> <span className="hidden sm:inline">복사 (COPY)</span><span className="sm:hidden">복사</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Fix Checklist */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-indigo-100 h-fit mt-4 lg:mt-24">
            <h4 className="text-xs sm:text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
                <ICONS.Check className="w-3 h-3 sm:w-4 sm:h-4" /> {getChecklistTitle(activeTab)}
            </h4>
            <ul className="space-y-3 sm:space-y-4">
                {activeChecklist.length > 0 ? (
                    activeChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3 animate-fade-in">
                            <span className="mt-0.5 min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 bg-indigo-600 text-white rounded flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold shrink-0">
                                {idx + 1}
                            </span>
                            <span className="text-sm sm:text-base text-zinc-700 font-medium leading-snug">{item}</span>
                        </li>
                    ))
                ) : (
                    <li className="text-zinc-400 italic text-xs sm:text-sm">인사이트를 불러오는 중...</li>
                )}
            </ul>
        </div>
      </div>

      {/* AIEO 10 Commandments Section */}
      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-zinc-100">
        <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 sm:mb-6 font-mono flex items-center gap-2">
            <ICONS.Book className="w-4 h-4 sm:w-5 sm:h-5" />
            AIEO 리라이트 10계명
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
                { title: "1. 두괄식 배치", desc: "핵심 결론을 문단 첫 문장에 두세요." },
                { title: "2. 구체적 수치", desc: "모호한 표현 대신 정확한 데이터를 쓰세요." },
                { title: "3. 엔터티 명시", desc: "대명사(그것) 대신 브랜드명을 반복하세요." },
                { title: "4. Q&A 구조", desc: "사용자의 질문을 예상하고 답변하세요." },
                { title: "5. 간결한 문장", desc: "AI가 이해하기 쉽게 문장을 쪼개세요." },
                { title: "6. 명확한 정의", desc: "핵심 개념은 'A는 B다'로 정의하세요." },
                { title: "7. 논리적 연결", desc: "'왜냐하면', '따라서'로 인과를 잇으세요." },
                { title: "8. 권위자 인용", desc: "전문가나 CEO의 발언으로 신뢰를 높이세요." },
                { title: "9. 구조화 포맷", desc: "소제목과 불렛포인트를 적극 활용하세요." },
                { title: "10. 일관된 메시지", desc: "하나의 글에는 하나의 메시지만 담으세요." },
            ].map((item, idx) => (
                <div key={idx} className="bg-zinc-50 p-3 sm:p-4 rounded-lg border border-zinc-100 hover:border-zinc-300 transition-colors">
                    <div className="text-[9px] sm:text-xs font-mono font-bold text-indigo-600 mb-1">Rule {idx + 1}</div>
                    <div className="font-bold text-zinc-800 text-xs sm:text-sm mb-1">{item.title}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 leading-snug">{item.desc}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RewriteEngine;
