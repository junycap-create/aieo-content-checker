import React from 'react';
import { GeoInsight } from '../types';
import { ICONS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

interface GEOCardProps {
  data: GeoInsight;
}

const GEOCard: React.FC<GEOCardProps> = ({ data }) => {
  const chartData = [
    { subject: '노출 지수', A: data.visibilityIndex, fullMark: 100 },
    { subject: '엔터티 밀도', A: data.entityDensity, fullMark: 100 },
    { subject: '인용 신뢰도', A: data.citationConfidence, fullMark: 100 },
    { subject: '답변 적합성', A: Math.min(100, data.visibilityIndex + 10), fullMark: 100 },
    { subject: '정보 독창성', A: Math.max(0, data.citationConfidence - 5), fullMark: 100 },
  ];

  return (
    <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl p-8 border border-zinc-800 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
            <ICONS.Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-2xl font-mono tracking-tight">GEO Visibility Index</h3>
            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-medium">Generative Engine Optimization Insight</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700">
           <span className="text-xs font-mono text-zinc-400">STATUS:</span>
           <span className="text-xs font-bold text-orange-400 font-mono animate-pulse">OPTIMIZING...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="h-80 w-full bg-zinc-800/20 rounded-2xl border border-zinc-800/50 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="GEO Score"
                dataKey="A"
                stroke="#f97316"
                strokeWidth={3}
                fill="#f97316"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-800/30 p-6 rounded-2xl border border-zinc-700/50">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Citation Probability</h4>
                  <p className="text-3xl font-black font-mono text-white">{data.citationConfidence}%</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-zinc-500 font-mono mb-1">ENTITY DENSITY</p>
                  <p className="text-xl font-bold text-orange-500 font-mono">{data.entityDensity}/100</p>
               </div>
            </div>
            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-700">
              <div 
                className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                style={{ width: `${data.citationConfidence}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <h4 className="text-sm font-bold font-mono text-orange-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <ICONS.Shield className="w-4 h-4" /> AIO Critical Checklist
            </h4>
            <ul className="space-y-3">
              {data.optimizationChecklist.map((item, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-3 group">
                  <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/40 transition-colors">
                    <span className="text-[10px] text-orange-500 font-bold">{idx + 1}</span>
                  </div>
                  <span className="leading-relaxed">{item}</span>
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