
import React, { useState, Suspense, useEffect } from 'react';
import { AnalysisResult, AnalysisStatus, AnalysisLog } from './types';
import { analyzeContent } from './services/geminiService';
import InputSection from './components/InputSection';
import UserGuideModal from './components/UserGuideModal';
import MessageHouseCTA from './components/MessageHouseCTA';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import ServiceIntroduction from './components/ServiceIntroduction'; // Import Service Intro
import { ICONS, APP_NAME, APP_VERSION } from './constants';

// Lazy Load Heavy Components
const ScoreCard = React.lazy(() => import('./components/ScoreCard'));
const MetricGrid = React.lazy(() => import('./components/MetricGrid'));
const SnippetPreview = React.lazy(() => import('./components/SnippetPreview'));
const RewriteEngine = React.lazy(() => import('./components/RewriteEngine'));
// RealtimeAnalysis component removed

// Loading Skeleton
const ResultSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-64 bg-zinc-200 rounded-xl"></div>
    <div className="h-96 bg-zinc-200 rounded-xl"></div>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Always logged in for public access
  const [isAdmin, setIsAdmin] = useState(false); // Set to FALSE to show Main App by default
  const [showIntro, setShowIntro] = useState(false); // Set to FALSE to skip intro
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  // --- Admin State (Lifted Up) ---
  const [adminLogs, setAdminLogs] = useState<AnalysisLog[]>([
    { id: 'LOG-001', userEmail: 'demo@example.com', inputText: 'AI 신약 개발 플랫폼 런칭 보도자료 초안...', resultSummary: '주어가 불분명하고 수치가 부족함', score: 85, date: new Date(Date.now() - 86400000).toLocaleString(), status: 'Completed' },
    { id: 'LOG-002', userEmail: 'tester@startup.kr', inputText: 'Q2 실적 발표 및 투자 유치...', resultSummary: '매우 논리적인 구조임', score: 62, date: new Date(Date.now() - 3600000).toLocaleString(), status: 'Completed' },
  ]);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Admin login handler (triggered from Footer)
  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowIntro(false);
  };

  const handleLogout = () => {
    // For public version, logout just resets admin state and goes to intro
    setIsAdmin(false);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setInputText('');
    setShowIntro(true);
  };

  const handleAnalyze = async (text: string = inputText) => {
    if (isMaintenanceMode) {
      alert("현재 시스템 점검 중입니다. 관리자에게 문의하세요.");
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    try {
      const data = await analyzeContent(text);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);

      // Add to Admin Logs (Simulation)
      const newLog: AnalysisLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        userEmail: 'guest_user@public.session', // Simulated User
        inputText: text,
        resultSummary: data.summary.substring(0, 50) + '...',
        score: data.totalScore,
        date: new Date().toLocaleString(),
        status: 'Completed'
      };
      setAdminLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      
      // Add Failed Log
      const failedLog: AnalysisLog = {
        id: `ERR-${Date.now().toString().slice(-4)}`,
        userEmail: 'guest_user@public.session',
        inputText: text.substring(0, 100) + '...',
        resultSummary: 'Analysis Failed',
        score: 0,
        date: new Date().toLocaleString(),
        status: 'Failed'
      };
      setAdminLogs(prev => [failedLog, ...prev]);

      alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleDownloadPDF = () => {
    // Set a meaningful title for the PDF filename
    const originalTitle = document.title;
    document.title = `AIEO_Report_${new Date().toISOString().split('T')[0]}`;
    window.print();
    // Restore title after a short delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  // If showing Service Introduction (High Priority)
  if (showIntro) {
    return <ServiceIntroduction onBack={() => setShowIntro(false)} />;
  }

  // If logged in as Admin
  if (isAdmin) {
    return (
      <AdminDashboard 
        onLogout={handleLogout} 
        logs={adminLogs}
        isMaintenanceMode={isMaintenanceMode}
        setMaintenanceMode={setIsMaintenanceMode}
      />
    );
  }

  // Main Application (Public Mode)
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans selection:bg-orange-100 selection:text-orange-900 relative overflow-x-hidden print:bg-white print:pb-0 print:overflow-visible print:h-auto">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { margin: 10mm; size: auto; }
          html, body { 
            background: white !important; 
            height: auto !important; 
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #root { display: block !important; overflow: visible !important; }
          .no-print, header, footer, .input-section, .cta-section, .hero-section { display: none !important; }
          .print-only { display: block !important; }
          
          /* Reset layout for print */
          .result-section { 
            margin: 0 !important; 
            padding: 0 !important; 
            display: block !important;
            width: 100% !important;
          }
          
          /* Prevent page breaks inside cards */
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          .bg-white { break-inside: avoid; page-break-inside: avoid; }
          
          /* Ensure colors and charts print correctly */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          /* Clean up shadows for cleaner print */
          .shadow-lg, .shadow-md, .shadow-sm { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      {/* Maintenance Mode Banner */}
      {isMaintenanceMode && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold font-mono no-print">
          ⚠️ System Maintenance Mode Active
        </div>
      )}

      {/* Background Grid Pattern - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print" style={{
        backgroundImage: 'linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.2
      }}></div>
      
      {/* Gradient overlay - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-60"></div>

      {/* Header - Unified Design with ServiceIntroduction */}
      <header className="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
             {/* Brand Logo - Consistent Style */}
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setStatus(AnalysisStatus.IDLE); setResult(null); }}>
                <div className="w-10 h-10 bg-[#1a4031] rounded-lg flex items-center justify-center shrink-0 border border-[#2f5d48]">
                    <span className="text-orange-500 font-mono font-bold text-lg tracking-tighter">MH</span>
                </div>
                <span className="font-bold font-mono text-xl text-zinc-900 hidden md:block tracking-tight">Message House</span>
             </div>
             
             {/* Badge & Context - Unified Style */}
             <div className="hidden md:flex items-center gap-4">
                 <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
                     OPEN Beta
                 </span>
                 <span className="text-sm font-medium text-zinc-500 border-l border-zinc-200 pl-4 py-1">
                     AIEO 분석 도구
                 </span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowIntro(true)}
               className="hidden md:block text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors"
             >
               서비스 소개
             </button>
             
             <button 
               onClick={() => setIsGuideOpen(true)}
               className="text-sm font-bold text-zinc-500 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all font-mono uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 rounded"
             >
               <ICONS.Help className="w-4 h-4" />
               <span className="hidden md:inline">User Guide</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10 print:py-0 print:max-w-none print:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16 hero-section no-print">
           <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-mono font-medium mb-6 shadow-sm">
              AI Information Engine Optimization
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-zinc-900 mb-6 tracking-tight leading-tight">
             AI 검색 최적화(AIEO) 진단 도구
           </h2>
           <p className="text-zinc-600 text-xl max-w-3xl mx-auto leading-relaxed font-light">
             작성한 PR 콘텐츠가 <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">ChatGPT</span>, <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">Perplexity</span>, <span className="font-semibold text-black bg-zinc-200/50 px-1 rounded">Gemini</span>에서 <br className="hidden md:block"/>어떻게 인용될지 미리 확인하고 최적화하세요.
           </p>
        </div>

        {/* AIEO Explanation Box */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 mb-12 max-w-5xl mx-auto shadow-sm hover:shadow-md transition-shadow relative overflow-hidden hero-section no-print">
          <div className="flex items-start gap-6 relative z-10">
            <div className="bg-zinc-100 p-3 rounded-xl shrink-0 hidden md:block border border-zinc-200">
               <ICONS.Dashboard className="w-8 h-8 text-zinc-900" />
            </div>
            <div className="flex-1">
               <h3 className="text-2xl font-bold text-zinc-900 mb-4 font-mono flex items-center gap-2">
                 <span className="md:hidden"><ICONS.Dashboard className="w-6 h-6" /></span>
                 AIEO란 무엇인가요?
               </h3>
               
               <div className="text-lg text-zinc-700 leading-relaxed space-y-6 font-light">
                 <p className="text-xl">
                   "AIEO는 AI가 <strong className="font-bold text-black bg-yellow-200 px-1 box-decoration-clone rounded-sm">‘장기적으로 누구를 친구로 기억할지’를 설계하는 전략</strong>입니다."
                 </p>
                 
                 <div className="bg-zinc-50 rounded-lg border-l-4 border-black p-6 space-y-4 shadow-sm">
                   <div className="flex items-start gap-3">
                     <span className="mt-2 w-2 h-2 bg-zinc-400 rounded-full shrink-0"></span>
                     <p><strong className="text-zinc-900 font-bold">GEO</strong>는 오늘 인터뷰 기사에 어떤 전문가가 등장할지를 고르는 과정이고,</p>
                   </div>
                   <div className="flex items-start gap-3">
                     <span className="mt-2 w-2 h-2 bg-indigo-600 rounded-full shrink-0"></span>
                     <p><strong className="text-indigo-700 font-bold">AIEO</strong>는 그 전문가가 앞으로 ‘신뢰할 만한 공식 인물’로 AI의 머릿속에 저장되는 과정을 설계하는 일입니다.</p>
                   </div>
                 </div>
                 
                 <p className="font-medium text-zinc-900 text-xl font-serif italic border-t border-zinc-100 pt-4">
                   "즉, GEO는 답변 순간의 선택, AIEO는 기억의 구조를 만드는 일입니다."
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section no-print">
            <InputSection 
            value={inputText}
            onChange={setInputText}
            onAnalyze={() => handleAnalyze(inputText)} 
            isAnalyzing={status === AnalysisStatus.ANALYZING} 
            />
        </div>

        {/* Value Proposition Section (Idle State) */}
        {!result && status !== AnalysisStatus.ANALYZING && (
          <div className="mt-12 space-y-12 animate-fade-in-up cta-section no-print">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cards... */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-black/30 transition-colors group text-center relative overflow-hidden">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-zinc-900 transition-colors border border-zinc-200">
                    <ICONS.Chart className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2 font-mono">정량적 AIEO 진단</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    구조, 데이터, 일관성 등 4가지 AIEO 핵심 지표를 분석하여 <br className="hidden lg:block" />
                    <span className="text-zinc-900 font-semibold">100점 만점의 점수</span>로 환산합니다.
                </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-indigo-500/30 transition-colors group text-center relative overflow-hidden">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 transition-colors border border-zinc-200">
                    <ICONS.ScanEye className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2 font-mono">AI 시뮬레이션</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    ChatGPT, Perplexity가 당신의 콘텐츠를 <br className="hidden lg:block" />
                    <span className="text-zinc-900 font-semibold">어떤 Q&A 스니펫으로 요약할지</span> 미리 확인하세요.
                </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-amber-500/30 transition-colors group text-center relative overflow-hidden">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 transition-colors border border-zinc-200">
                    <ICONS.Wand2 className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2 font-mono">즉시 최적화 (Rewrite)</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    문제를 발견하는 것에서 그치지 않고, <br className="hidden lg:block" />
                    AI가 좋아하는 구조로 <span className="text-zinc-900 font-semibold">문장을 자동으로 고쳐줍니다.</span>
                </p>
                </div>
             </div>

             <MessageHouseCTA />
          </div>
        )}

        {/* Results Section */}
        {status === AnalysisStatus.COMPLETED && result && (
          <div className="space-y-24 animate-fade-in pb-20 result-section">
             
             {/* Result Header & Download */}
             <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-10 bg-black rounded-sm"></div>
                    <h2 className="text-3xl font-bold font-mono text-zinc-900">Analysis Report</h2>
                </div>
                <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors no-print"
                >
                    <ICONS.Download className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF 리포트 저장</span>
                </button>
             </div>

             {/* Hidden Print Header */}
             <div className="hidden print:block mb-8 text-center border-b border-zinc-200 pb-6">
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">AIEO Content Analysis Report</h1>
                <p className="text-zinc-500 text-sm">Generated by Message House AIEO Checker</p>
                <p className="text-zinc-400 text-xs mt-1">{new Date().toLocaleDateString()}</p>
             </div>

             <Suspense fallback={<ResultSkeleton />}>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 break-inside-avoid">
                  <div className="md:col-span-1 h-full">
                     <ScoreCard score={result.totalScore} summary={result.summary} />
                  </div>
                  <div className="md:col-span-2 h-full">
                     <MetricGrid metrics={result.metrics} />
                  </div>
               </div>

               <div className="w-full break-inside-avoid">
                  <SnippetPreview snippets={result.snippets} />
               </div>

               <div className="break-inside-avoid">
                <RewriteEngine 
                    rewrites={result.rewrites} 
                    checklists={result.checklists} 
                />
               </div>
             </Suspense>

             <div className="pt-12 no-print cta-section">
               <MessageHouseCTA />
             </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
           <div className="text-center p-12 bg-red-50 rounded-xl border border-red-200 shadow-sm">
              <ICONS.Alert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700 font-mono mb-2">Analysis Failed</h3>
              <p className="text-red-600 text-lg">일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
           </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12 mt-20 relative z-20 no-print">
         <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
             <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-[#1a4031] rounded-xl flex items-center justify-center mb-4 shadow-md border border-[#2f5d48]">
                     <span className="text-orange-500 font-mono font-bold text-3xl tracking-tighter">MH</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 tracking-tight font-mono">Message House</span>
             </div>
             <div className="flex gap-6 mb-6 text-sm font-medium text-zinc-500">
                <button onClick={() => setShowIntro(true)} className="hover:text-zinc-900 transition-colors">서비스 소개</button>
                <a href="https://messagehouse.kr" target="_blank" rel="noreferrer" className="hover:text-zinc-900 transition-colors">홈페이지(메시지하우스)</a>
                <a href="https://messagehouse.kr/contact" target="_blank" rel="noreferrer" className="hover:text-zinc-900 transition-colors">문의하기</a>
             </div>
             <p className="text-zinc-500 text-base font-medium">© 2025 Message House. All rights reserved.</p>
             <p className="text-zinc-400 text-sm mt-2 font-mono">Designed for the AI-First Era.</p>

             {/* Hidden Admin Login Trigger */}
             <div className="mt-8">
                <button 
                  onClick={handleAdminLogin}
                  className="text-[10px] text-zinc-200 hover:text-zinc-400 font-mono flex items-center gap-1 mx-auto transition-colors"
                >
                    <ICONS.Lock className="w-3 h-3" />
                    Admin Demo
                </button>
            </div>
         </div>
      </footer>

      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

    </div>
  );
}

export default App;
