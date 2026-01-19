import React, { useState, Suspense, useEffect } from 'react';
import { AnalysisResult, AnalysisStatus, AnalysisLog } from './types';
import { analyzeContent } from './services/geminiService';
import InputSection from './components/InputSection';
import UserGuideModal from './components/UserGuideModal';
import MessageHouseCTA from './components/MessageHouseCTA';
import ServiceIntroduction from './components/ServiceIntroduction';
import GEOCard from './components/GEOCard'; // New component
import { ICONS, APP_NAME, APP_VERSION } from './constants';

const ScoreCard = React.lazy(() => import('./components/ScoreCard'));
const MetricGrid = React.lazy(() => import('./components/MetricGrid'));
const SnippetPreview = React.lazy(() => import('./components/SnippetPreview'));
const RewriteEngine = React.lazy(() => import('./components/RewriteEngine'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

const ResultSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-64 bg-zinc-200 rounded-xl"></div>
    <div className="h-96 bg-zinc-200 rounded-xl"></div>
  </div>
);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isKeyRequired, setIsKeyRequired] = useState(false);
  const [errorType, setErrorType] = useState<'NONE' | 'OVERLOADED' | 'KEY' | 'GENERAL'>('NONE');
  const [adminLogs, setAdminLogs] = useState<AnalysisLog[]>([]);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setIsKeyRequired(false);
      } catch (err) { console.error(err); }
    }
  };

  useEffect(() => {
    const checkApiKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setIsKeyRequired(!(process.env.API_KEY || hasKey));
      }
    };
    checkApiKey();
  }, []);

  const handleAnalyze = async (text: string = inputText) => {
    if (isMaintenanceMode) return;
    setErrorType('NONE');
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const data = await analyzeContent(text);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
      setAdminLogs(prev => [{
        id: `LOG-${Date.now().toString().slice(-4)}`,
        userEmail: 'guest_user@public.session',
        inputText: text,
        resultSummary: data.summary.substring(0, 50) + '...',
        score: data.totalScore,
        date: new Date().toLocaleString(),
        status: 'Completed'
      }, ...prev]);
    } catch (error: any) {
      console.error(error);
      if (error.message === "API_KEY_INVALID_OR_MISSING") {
        setIsKeyRequired(true);
        setStatus(AnalysisStatus.IDLE);
        handleOpenKeySelector();
      } else {
        setErrorType(error.message === "MODEL_OVERLOADED" ? 'OVERLOADED' : 'GENERAL');
        setStatus(AnalysisStatus.ERROR);
      }
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (showIntro) return <ServiceIntroduction onBack={() => setShowIntro(false)} />;
  if (isAdmin) return <AdminDashboard onLogout={() => setIsAdmin(false)} logs={adminLogs} isMaintenanceMode={isMaintenanceMode} setMaintenanceMode={setIsMaintenanceMode} />;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans selection:bg-orange-100 relative overflow-x-hidden print:bg-white">
      <header className="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setStatus(AnalysisStatus.IDLE); setResult(null); }}>
                <div className="w-10 h-10 bg-[#1a4031] rounded-lg flex items-center justify-center shrink-0 border border-[#2f5d48]">
                    <span className="text-orange-500 font-mono font-bold text-lg tracking-tighter">MH</span>
                </div>
                <span className="font-bold font-mono text-xl text-zinc-900 hidden md:block tracking-tight">Message House</span>
             </div>
             {isKeyRequired && (
               <button onClick={handleOpenKeySelector} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-200 flex items-center gap-1 animate-pulse">
                 <ICONS.Alert className="w-3 h-3" /> API 키 설정 필요
               </button>
             )}
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setShowIntro(true)} className="hidden md:block text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors">서비스 소개</button>
             <button onClick={() => setIsGuideOpen(true)} className="text-sm font-bold text-zinc-500 hover:text-orange-600 font-mono uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 rounded"><ICONS.Help className="w-4 h-4" /><span className="hidden md:inline">User Guide</span></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10 print:py-0">
        <div className="text-center mb-16 hero-section no-print">
           <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-mono font-medium mb-6 shadow-sm">AI-Search & Generative Engine Optimization</div>
           <h2 className="text-4xl md:text-6xl font-black text-zinc-900 mb-6 tracking-tight leading-tight">AI Visibility Optimizer</h2>
           <p className="text-zinc-600 text-xl max-w-3xl mx-auto leading-relaxed font-light">
             당신의 콘텐츠가 단순한 검색 노출을 넘어 <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">AI 검색의 핵심 답변</span>으로 인용되도록 최적화하세요.
           </p>
        </div>

        <div className="input-section no-print">
            <InputSection value={inputText} onChange={setInputText} onAnalyze={() => handleAnalyze(inputText)} isAnalyzing={status === AnalysisStatus.ANALYZING} />
        </div>

        {status === AnalysisStatus.COMPLETED && result && (
          <div className="space-y-20 animate-fade-in pb-20 result-section">
             <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-10 bg-black rounded-sm"></div>
                    <h2 className="text-3xl font-bold font-mono text-zinc-900 uppercase">Analysis Report</h2>
                </div>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors no-print">
                    <ICONS.Download className="w-4 h-4" /> PDF 리포트 저장
                </button>
             </div>

             <Suspense fallback={<ResultSkeleton />}>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 break-inside-avoid">
                  <div className="md:col-span-1"><ScoreCard score={result.totalScore} summary={result.summary} /></div>
                  <div className="md:col-span-2"><MetricGrid metrics={result.metrics} /></div>
               </div>

               {/* GEO Insight Integration */}
               <div className="break-inside-avoid">
                  <GEOCard data={result.geoInsight} />
               </div>

               <div className="w-full break-inside-avoid"><SnippetPreview snippets={result.snippets} /></div>
               <div className="break-inside-avoid"><RewriteEngine rewrites={result.rewrites} checklists={result.checklists} /></div>
             </Suspense>

             {/* SEO & GEO Integration Checklist (Self-Check) */}
             <div className="bg-zinc-100 p-8 rounded-xl border border-zinc-200 no-print">
                <h3 className="text-xl font-bold font-mono mb-6 flex items-center gap-2">
                    <ICONS.Shield className="w-6 h-6" /> System Optimization Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "JSON-LD 기반 구조화 데이터 사이트 반영 완료",
                        "GEO(Generative Engine Optimization) 지표 산출 알고리즘 적용",
                        "엔터티 밀도(Entity Density) 기반 인용 확률 분석 도입",
                        "시맨틱 HTML5 구조 강화를 통한 AI 크롤러 친화도 개선",
                        "AI Overviews(AIO) 대응 답변 최적화 지침 반영"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-zinc-600 bg-white p-3 rounded-lg border border-zinc-100">
                            <ICONS.Check className="w-4 h-4 text-green-600 shrink-0" /> {item}
                        </div>
                    ))}
                </div>
             </div>

             <div className="pt-12 no-print"><MessageHouseCTA /></div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
           <div className="text-center p-12 bg-red-50 rounded-xl border border-red-200 shadow-sm animate-fade-in">
              <ICONS.Alert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700 font-mono mb-2">분석 오류 발생</h3>
              <p className="text-red-600 text-lg mb-6 leading-relaxed">
                {errorType === 'OVERLOADED' ? 'AI 서버 부하가 높습니다. 잠시 후 다시 시도해주세요.' : '일시적인 네트워크 오류가 발생했습니다.'}
              </p>
              <button onClick={() => handleAnalyze(inputText)} className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-all font-mono">RETRY ANALYSIS</button>
           </div>
        )}
      </main>
      
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

export default App;