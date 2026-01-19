import React, { useState, useEffect } from 'react';
import { ICONS, PLACEHOLDER_TEXT } from '../constants';

interface InputSectionProps {
  value: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ value, onChange, onAnalyze, isAnalyzing }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  // Calculate estimated time based on text length
  const getEstimatedTime = (text: string) => {
    const len = text.length;
    if (len < 500) return 15;
    if (len < 1500) return 30;
    return 45;
  };

  // Timer effect: countdown logic
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      // Set initial estimated time
      const estimated = getEstimatedTime(value);
      setTimeLeft(estimated);
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0; // Stay at 0 (Almost done)
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, value]);
  
  const handleAnalyze = () => {
    if (value.trim().length < 50) {
      alert("의미 있는 분석을 위해 최소 50자 이상 입력해주세요.");
      return;
    }
    onAnalyze();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-zinc-200/50 border border-zinc-200 p-8 mb-10 transition-all hover:border-zinc-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-zinc-100 p-2 rounded-md">
            <ICONS.Content className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 font-mono">콘텐츠 입력</h2>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full h-64 p-6 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-y text-zinc-800 text-lg leading-relaxed placeholder:text-zinc-400 placeholder:font-light"
          placeholder={PLACEHOLDER_TEXT}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isAnalyzing}
        />
        <div className="absolute bottom-4 right-4 text-sm font-mono text-zinc-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-zinc-100">
          {value.length} chars
        </div>
      </div>

      <div className="mt-4 mb-6">
         <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-400 bg-zinc-50 p-3 rounded border border-zinc-100 items-center">
            <span className="font-bold text-zinc-500 mr-2 flex items-center gap-1">
                <ICONS.Chart className="w-3 h-3" /> 예상 소요 시간:
            </span>
            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-600">짧은 Q&A (~15초)</span>
            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-600">블로그 글 (~30초)</span>
            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-600">긴 보도자료 (~45초)</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-base text-zinc-500 font-light flex items-center gap-2">
          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wide">Tip</span>
          보도자료 초안, 블로그 글, 또는 제품 FAQ를 붙여넣으세요.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !value}
          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold text-lg text-white transition-all shadow-md w-full md:w-auto font-mono tracking-wide
            ${isAnalyzing || !value 
              ? 'bg-zinc-300 cursor-not-allowed' 
              : 'bg-black hover:bg-zinc-800 hover:shadow-xl active:transform active:scale-[0.98]'
            }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                {timeLeft > 0 ? `ANALYZING (${timeLeft}s)...` : "Almost done..."}
              </span>
            </>
          ) : (
            <>
              <ICONS.Search className="w-5 h-5" />
              분석 시작
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;