
import React, { useState } from 'react';
import { ICONS, APP_NAME } from '../constants';

interface LoginScreenProps {
  onLogin: () => void;
  onAdminLogin?: () => void;
  onShowIntro?: () => void; // New prop for navigation
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onAdminLogin, onShowIntro }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.4
      }}></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8 md:p-10 text-center animate-fade-in-up">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-[#1a4031] rounded-xl flex items-center justify-center mb-4 shadow-md border border-[#2f5d48]">
                <span className="text-orange-500 font-mono font-bold text-3xl tracking-tighter">MH</span>
             </div>
             <h1 className="text-2xl font-bold text-zinc-900 font-mono tracking-tight mb-1">{APP_NAME}</h1>
             <p className="text-sm text-zinc-500 font-medium">AI 검색 최적화 분석 도구</p>
          </div>

          {/* Login Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">로그인</h2>
            <p className="text-zinc-500 text-sm">소셜 계정으로 간편하게 로그인하세요</p>
          </div>

          {/* Secure Login Notice */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8 text-left flex items-start gap-3">
             <div className="mt-0.5">
                <ICONS.Shield className="w-5 h-5 text-indigo-600" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-indigo-900 mb-1">안전한 로그인</h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                   Google 및 GitHub의 공식 OAuth 인증을 사용합니다. 비밀번호는 저장되지 않으며, 소셜 계정의 보안 설정을 따릅니다.
                </p>
             </div>
          </div>

          {/* Login Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold py-3.5 rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
              ) : (
                <>
                   <GoogleIcon />
                   <span>Google로 로그인</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleLogin('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                   <ICONS.Github className="w-5 h-5" />
                   <span>GitHub로 로그인</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-xs text-zinc-400 space-y-2">
            <p>로그인 시 서비스 이용약관 및 개인정보처리방침에 동의한 것으로 간주됩니다.</p>
            <div className="flex justify-center gap-4 pt-2 border-t border-zinc-100">
               <button onClick={onShowIntro} className="hover:text-zinc-600 transition-colors">서비스 소개</button>
               <span className="text-zinc-300">|</span>
               <a href="https://messagehouse.kr" target="_blank" rel="noreferrer" className="hover:text-zinc-600 transition-colors">홈페이지(메시지하우스)</a>
            </div>
            
            {/* Admin Login Trigger */}
            <div className="mt-4 pt-4">
                <button 
                  onClick={onAdminLogin}
                  className="text-[10px] text-zinc-300 hover:text-zinc-500 font-mono flex items-center gap-1 mx-auto transition-colors"
                >
                    <ICONS.Lock className="w-3 h-3" />
                    Admin Demo
                </button>
            </div>
            <p className="mt-1 opacity-50 font-mono">vercel.app 으로 안전하게 보호됨</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
