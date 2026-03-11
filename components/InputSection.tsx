import React, { useState, useEffect } from 'react';
import { ICONS, PLACEHOLDER_TEXT } from '../constants';

interface InputSectionProps {
  value: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const EXAMPLES = [
  {
    label: "보도자료 (신제품 출시)",
    text: "메시지하우스가 AI 정보 엔진 최적화(AIEO)를 위한 혁신적인 진단 도구를 출시했습니다. 이번 도구는 기업의 보도자료나 마케팅 콘텐츠가 ChatGPT, Gemini와 같은 생성형 AI 검색 결과에서 핵심 답변으로 인용될 수 있도록 분석하고 리라이팅하는 기능을 제공합니다. 특히 엔터티 밀도 분석과 인용 신뢰도 지수를 통해 콘텐츠의 권위성을 객관적으로 평가합니다."
  },
  {
    label: "링크드인 (전문가 통찰)",
    text: "AI 시대의 SEO는 이제 '검색 결과 상단 노출'을 넘어 'AI의 답변 출처가 되는 것'으로 진화하고 있습니다. 이를 우리는 AIEO(AI Information Engine Optimization)라고 부릅니다. 단순히 키워드를 반복하는 것이 아니라, AI가 신뢰할 수 있는 구체적인 데이터와 엔터티를 제공하는 것이 핵심입니다. 당신의 콘텐츠는 AI에게 얼마나 친절한가요?"
  }
];

const InputSection: React.FC<InputSectionProps> = ({ value, onChange, onAnalyze, isAnalyzing }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const handleExampleClick = (text: string) => {
    onChange(text);
  };

  // Flash 모델 도입으로 단축된 예상 시간 (기존 대비 약 1.5x~2x 단축)
  const getEstimatedTime = (text: string) => {
    const len = text.length;
    if (len < 500) return 8; // 기존 15
    if (len < 1500) return 15; // 기존 30
    return 25; // 기존 45
  };

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      const estimated = getEstimatedTime(value);
      setTimeLeft(estimated);
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 p-2 rounded-md">
              <ICONS.Content className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 font-mono">콘텐츠 입력</h2>
        </div>
        <div className="flex gap-2">
            {EXAMPLES.map((ex, idx) => (
                <button
                    key={idx}
                    onClick={() => handleExampleClick(ex.text)}
                    className="text-[10px] md:text-xs font-bold font-mono bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded hover:bg-zinc-200 hover:text-zinc-900 transition-all border border-zinc-200"
                >
                    {ex.label}
                </button>
            ))}
        </div>
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
                <ICONS.Zap className="w-3 h-3 text-orange-500" /> 초고속 분석 엔진 적용:
            </span>
            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-600">Quick (~8s)</span>
            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-600">Standard (~15s)</span>
            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-600">Complex (~25s)</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-base text-zinc-500 font-light flex items-center gap-2">
          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wide">Tip</span>
          분석 모델을 최적화하여 결과 출력 속도가 1.5배 개선되었습니다.
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
                {timeLeft > 0 ? `PROCESSING (${timeLeft}s)...` : "Almost there..."}
              </span>
            </>
          ) : (
            <>
              <ICONS.Zap className="w-5 h-5 text-orange-400" />
              최적화 분석 시작
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;