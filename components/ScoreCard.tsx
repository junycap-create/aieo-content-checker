import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ScoreCardProps {
  score: number;
  summary: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, summary }) => {
  const data = [{ name: 'Score', value: score, fill: '#18181b' }]; // Using black fill for NVG8 style
  
  // Determine color based on score (only text)
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-green-600';
    if (val >= 60) return 'text-indigo-600';
    return 'text-amber-600';
  };

  const getScoreLabel = (val: number) => {
    if (val >= 80) return 'EXCELLENT';
    if (val >= 60) return 'GOOD';
    if (val >= 40) return 'AVERAGE';
    return 'NEEDS WORK';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-zinc-200/50 border border-zinc-200 p-8 flex flex-col items-center justify-center relative overflow-hidden h-full">
      <h3 className="text-zinc-400 font-bold font-mono text-sm uppercase tracking-widest mb-6">Total AIEO Score</h3>
      
      <div className="relative w-56 h-56 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            innerRadius="80%" 
            outerRadius="100%" 
            barSize={12} 
            data={data} 
            startAngle={90} 
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={40} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-black font-mono tracking-tighter ${getScoreColor(score)}`}>{score}</span>
            <span className="text-sm font-bold text-zinc-400 mt-2 font-mono tracking-wider">{getScoreLabel(score)}</span>
        </div>
      </div>

      <div className="text-center w-full">
        <div className="h-px w-16 bg-zinc-200 mx-auto mb-6"></div>
        <p className="text-zinc-600 text-lg leading-relaxed mx-auto font-light">
          {summary}
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;