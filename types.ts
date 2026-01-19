
export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface Metric {
  name: string;
  score: number; // 0-100
  feedback: string;
  status: 'Good' | 'Needs Improvement' | 'Weak';
}

export interface Snippet {
  question: string;
  answer: string;
}

export interface RewriteSet {
  basic: string;
  linkedin: string;
  newsroom: string;
  faq: string;
  tldr: string;
}

export interface AnalysisResult {
  totalScore: number;
  summary: string;
  metrics: Metric[];
  snippets: Snippet[];
  rewrites: RewriteSet;
  checklists: {
    basic: string[];
    linkedin: string[];
    newsroom: string[];
    faq: string[];
    tldr: string[];
  };
}

// Realtime Analysis Types
export interface FactCheckItem {
  claim: string;
  verification: 'Verified' | 'Contradicted' | 'Unverified';
  comment: string;
  sourceUrl?: string;
}

export interface GroundingSourceItem {
  uri: string;
  title: string;
}

export interface CompetitorItem {
  title: string;
  sourceName: string;
}

export interface RealtimeAnalysisData {
  factChecks: FactCheckItem[];
  groundingSources: GroundingSourceItem[];
  competitors: CompetitorItem[];
}

// Admin Types
export interface AnalysisLog {
  id: string;
  userEmail: string;
  inputText: string;
  resultSummary: string;
  score: number;
  date: string;
  status: 'Completed' | 'Failed';
}

export interface AdminStats {
  totalAnalyses: number;
  activeUsers: number;
  avgScore: number;
  growthRate: number;
}
