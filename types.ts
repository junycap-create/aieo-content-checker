
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

export interface GeoInsight {
  visibilityIndex: number;
  entityDensity: number;
  citationConfidence: number;
  optimizationChecklist: string[];
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
  geoInsight: GeoInsight; // New field for GEO/AIO optimization
}

export interface AnalysisLog {
  id: string;
  userEmail: string;
  inputText: string;
  resultSummary: string;
  score: number;
  date: string;
  status: 'Completed' | 'Failed';
}

// Fix: Added missing AdminStats interface for AdminDashboard
export interface AdminStats {
  totalAnalyses: number;
  activeUsers: number;
  avgScore: number;
  growthRate: number;
}

// Fix: Added missing types for RealtimeAnalysis component
export interface FactCheck {
  claim: string;
  verification: 'Verified' | 'Contradicted' | 'Unverified';
  comment: string;
  sourceUrl?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface CompetitorTopic {
  title: string;
  sourceName: string;
}

export interface RealtimeAnalysisData {
  factChecks: FactCheck[];
  groundingSources: GroundingSource[];
  competitors: CompetitorTopic[];
}
