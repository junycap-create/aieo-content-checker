
import React from 'react';
import { RealtimeAnalysisData } from '../types';
import { ICONS } from '../constants';

interface RealtimeAnalysisProps {
  data: RealtimeAnalysisData;
}

const RealtimeAnalysis: React.FC<RealtimeAnalysisProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-zinc-200/50 border border-zinc-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg text-white animate-pulse">
            <ICONS.Search className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-bold text-xl text-zinc-900 font-mono">Google Search Grounding</h3>
            <p className="text-xs text-zinc-500 mt-1">실시간 웹 검색 기반 팩트 검증 및 출처 예측</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Fact Verification Section */}
        <div className="space-y-4">
            <h4 className="font-bold text-sm text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <ICONS.Shield className="w-4 h-4" /> 팩트 검증 (Hallucination Check)
            </h4>
            
            <div className="space-y-3">
                {data.factChecks.length > 0 ? data.factChecks.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border flex items-start gap-3 ${
                        item.verification === 'Verified' ? 'bg-green-50 border-green-100' : 
                        item.verification === 'Contradicted' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                    }`}>
                        <div className="mt-1 shrink-0">
                            {item.verification === 'Verified' && <ICONS.Check className="w-5 h-5 text-green-600" />}
                            {item.verification === 'Contradicted' && <ICONS.X className="w-5 h-5 text-red-500" />}
                            {item.verification === 'Unverified' && <ICONS.Alert className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-zinc-800 mb-1">"{item.claim}"</p>
                            <p className="text-xs text-zinc-600 leading-snug">{item.comment}</p>
                            {item.sourceUrl && (
                                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline mt-2 inline-block truncate max-w-[200px]">
                                    🔗 근거: {new URL(item.sourceUrl).hostname}
                                </a>
                            )}
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-zinc-400 italic">검증할 만한 명확한 주장이 발견되지 않았습니다.</p>
                )}
            </div>
        </div>

        {/* Competitor & Sources Section */}
        <div className="space-y-8">
            {/* Grounding Sources (Actual Links) */}
            <div>
                <h4 className="font-bold text-sm text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2 mb-4">
                    <ICONS.Book className="w-4 h-4" /> 예측 인용 출처 (Predicted Sources)
                </h4>
                <div className="bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden">
                    {data.groundingSources.length > 0 ? (
                        <ul className="divide-y divide-zinc-100">
                            {data.groundingSources.map((source, idx) => (
                                <li key={idx}>
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="block p-3 hover:bg-white transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="text-sm font-medium text-zinc-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {source.title}
                                            </span>
                                            <ICONS.ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-blue-500 mt-1" />
                                        </div>
                                        <span className="text-xs text-zinc-400 font-mono mt-1 block truncate">
                                            {source.uri}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-zinc-400 text-sm">
                            <ICONS.Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            관련된 외부 출처를 찾지 못했습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Competitor Topics */}
            <div>
                 <h4 className="font-bold text-sm text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2 mb-4">
                    <ICONS.Activity className="w-4 h-4" /> 경쟁 콘텐츠 동향
                </h4>
                <div className="space-y-2">
                    {data.competitors.length > 0 ? data.competitors.map((comp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                                <span className="text-sm text-zinc-700 truncate">{comp.title}</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-400 shrink-0 bg-zinc-100 px-1.5 py-0.5 rounded">
                                {comp.sourceName}
                            </span>
                        </div>
                    )) : (
                        <p className="text-sm text-zinc-400 italic">유사한 경쟁 콘텐츠가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalysis;
