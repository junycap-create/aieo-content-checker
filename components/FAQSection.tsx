
import React, { useState } from 'react';
import { ICONS } from '../constants';

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "AIEO 점수는 어떤 기준으로 산출되나요?",
      answer: "AIEO 점수는 LLM이 텍스트를 처리하는 방식(토큰화, 임베딩, 검색)을 기반으로 산출됩니다. 크게 구조적 명확성(Structure), 데이터 밀도(Data), 일관성(Coherence), 스니펫 추출 용이성(Snippetability) 4가지 항목을 종합 평가하여 100점 만점으로 환산합니다."
    },
    {
      question: "무료로 사용할 수 있나요?",
      answer: "네, 현재 오픈 베타 기간 동안 모든 기능을 무료로 제공하고 있습니다. 누구나 회원가입 없이 분석 및 리라이팅 기능을 무제한으로 체험하실 수 있습니다."
    },
    {
      question: "분석한 콘텐츠는 저장되나요? (보안)",
      answer: "아니요, Message House는 사용자의 데이터를 저장하지 않습니다. 입력하신 콘텐츠는 오직 실시간 분석을 위해서만 일회성으로 AI에 전송되며, 분석 후 즉시 휘발됩니다. 보안 걱정 없이 안전하게 사용하세요."
    },
    {
      question: "GEO와 SEO의 결정적 차이는 무엇인가요?",
      answer: "SEO는 '검색 엔진(기계)'이 좋아하는 키워드와 링크 구조에 집중합니다. 반면 GEO/AIEO는 'AI(인공지능)'가 이해하기 쉬운 맥락과 의도(Intent)에 집중합니다. 링크 상위 노출이 아닌, AI 답변에 직접 인용되는 것이 목표입니다."
    },
    {
      question: "어떤 콘텐츠를 분석하면 좋은가요?",
      answer: "보도자료, 블로그 포스트, 제품 상세 페이지, FAQ 문서, 뉴스레터 등 텍스트 기반의 모든 PR/마케팅 콘텐츠를 분석할 수 있습니다. 특히 100자 이상의 글에서 정확도가 높습니다."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white border-t border-zinc-200">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 font-mono">Frequently Asked Questions</h2>
          <p className="text-zinc-500">서비스 이용에 대해 자주 묻는 질문들입니다.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-zinc-200 pb-4 last:border-0">
              <button
                className="w-full flex justify-between items-center py-4 text-left focus:outline-none group"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-zinc-900' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                  {faq.question}
                </span>
                <div className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  {openIndex === index ? (
                     <ICONS.ChevronUp className="w-5 h-5 text-zinc-400" />
                  ) : (
                     <ICONS.ChevronDown className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="pb-4 text-zinc-500 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
