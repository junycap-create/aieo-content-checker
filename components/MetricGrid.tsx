import React from 'react';
import { Metric } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MetricGridProps {
  metrics: Metric[];
}

const MetricGrid: React.FC<MetricGridProps> = ({ metrics }) => {
  const getColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#4f46e5';
    return '#d97706';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Good': return '우수';
      case 'Needs Improvement': return '개선 필요';
      case 'Weak': return '취약';
      default: return status;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="bg-white rounded-xl shadow-lg border border-zinc-200 p-8 md:col-span-2 min-h-[300px]">
           <h3 className="text-zinc-900 font-bold font-mono text-lg mb-6 tracking-tight">세부 평가 항목 (Breakdown)</h3>
           <div className="h-48 w-full" style={{ minWidth: '0' }}>
             <ResponsiveContainer width="99%" height="100%" debounce={1}>
                <BarChart data={metrics} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 12, fill: '#52525b'}} />
                    <Tooltip 
                        cursor={{fill: '#f4f4f5'}} 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                        {metrics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-bold text-zinc-800">{metric.name}</span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                            metric.status === 'Good' ? 'bg-green-100 text-green-800' :
                            metric.status === 'Weak' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {getStatusLabel(metric.status)}
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-4">{metric.feedback}</p>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5">
                    <div 
                        className="h-1.5 rounded-full transition-all duration-700" 
                        style={{ width: `${metric.score}%`, backgroundColor: getColor(metric.score) }}
                    />
                </div>
            </div>
        ))}
    </div>
  );
};

export default MetricGrid;