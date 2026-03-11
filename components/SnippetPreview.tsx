import React from 'react';
import { Snippet } from '../types';
import { ICONS } from '../constants';

interface SnippetPreviewProps {
  snippets: Snippet[];
}

// Simple SVG Logos for the AI Engines to add visual context
const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const PerplexityIcon = () => (
    <svg className="w-6 h-6 text-teal-600 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/> 
    </svg> 
);

const ClaudeIcon = () => (
    <svg className="w-6 h-6 text-orange-700 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
    </svg>
);

const OpenAIIcon = () => (
    <svg className="w-6 h-6 text-black fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.534-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7913a4.4944 4.4944 0 0 1 6.6802 4.6605zM8.3365 12.5105l-2.0389-1.1618 5.7668-3.3544 5.7668 3.3544-5.7668 3.3424-5.7668-3.3424-2.0389 1.1618 2.0389 1.1571 5.7668 3.3377 5.7668-3.3377 2.0389-1.1571-2.0389-1.1618 2.0389-1.1618-5.7668-3.3424V7.2031l2.0389 1.1618-2.0389 1.1618 2.0389 1.1618-2.0389 1.1619z" />
    </svg>
);

const SnippetPreview: React.FC<SnippetPreviewProps> = ({ snippets }) => {
  const getIcon = (engine: string) => {
    switch(engine) {
        case 'google': return <GoogleIcon />;
        case 'perplexity': return <PerplexityIcon />;
        case 'chatgpt': return <OpenAIIcon />;
        case 'claude': return <ClaudeIcon />;
        default: return <GoogleIcon />;
    }
  };

  const getName = (engine: string) => {
    switch(engine) {
        case 'google': return 'Google AI Overview';
        case 'perplexity': return 'Perplexity';
        case 'chatgpt': return 'ChatGPT Search';
        case 'claude': return 'Claude (Anthropic)';
        default: return 'AI Engine';
    }
  };

  const getEngineColor = (engine: string) => {
    switch(engine) {
        case 'google': return 'border-blue-200';
        case 'perplexity': return 'border-teal-200';
        case 'chatgpt': return 'border-emerald-200';
        case 'claude': return 'border-orange-200';
        default: return 'border-zinc-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-zinc-200/50 border border-zinc-200 p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-black rounded-lg shrink-0">
           <ICONS.Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
            <h3 className="font-bold text-lg sm:text-xl text-zinc-900 font-mono">AI 예상 스니펫</h3>
            <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5 sm:mt-1">Multi-Engine Simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {snippets.map((item, idx) => (
          <div key={idx} className={`bg-zinc-50 border ${getEngineColor(item.engine)} rounded-lg overflow-hidden hover:border-zinc-400 transition-colors group`}>
            {/* Fake Browser/Engine Header */}
            <div className="bg-white border-b border-zinc-100 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 shrink-0">
                    {getIcon(item.engine)}
                    <span className="text-[9px] sm:text-[10px] font-bold font-mono text-zinc-600 uppercase tracking-wide">{getName(item.engine)}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-zinc-100 border-dashed">
                    <span className="text-indigo-600 font-mono font-bold text-base sm:text-lg min-w-[15px] sm:min-w-[20px] shrink-0">Q.</span>
                    <p className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">{item.question}</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-zinc-400 font-mono font-bold text-base sm:text-lg min-w-[15px] sm:min-w-[20px] shrink-0">A.</span>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{item.answer}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-100">
         <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-400 bg-zinc-50 px-3 sm:px-4 py-2 sm:py-3 rounded border border-zinc-200">
            <ICONS.Alert className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-500 shrink-0" />
            <span className="font-mono">AI는 키워드가 아닌 <strong className="text-zinc-700">의도(Intent)</strong>를 추출하여 재구성합니다.</span>
         </div>
      </div>
    </div>
  );
};

export default SnippetPreview;