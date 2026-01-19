
import React from 'react';
import { ICONS } from '../constants';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in-up border border-zinc-200 z-[101]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ICONS.Book className="w-5 h-5 text-zinc-900" />
            <h2 className="text-lg font-bold font-mono text-zinc-900">User Guide</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-200 transition-colors text-zinc-500 hover:text-black"
          >
            <ICONS.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto leading-relaxed text-zinc-600 scroll-smooth">
          
          {/* Section 1: Intro */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono">1</span>
              AIEO란 무엇인가요?
            </h3>
            <p className="text-sm mb-3">
              <strong>AIEO (AI Information Engine Optimization)</strong>는 구글 제미나이, 챗GPT, 퍼플렉시티 같은 AI 검색 엔진이 내 콘텐츠를 잘 이해하고 인용하도록 최적화하는 과정입니다.
            </p>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 text-sm text-indigo-900 rounded-r-lg">
              "사람이 읽기 좋은 글과 <strong>AI가 읽기 좋은 글</strong>은 다릅니다. 이 도구는 두 마리 토끼를 잡을 수 있도록 도와줍니다."
            </div>
          </div>

          {/* Section 2: Scoring Criteria (New) */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono">2</span>
              채점 기준 상세 (Scoring Criteria)
            </h3>
            <p className="text-sm mb-4">
               이 도구는 문학적 표현력이 아닌 <strong>'기계가 정보를 얼마나 쉽게 구조화할 수 있는가'</strong>를 평가합니다. 점수가 높게 나온다면, AI가 당신의 글을 학습하기 좋은 상태라는 뜻입니다.
            </p>
            
            <div className="space-y-4">
                <div className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-green-600 font-bold font-mono text-sm">Excellent (90-100점)</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Ready to Cite</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                        완벽한 구조(소제목, 불렛포인트)를 갖추고 있으며, 모호한 표현 없이 <strong>구체적인 수치와 고유명사</strong>로 가득 찬 상태입니다. AI가 즉시 답변(Snippet)으로 인용할 수 있습니다.
                    </p>
                </div>
                <div className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-indigo-600 font-bold font-mono text-sm">Good (75-89점)</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Well Structured</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                        논리적인 흐름과 명확한 메시지를 갖추고 있습니다. 다만, <strong>문단이 너무 길거나(Wall of Text)</strong> 구체적인 데이터가 일부 부족하여 AI가 핵심을 요약하는 데 약간의 리소스가 더 필요합니다.
                    </p>
                </div>
                <div className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-amber-600 font-bold font-mono text-sm">Average (50-74점)</span>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Vague & Human-Only</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                        "업계 최고", "혁신적인" 같은 <strong>추상적인 마케팅 용어</strong>가 많고, 주어가 불분명합니다(예: '우리 회사는'). 사람은 이해하지만, AI는 이를 '사실(Fact)'로 받아들이지 않고 무시할 가능성이 높습니다.
                    </p>
                </div>
            </div>
          </div>

          {/* Section 3: How to Use */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono">3</span>
              어떻게 사용하나요?
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <ICONS.Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>입력:</strong> 보도자료, 블로그, FAQ 등 분석할 텍스트를 입력창에 붙여넣으세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <ICONS.Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>분석:</strong> '분석 시작' 버튼을 누르면 AI가 4가지 핵심 지표로 진단합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <ICONS.Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>최적화:</strong> '리라이트 엔진' 탭에서 AI가 제안한 개선된 문장을 확인하고 복사하세요.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Reliability */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono">4</span>
                기술적 신뢰성 (Reliability)
            </h3>
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-sm space-y-3">
                <p>
                이 점수는 랜덤한 수치가 아닙니다. <strong>LLM(거대언어모델)의 작동 원리</strong>와 <strong>RAG(검색 증강 생성) 알고리즘</strong>을 역설계하여 산출됩니다.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                <li><strong>정보 밀도 측정:</strong> AI가 텍스트를 벡터로 변환할 때, 정보량이 얼마나 풍부한지(Information Density)를 평가합니다.</li>
                <li><strong>RAG 적합성:</strong> 검색 엔진이 답변을 생성할 때 정보를 쉽게 '인출(Retrieve)'해올 수 있는 구조인지 분석합니다.</li>
                <li><strong>E-E-A-T 반영:</strong> 구글의 검색 품질 가이드라인 중 AI가 식별 가능한 정량적 요소(수치, 인용, 정의)를 기준으로 삼습니다.</li>
                </ul>
            </div>
          </div>

           {/* Section 5: Pro Tips (Renumbered) */}
           <div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono">5</span>
              Pro Tips: 점수 높이는 법
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm marker:text-zinc-400">
                <li>문단의 <strong>첫 문장</strong>에 핵심 주장을 배치하세요 (두괄식).</li>
                <li>"약 2배 증가"보다는 <strong>"198% 증가"</strong>처럼 구체적인 수치를 쓰세요.</li>
                <li>중요한 용어는 <strong>'정의(Definition)'</strong> 형태로 한 번 더 설명하세요.</li>
                <li>문서 끝부분에 <strong>[FAQ]</strong> 섹션을 추가하면 스니펫 추출 확률이 높아집니다.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-100 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-black text-white font-mono font-bold rounded-lg hover:bg-zinc-800 transition-colors"
            >
                닫기
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuideModal;
