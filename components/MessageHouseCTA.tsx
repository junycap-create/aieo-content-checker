import React from 'react';
import { ICONS } from '../constants';

const MessageHouseCTA: React.FC = () => {
  return (
    <div className="bg-[#1a4031] rounded-xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10 shadow-lg relative overflow-hidden group border border-[#2f5d48] animate-fade-in-up">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-[#2f5d48] text-green-50 text-xs font-mono px-3 py-1 rounded-full mb-6 uppercase tracking-wider border border-[#4a846a]">
           <ICONS.Zap className="w-3 h-3 text-orange-400" />
           Strategic Partner
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight font-mono tracking-tight">
          AI 시대, 조직의 메시지를<br/>
          <span className="text-orange-400 underline decoration-orange-400/30 underline-offset-4">구조화</span>하고 <span className="text-orange-400 underline decoration-orange-400/30 underline-offset-4">최적화</span>하세요.
        </h3>
        <p className="text-green-100/90 text-lg md:text-xl leading-relaxed font-light">
          AI 기반 PR, 콘텐츠 마케팅, 리더십 커뮤니케이션 전략.<br className="hidden md:block" /> 
          <strong className="text-white font-bold">메시지 하우스</strong>가 가장 확실한 답을 드립니다.
        </p>
      </div>

      <div className="relative z-10 shrink-0">
        <a 
          href="https://www.messagehouse.kr/contact" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-orange-500 text-white px-10 py-5 rounded-lg font-bold font-mono text-lg md:text-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 active:scale-95 active:translate-y-0"
        >
          문의하기
          <ICONS.ArrowRight className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

export default MessageHouseCTA;