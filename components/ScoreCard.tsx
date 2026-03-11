import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ScoreCardProps {
  score: number;
  summary: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, summary }) => {
  const data = [{ name: 'Score', value: score, fill: '#18181b' }];
  
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-green-600';
    if (val >= 60) return 'text-indigo-600';
    return 'text-amber-600';
  };

  const getScoreLabel = (val: number) => {
    if (val >= 80) return '최우수 (Excellent)';
    if (val >= 60) return '우수 (Good)';
    if (val >= 40) return '보통 (Average)';
    return '개선 필요 (Needs Work)';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-zinc-200 p-4 sm:p-8 flex flex-col items-center justify-center h-full min-h-[350px] sm:min-h-[400px]">
      <h3 className="text-zinc-400 font-bold font-mono text-[10px] sm:text-sm uppercase tracking-widest mb-4 sm:mb-6 text-center">종합 AIEO 점수</h3>
      
      <div className="relative w-full h-48 sm:h-64 mb-4 sm:mb-6" style={{ minWidth: '150px' }}>
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <RadialBarChart 
            innerRadius="80%" 
            outerRadius="100%" 
            barSize={10} 
            data={data} 
            startAngle={90} 
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={40} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-5xl sm:text-6xl font-black font-mono tracking-tighter ${getScoreColor(score)}`}>{score}</span>
            <span className="text-[10px] sm:text-sm font-bold text-zinc-400 mt-1 sm:mt-2 font-mono tracking-wider">{getScoreLabel(score)}</span>
        </div>
      </div>

      <div className="text-center w-full">
        <div className="h-px w-12 sm:w-16 bg-zinc-200 mx-auto mb-4 sm:mb-6"></div>
        <p className="text-zinc-600 text-base sm:text-lg leading-relaxed mx-auto font-light">
          {summary}
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;