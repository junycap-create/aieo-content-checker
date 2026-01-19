import React, { useState, Suspense, useEffect } from 'react';
import { AnalysisResult, AnalysisStatus, AnalysisLog } from './types';
import { analyzeContent } from './services/geminiService';
import InputSection from './components/InputSection';
import UserGuideModal from './components/UserGuideModal';
import MessageHouseCTA from './components/MessageHouseCTA';
import ServiceIntroduction from './components/ServiceIntroduction';
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

  const [adminLogs, setAdminLogs] = useState<AnalysisLog[]>([]);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // API 키 선택 창을 여는 헬퍼 함수
  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // 가이드라인에 따라 선택 창을 연 후에는 성공으로 가정하고 진행합니다.
        setIsKeyRequired(false);
      } catch (err) {
        console.error("Key selection failed:", err);
      }
    } else {
      alert("이 브라우저 환경에서는 API 키 자동 설정을 지원하지 않습니다. Vercel 환경 변수 설정을 다시 확인해주세요.");
    }
  };

  // 앱 시작 시 API 키 존재 여부 확인
  useEffect(() => {
    const checkApiKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        // process.env.API_KEY가 있거나 이미 키를 선택했다면 OK
        const isReady = (process.env.API_KEY && process.env.API_KEY !== "") || hasKey;
        setIsKeyRequired(!isReady);
      }
    };
    checkApiKey();
  }, []);

  const handleAnalyze = async (text: string = inputText) => {
    if (isMaintenanceMode) {
      alert("현재 시스템 점검 중입니다.");
      return;
    }

    // 1차 API 키 체크
    const currentApiKey = process.env.API_KEY;
    const aistudio = (window as any).aistudio;
    if ((!currentApiKey || currentApiKey === "") && aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setIsKeyRequired(true);
        await handleOpenKeySelector();
        // 키 선택 후 process.env.API_KEY가 주입될 때까지 잠시 대기하지 않고 바로 진행 시도 (가이드라인 준수)
      }
    }

    setStatus(AnalysisStatus.ANALYZING);
    try {
      const data = await analyzeContent(text);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);

      const newLog: AnalysisLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        userEmail: 'guest_user@public.session',
        inputText: text,
        resultSummary: data.summary.substring(0, 50) + '...',
        score: data.totalScore,
        date: new Date().toLocaleString(),
        status: 'Completed'
      };
      setAdminLogs(prev => [newLog, ...prev]);

    } catch (error: any) {
      console.error("Analysis failed:", error);
      
      // API 키가 없거나 잘못된 프로젝트 키인 경우 다시 선택하도록 유도
      if (error.message === "API_KEY_INVALID_OR_MISSING") {
        setIsKeyRequired(true);
        setStatus(AnalysisStatus.IDLE);
        await handleOpenKeySelector();
        return;
      }

      setStatus(AnalysisStatus.ERROR);
      // 사용자에게 더 친절한 에러 메시지
      if (error.message?.includes("User location is required")) {
          alert("위치 정보가 필요한 작업입니다. 브라우저의 위치 권한을 허용해주세요.");
      } else {
          alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = `AIEO_Report_${new Date().toISOString().split('T')[0]}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
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
               <button 
                onClick={handleOpenKeySelector}
                className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-200 flex items-center gap-1 animate-pulse"
               >
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
           <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-mono font-medium mb-6 shadow-sm">AI Information Engine Optimization</div>
           <h2 className="text-4xl md:text-6xl font-black text-zinc-900 mb-6 tracking-tight leading-tight">AI 검색 최적화(AIEO) 진단 도구</h2>
           <p className="text-zinc-600 text-xl max-w-3xl mx-auto leading-relaxed font-light">
             작성한 PR 콘텐츠가 <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">ChatGPT</span>, <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">Perplexity</span>, <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">Gemini</span>에서 어떻게 인용될지 미리 확인하고 최적화하세요.
           </p>
        </div>

        <div className="input-section no-print">
            <InputSection value={inputText} onChange={setInputText} onAnalyze={() => handleAnalyze(inputText)} isAnalyzing={status === AnalysisStatus.ANALYZING} />
        </div>

        {!result && status !== AnalysisStatus.ANALYZING && (
          <div className="mt-12 space-y-12 animate-fade-in-up cta-section no-print">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-black/30 transition-colors group text-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-zinc-900 transition-colors border border-zinc-200">
                        <ICONS.Chart className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-2 font-mono">정량적 AIEO 진단</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">구조, 데이터, 일관성 등 4가지 AIEO 핵심 지표를 분석하여 <span className="text-zinc-900 font-semibold">100점 만점의 점수</span>로 환산합니다.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-indigo-500/30 transition-colors group text-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 transition-colors border border-zinc-200">
                        <ICONS.ScanEye className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-2 font-mono">AI 시뮬레이션</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">AI 엔진이 당신의 콘텐츠를 <span className="text-zinc-900 font-semibold">어떤 Q&A 스니펫으로 요약할지</span> 미리 확인하세요.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-amber-500/30 transition-colors group text-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 transition-colors border border-zinc-200">
                        <ICONS.Wand2 className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-2 font-mono">즉시 최적화</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">AI가 좋아하는 구조로 <span className="text-zinc-900 font-semibold">문장을 자동으로 고쳐줍니다.</span></p>
                </div>
             </div>
             <MessageHouseCTA />
          </div>
        )}

        {status === AnalysisStatus.COMPLETED && result && (
          <div className="space-y-24 animate-fade-in pb-20 result-section">
             <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-10 bg-black rounded-sm"></div>
                    <h2 className="text-3xl font-bold font-mono text-zinc-900">Analysis Report</h2>
                </div>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors no-print">
                    <ICONS.Download className="w-4 h-4" /> PDF 리포트 저장
                </button>
             </div>
             <Suspense fallback={<ResultSkeleton />}>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 break-inside-avoid">
                  <div className="md:col-span-1 h-full"><ScoreCard score={result.totalScore} summary={result.summary} /></div>
                  <div className="md:col-span-2 h-full"><MetricGrid metrics={result.metrics} /></div>
               </div>
               <div className="w-full break-inside-avoid"><SnippetPreview snippets={result.snippets} /></div>
               <div className="break-inside-avoid"><RewriteEngine rewrites={result.rewrites} checklists={result.checklists} /></div>
             </Suspense>
             <div className="pt-12 no-print cta-section"><MessageHouseCTA /></div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
           <div className="text-center p-12 bg-red-50 rounded-xl border border-red-200 shadow-sm">
              <ICONS.Alert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700 font-mono mb-2">Analysis Failed</h3>
              <p className="text-red-600 text-lg">분석 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
           </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-zinc-200 py-12 mt-20 relative z-20 no-print">
         <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
             <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-[#1a4031] rounded-xl flex items-center justify-center mb-4 shadow-md border border-[#2f5d48]">
                     <span className="text-orange-500 font-mono font-bold text-3xl tracking-tighter">MH</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 tracking-tight font-mono">Message House</span>
             </div>
             <p className="text-zinc-500 text-base font-medium">© 2025 Message House. All rights reserved.</p>
             <div className="mt-8">
                <button onClick={() => setIsAdmin(true)} className="text-[10px] text-zinc-200 hover:text-zinc-400 font-mono flex items-center gap-1 mx-auto transition-colors"><ICONS.Lock className="w-3 h-3" />Admin Demo</button>
            </div>
         </div>
      </footer>
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

export default App;