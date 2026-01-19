import React from 'react';
import { GeoInsight } from '../types';
import { ICONS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface GEOCardProps {
  data: GeoInsight;
}

const GEOCard: React.FC<GEOCardProps> = ({ data }) => {
  const chartData = [
    { subject: '노출 지수', A: data.visibilityIndex, fullMark: 100 },
    { subject: '엔터티 밀도', A: data.entityDensity, fullMark: 100 },
    { subject: '인용 신뢰도', A: data.citationConfidence, fullMark: 100 },
    { subject: '답변 적합성', A: 85, fullMark: 100 }, // Mocked or logic derived
    { subject: '정보 독창성', A: 75, fullMark: 100 },
  ];

  return (
    <div className="bg-zinc-900 text-white rounded-xl shadow-2xl p-8 border border-zinc-800">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-500 p-2 rounded-lg">
          <ICONS.Zap className="w-5 h-5 text-black" />
        </div>
        <div>
          <h3 className="font-bold text-xl font-mono">GEO Visibility Index</h3>
          <p className="text-xs text-zinc-400 mt-1">AI 검색 답변 채택 가능성 분석</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
              <Radar
                name="GEO Score"
                dataKey="A"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-zinc-400 uppercase">Citation Probability</span>
              <span className="text-orange-400 font-bold">{data.citationConfidence}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${data.citationConfidence}%` }}></div>
            </div>
          </div>

          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
            <h4 className="text-xs font-bold font-mono text-zinc-500 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <ICONS.Check className="w-3 h-3" /> GEO Critical Checklist
            </h4>
            <ul className="space-y-2">
              {data.optimizationChecklist.map((item, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GEOCard;