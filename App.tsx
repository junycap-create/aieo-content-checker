import React, { useState, Suspense, useEffect } from 'react';
import { AnalysisResult, AnalysisStatus, AnalysisLog } from './types';
import { analyzeContent, generateRewrites, getEmbedding, checkServiceHealth, ServiceError } from './services/geminiService';
import InputSection from './components/InputSection';
import UserGuideModal from './components/UserGuideModal';
import MessageHouseCTA from './components/MessageHouseCTA';
import ServiceIntroduction from './components/ServiceIntroduction';
import BookIntroduction from './components/BookIntroduction';
import { ICONS, APP_NAME, APP_VERSION } from './constants';

const ScoreCard = React.lazy(() => import('./components/ScoreCard'));
const MetricGrid = React.lazy(() => import('./components/MetricGrid'));
const SnippetPreview = React.lazy(() => import('./components/SnippetPreview'));
const RewriteEngine = React.lazy(() => import('./components/RewriteEngine'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

type ErrorKind = 'NONE' | 'MAINTENANCE' | 'QUOTA' | 'RATE_LIMIT' | 'OVERLOADED' | 'INVALID_INPUT' | 'GENERAL';

// Why an analysis failed decides what the user is told: a credit problem, a
// busy model and a misconfigured server each need a different next step.
const ERROR_GUIDE: Record<Exclude<ErrorKind, 'NONE'>, { title: string; body: string; hint: string }> = {
  MAINTENANCE: {
    title: '서비스 점검 중',
    body: 'AI 분석 서버 설정을 정비하고 있어 지금은 진단을 진행할 수 없습니다.',
    hint: '잠시 후 다시 이용해 주세요.',
  },
  QUOTA: {
    title: 'AI 사용 한도 초과',
    body: 'AI 사용 한도(크레딧)가 소진되어 분석을 진행할 수 없습니다.',
    hint: '한도가 충전되면 바로 다시 이용하실 수 있습니다.',
  },
  RATE_LIMIT: {
    title: '요청이 잠시 몰렸습니다',
    body: '짧은 시간에 요청이 많이 들어와 처리가 지연되고 있습니다.',
    hint: '1분 정도 뒤에 다시 시도해 주세요.',
  },
  OVERLOADED: {
    title: 'AI 서버 부하',
    body: 'AI 서버 부하가 높아 분석을 마치지 못했습니다.',
    hint: '잠시 후 다시 시도해 주세요.',
  },
  INVALID_INPUT: {
    title: '입력 내용을 확인해 주세요',
    body: '분석할 내용이 비어 있거나 너무 깁니다.',
    hint: '내용을 조금 줄여서 다시 시도해 주세요.',
  },
  GENERAL: {
    title: '분석 오류 발생',
    body: '분석 중 오류가 발생했습니다.',
    hint: '잠시 후 다시 시도해 주세요.',
  },
};

const describeFailure = (error: unknown): Exclude<ErrorKind, 'NONE'> =>
  error instanceof ServiceError ? error.type : 'GENERAL';

const ResultSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-64 bg-zinc-200 rounded-xl"></div>
    <div className="h-96 bg-zinc-200 rounded-xl"></div>
  </div>
);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showBookIntro, setShowBookIntro] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [errorType, setErrorType] = useState<ErrorKind>('NONE');
  const [rewriteErrorMessage, setRewriteErrorMessage] = useState<string | null>(null);
  const [adminLogs, setAdminLogs] = useState<AnalysisLog[]>([]);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<Record<string, AnalysisResult>>({});

  // Load last result from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('last_aieo_result');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResult(parsed);
        setStatus(AnalysisStatus.COMPLETED);
      } catch (e) { console.error("Failed to load saved result", e); }
    }
  }, []);

  // Save result to localStorage when it changes
  useEffect(() => {
    if (result && status === AnalysisStatus.COMPLETED) {
      localStorage.setItem('last_aieo_result', JSON.stringify(result));
    }
  }, [result, status]);

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setInputText('');
    localStorage.removeItem('last_aieo_result');
  };

  // The API key lives only on the server; the browser just asks whether the
  // AI backend is usable right now.
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'ready' | 'unavailable'>('checking');

  useEffect(() => {
    let cancelled = false;
    checkServiceHealth().then((health) => {
      if (!cancelled) setServiceStatus(health.ok ? 'ready' : 'unavailable');
    });
    return () => { cancelled = true; };
  }, []);

  const errorGuide = ERROR_GUIDE[errorType === 'NONE' ? 'GENERAL' : errorType];

  const handleAnalyze = async (text: string = inputText) => {
    if (isMaintenanceMode || !text.trim()) return;
    
    // Stop early when the AI backend is known to be unavailable, but re-check
    // first so a fixed server recovers without a page reload.
    if (serviceStatus === 'unavailable') {
      const health = await checkServiceHealth();
      if (!health.ok) {
        setErrorType('MAINTENANCE');
        setStatus(AnalysisStatus.ERROR);
        return;
      }
      setServiceStatus('ready');
    }

    // Check Cache first
    const cacheKey = text.trim();
    if (analysisCache[cacheKey]) {
      setResult(analysisCache[cacheKey]);
      setStatus(AnalysisStatus.COMPLETED);
      return;
    }

    setErrorType('NONE');
    setRewriteErrorMessage(null);
    setStatus(AnalysisStatus.ANALYZING);
    try {
      // 1. Core Analysis (Fast)
      const [data, embedding] = await Promise.all([
        analyzeContent(text),
        getEmbedding(text.substring(0, 1000)) // Sample for embedding
      ]);
      
      // Use embedding to "verify" information gain (simulated logic for MVP)
      const enhancedData = {
        ...data,
        geoInsight: {
          ...data.geoInsight,
          embeddingVector: embedding.slice(0, 10) // Store small slice for reference
        }
      };

      setResult(enhancedData);
      setStatus(AnalysisStatus.COMPLETED);
      
      // Update Cache with initial data
      setAnalysisCache(prev => ({ ...prev, [cacheKey]: enhancedData }));

      setAdminLogs(prev => [{
        id: `LOG-${Date.now().toString().slice(-4)}`,
        userEmail: 'guest_user@public.session',
        inputText: text,
        resultSummary: data.summary.substring(0, 50) + '...',
        score: data.totalScore,
        date: new Date().toLocaleString(),
        status: 'Completed'
      }, ...prev]);

      // 2. Generate Rewrites (Background)
      try {
        const rewriteData = await generateRewrites(text);
        const finalResult = {
          ...data,
          rewrites: rewriteData.rewrites,
          checklists: rewriteData.checklists
        };
        setResult(finalResult);
        // Update Cache with full data
        setAnalysisCache(prev => ({ ...prev, [cacheKey]: finalResult }));
      } catch (rewriteIssue) {
        console.error("Rewrite generation failed:", rewriteIssue);
        const kind = describeFailure(rewriteIssue);
        if (kind === 'MAINTENANCE') setServiceStatus('unavailable');
        setRewriteErrorMessage(`${ERROR_GUIDE[kind].body} ${ERROR_GUIDE[kind].hint}`);
      }

    } catch (error) {
      console.error(error);
      const kind = describeFailure(error);
      if (kind === 'MAINTENANCE') setServiceStatus('unavailable');
      setErrorType(kind);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `AIEO_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as const;

    // Use dynamic import for html2pdf to keep bundle small
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default().set(opt).from(element).save();
    }).catch(err => {
      console.error("PDF generation failed:", err);
      window.print(); // Fallback
    });
  };

  if (showIntro) return <ServiceIntroduction onBack={() => setShowIntro(false)} onShowBookIntro={() => { setShowIntro(false); setShowBookIntro(true); }} />;
  if (showBookIntro) return <BookIntroduction onBack={() => setShowBookIntro(false)} onShowIntro={() => { setShowBookIntro(false); setShowIntro(true); }} />;
  if (isAdmin) return <AdminDashboard onLogout={() => setIsAdmin(false)} logs={adminLogs} isMaintenanceMode={isMaintenanceMode} setMaintenanceMode={setIsMaintenanceMode} />;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans selection:bg-orange-100 relative overflow-x-hidden print:bg-white">
      <header className="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shrink-0 border border-zinc-800">
                    <span className="text-orange-500 font-mono font-bold text-lg tracking-tighter">MH</span>
                </div>
                <span className="font-bold font-mono text-xl text-zinc-900 hidden md:block tracking-tight">Message House</span>
             </div>
             {/* Badge - Consistent with Intro */}
             <div className="hidden lg:flex items-center gap-4">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
                      OPEN Beta
                  </span>
              </div>
          </div>
          <div className="flex items-center gap-4">
             {serviceStatus !== 'ready' && (
               <div
                 title={serviceStatus === 'checking' ? 'AI 서비스 연결을 확인하고 있습니다.' : 'AI 분석 서버를 점검 중입니다. 잠시 후 다시 이용해 주세요.'}
                 className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-amber-200"
               >
                 {serviceStatus === 'checking' ? (
                   <div className="w-4 h-4 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                 ) : (
                   <ICONS.Alert className="w-4 h-4" />
                 )}
                 <span className="hidden sm:inline">{serviceStatus === 'checking' ? 'AI 서비스 확인 중' : 'AI 서비스 점검 중'}</span>
               </div>
             )}
              <button onClick={() => setShowBookIntro(true)} className="hidden md:block text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">신간 도서</button>
             <button onClick={() => setShowIntro(true)} className="hidden md:block text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors">서비스 소개</button>
             <button onClick={() => setIsGuideOpen(true)} className="text-sm font-bold text-zinc-500 hover:text-orange-600 font-mono uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 rounded"><ICONS.Help className="w-4 h-4" /><span className="hidden md:inline">User Guide</span></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10 print:py-0">
        <div className="text-center mb-10 md:mb-16 hero-section no-print">
           <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[10px] sm:text-sm font-mono font-medium mb-4 md:mb-6 shadow-sm">AI Information Engine Optimization</div>
           <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-zinc-900 mb-4 md:mb-6 tracking-tight leading-tight">AI 정보 엔진 최적화(AIEO) 진단 도구</h2>
           <p className="text-zinc-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-light">
             당신의 콘텐츠가 단순한 검색 노출을 넘어 <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">AI 검색의 핵심 답변</span>으로 인용되도록 최적화하세요.
           </p>
        </div>

        <div className="input-section no-print">
            <InputSection value={inputText} onChange={setInputText} onAnalyze={() => handleAnalyze(inputText)} isAnalyzing={status === AnalysisStatus.ANALYZING} />
        </div>

        {status === AnalysisStatus.COMPLETED && result && (
          <div id="analysis-report" className="space-y-8 sm:space-y-20 animate-fade-in pb-20 result-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-2 sm:w-3 h-8 sm:h-10 bg-black rounded-sm"></div>
                    <h2 className="text-xl sm:text-3xl font-bold font-mono text-zinc-900 uppercase">진단 결과 보고서</h2>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={handleReset} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-600 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-sm font-medium border border-zinc-200 transition-colors">
                        <ICONS.Plus className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="whitespace-nowrap">새 분석</span>
                    </button>
                    <button onClick={handleDownloadPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-colors">
                        <ICONS.Download className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="whitespace-nowrap">PDF 저장</span>
                    </button>
                </div>
             </div>

             <Suspense fallback={<ResultSkeleton />}>
               <div id="score-section" className="grid grid-cols-1 md:grid-cols-3 gap-8 break-inside-avoid scroll-mt-32">
                  <div className="md:col-span-1"><ScoreCard score={result.totalScore} summary={result.summary} /></div>
                  <div className="md:col-span-2"><MetricGrid metrics={result.metrics} /></div>
               </div>

               <div id="snippet-section" className="w-full break-inside-avoid scroll-mt-32"><SnippetPreview snippets={result.snippets} /></div>
               
               {result.rewrites && result.checklists ? (
                <div id="rewrite-section" className="break-inside-avoid animate-fade-in scroll-mt-32">
                   <RewriteEngine rewrites={result.rewrites} checklists={result.checklists} originalText={inputText} />
                 </div>
               ) : rewriteErrorMessage ? (
                 <div className="p-10 bg-amber-50 rounded-xl border border-amber-200 text-center break-inside-avoid">
                    <ICONS.Alert className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                    <p className="text-amber-900 font-bold mb-1">리라이트 콘텐츠를 만들지 못했습니다</p>
                    <p className="text-amber-700 text-sm mb-5 leading-relaxed">{rewriteErrorMessage}</p>
                    <button onClick={() => handleAnalyze(inputText)} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">리라이트 다시 생성</button>
                 </div>
               ) : (
                 <div className="p-12 bg-zinc-100 rounded-xl border border-zinc-200 text-center animate-pulse">
                    <ICONS.Rewrite className="w-8 h-8 text-zinc-400 mx-auto mb-4 animate-spin" />
                    <p className="text-zinc-500 font-mono text-sm">AIEO 리라이트 엔진이 최적화된 콘텐츠를 생성 중입니다...</p>
                 </div>
               )}
             </Suspense>

             <div className="pt-12 no-print"><MessageHouseCTA /></div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
           <div className="text-center p-12 bg-red-50 rounded-xl border border-red-200 shadow-sm animate-fade-in">
              <ICONS.Alert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700 font-mono mb-2">{errorGuide.title}</h3>
              <p className="text-red-600 text-lg mb-2 leading-relaxed">{errorGuide.body}</p>
              <p className="text-red-500/80 text-sm mb-6">{errorGuide.hint}</p>
              <button onClick={() => handleAnalyze(inputText)} className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-all font-mono">RETRY ANALYSIS</button>
           </div>
        )}
      </main>
      
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

export default App;