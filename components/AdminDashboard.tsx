
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminStats, AnalysisLog } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  logs: AnalysisLog[]; // Received from App
  isMaintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
}

// Mock Data for Dashboard (Charts and User stats still mocked)
const MOCK_STATS: AdminStats = {
  totalAnalyses: 1248,
  activeUsers: 86,
  avgScore: 72,
  growthRate: 15.4
};

const MOCK_CHART_DATA = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 38 },
  { name: 'Thu', value: 65 },
  { name: 'Fri', value: 48 },
  { name: 'Sat', value: 20 },
  { name: 'Sun', value: 25 },
];

// Mock Data for User Management
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@messagehouse.kr', role: 'Super Admin', status: 'Active', joinedDate: '2025-01-01' },
  { id: 2, name: 'Kim Minjun', email: 'minjun.kim@example.com', role: 'User', status: 'Active', joinedDate: '2025-02-15' },
  { id: 3, name: 'Lee Seo-yun', email: 'seoyun.lee@test.co.kr', role: 'User', status: 'Active', joinedDate: '2025-03-10' },
  { id: 4, name: 'Park Ji-hoon', email: 'jihoon.park@agency.net', role: 'Editor', status: 'Inactive', joinedDate: '2025-04-05' },
];

// --- Sub Components ---

const DashboardOverview: React.FC<{ logs: AnalysisLog[] }> = ({ logs }) => {
  // Calculate dynamic stats from props
  const todayCount = logs.filter(l => {
    const logDate = new Date(l.date);
    const today = new Date();
    return logDate.getDate() === today.getDate() && logDate.getMonth() === today.getMonth();
  }).length;

  const totalScore = logs.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = logs.length > 0 ? Math.round(totalScore / logs.length) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 font-mono">Dashboard Overview</h1>
        <p className="text-zinc-500">Welcome back, Administrator.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg"><ICONS.Activity className="w-6 h-6 text-indigo-600" /></div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 mb-1">{MOCK_STATS.totalAnalyses + logs.length}</div>
            <div className="text-sm text-zinc-500">Total Analyses</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-50 rounded-lg"><ICONS.Users className="w-6 h-6 text-orange-600" /></div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Live</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900 mb-1">{todayCount}</div>
            <div className="text-sm text-zinc-500">Analyses Today (Session)</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 rounded-lg"><ICONS.Chart className="w-6 h-6 text-green-600" /></div>
            </div>
            <div className="text-3xl font-bold text-zinc-900 mb-1">{avgScore > 0 ? avgScore : MOCK_STATS.avgScore}</div>
            <div className="text-sm text-zinc-500">Avg. AIEO Score (Realtime)</div>
        </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-pink-50 rounded-lg"><ICONS.Database className="w-6 h-6 text-pink-600" /></div>
            </div>
            <div className="text-3xl font-bold text-zinc-900 mb-1">99.9%</div>
            <div className="text-sm text-zinc-500">System Uptime</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-lg text-zinc-900 mb-6 font-mono">Weekly Analysis Volume</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-lg text-zinc-900 mb-6 font-mono">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm font-medium text-zinc-700 transition-colors flex items-center justify-between group">
                    <span>Export User Report</span>
                    <ICONS.ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
                </button>
                <button className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm font-medium text-zinc-700 transition-colors flex items-center justify-between group">
                    <span>System Health Check</span>
                    <ICONS.ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
                </button>
                <button className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm font-medium text-zinc-700 transition-colors flex items-center justify-between group">
                    <span>Manage API Keys</span>
                    <ICONS.ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
                </button>
              </div>
        </div>
      </div>
    </div>
  );
};

const ContentLogViewer: React.FC<{ logs: AnalysisLog[] }> = ({ logs }) => {
    const [selectedLog, setSelectedLog] = useState<AnalysisLog | null>(null);

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden animate-fade-in relative">
            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                <h3 className="font-bold text-lg text-zinc-900 font-mono">Real-time Analysis Logs</h3>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded">Total: {logs.length}</span>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-100 font-mono sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 font-medium">Time</th>
                            <th className="px-6 py-3 font-medium">User</th>
                            <th className="px-6 py-3 font-medium">Input Preview</th>
                            <th className="px-6 py-3 font-medium">Score</th>
                            <th className="px-6 py-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {logs.length > 0 ? logs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-500 text-xs whitespace-nowrap">{log.date}</td>
                                <td className="px-6 py-4 font-medium text-zinc-900 text-xs">{log.userEmail}</td>
                                <td className="px-6 py-4 text-zinc-600 max-w-[200px] truncate">{log.inputText.substring(0, 50)}...</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        log.score >= 80 ? 'bg-green-100 text-green-700' :
                                        log.score >= 60 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {log.score}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedLog(log)}
                                        className="text-xs font-bold bg-zinc-900 text-white px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors"
                                    >
                                        View Detail
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-zinc-400">No logs yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-4 border-b border-zinc-200 bg-zinc-50">
                            <div>
                                <h3 className="font-bold text-lg font-mono">Log Detail: {selectedLog.id}</h3>
                                <p className="text-xs text-zinc-500">{selectedLog.date}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)}><ICONS.Close className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">Input Text</h4>
                                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                                    {selectedLog.inputText}
                                </div>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">AI Summary & Feedback</h4>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm leading-relaxed">
                                    {selectedLog.resultSummary}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsPanel: React.FC<{ isMaintenance: boolean, setMaintenance: (v: boolean) => void }> = ({ isMaintenance, setMaintenance }) => {
    const [testKey, setTestKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<'NONE' | 'SUCCESS' | 'FAIL'>('NONE');

    const handleValidate = async () => {
        if (!testKey) return;
        setIsValidating(true);
        setValidationResult('NONE');
        
        // Import dynamically to avoid circular dependency if any, but geminiService is fine
        const { validateApiKey } = await import('../services/geminiService');
        const isValid = await validateApiKey(testKey);
        
        setValidationResult(isValid ? 'SUCCESS' : 'FAIL');
        setIsValidating(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <header className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 font-mono">System Settings</h1>
                <p className="text-zinc-500">Configure global application settings.</p>
             </header>

             <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
                <h3 className="font-bold text-lg text-zinc-900 mb-6 flex items-center gap-2">
                    <ICONS.Alert className="w-5 h-5 text-amber-500" />
                    Emergency Controls
                </h3>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div>
                        <div className="font-bold text-zinc-900">Maintenance Mode</div>
                        <p className="text-xs text-zinc-500 mt-1">Prevents new analyses from being run by users.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isMaintenance}
                            onChange={(e) => setMaintenance(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
                <h3 className="font-bold text-lg text-zinc-900 mb-6 flex items-center gap-2">
                    <ICONS.Lock className="w-5 h-5 text-zinc-900" />
                    API Key Management
                </h3>
                <div className="space-y-4">
                     <div className="max-w-md">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Validate & Test API Key</label>
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={testKey}
                                onChange={(e) => setTestKey(e.target.value)}
                                placeholder="Enter Gemini API Key to test..."
                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                            />
                            <button 
                                onClick={handleValidate}
                                disabled={isValidating || !testKey}
                                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all disabled:bg-zinc-300"
                            >
                                {isValidating ? 'Testing...' : 'Test Key'}
                            </button>
                        </div>
                        {validationResult === 'SUCCESS' && <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1"><ICONS.Check className="w-3 h-3" /> Valid API Key. This key is active and working.</p>}
                        {validationResult === 'FAIL' && <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1"><ICONS.Alert className="w-3 h-3" /> Invalid API Key. Please check the key and try again.</p>}
                     </div>
                     <div className="pt-4 border-t border-zinc-100">
                        <button className="text-sm text-indigo-600 font-bold hover:underline">Rotate Production Keys</button>
                        <span className="mx-2 text-zinc-300">|</span>
                        <button className="text-sm text-indigo-600 font-bold hover:underline">View Audit Logs</button>
                     </div>
                </div>
             </div>
        </div>
    )
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const handleAddUser = () => {
    // Simulation: Add a random user
    const newUser: User = {
      id: users.length + 1,
      name: `New User ${users.length}`,
      email: `user${users.length}@example.com`,
      role: 'User',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-mono">User Management</h1>
          <p className="text-zinc-500">Manage system users and access controls.</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <ICONS.Plus className="w-4 h-4" />
          Add User
        </button>
      </header>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-100 font-mono">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-zinc-900">{user.name}</td>
                  <td className="px-6 py-4 text-zinc-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 rounded text-xs font-mono text-zinc-600 border border-zinc-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{user.joinedDate}</td>
                  <td className="px-6 py-4 text-right">
                     <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete User"
                     >
                        <ICONS.Trash className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main Admin Component ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, logs, isMaintenanceMode, setMaintenanceMode }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'logs' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex-shrink-0 hidden md:flex flex-col">
        {/* Clickable Header -> Go to First Screen (Logout) */}
        <button 
          onClick={onLogout}
          className="p-6 border-b border-zinc-800 flex items-center gap-3 hover:bg-zinc-800 transition-colors w-full text-left"
          title="첫 화면으로 이동 (로그아웃)"
        >
          <div className="w-8 h-8 bg-[#1a4031] rounded flex items-center justify-center border border-[#2f5d48]">
              <span className="text-orange-500 font-mono font-bold">MH</span>
          </div>
          <span className="font-bold font-mono tracking-tight text-white">Admin</span>
        </button>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ICONS.Dashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
             onClick={() => setCurrentView('users')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ICONS.Users className="w-5 h-5" /> Users
          </button>
          <button 
             onClick={() => setCurrentView('logs')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'logs' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ICONS.Content className="w-5 h-5" /> Content Logs
          </button>
          <button 
             onClick={() => setCurrentView('settings')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ICONS.Settings className="w-5 h-5" /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg font-medium transition-colors">
            <ICONS.Logout className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-zinc-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold font-mono">Message House Admin</span>
            <button onClick={onLogout}><ICONS.Logout className="w-5 h-5" /></button>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {currentView === 'dashboard' && <DashboardOverview logs={logs} />}
          {currentView === 'users' && <UserManagement />}
          {currentView === 'logs' && <ContentLogViewer logs={logs} />}
          {currentView === 'settings' && <SettingsPanel isMaintenance={isMaintenanceMode} setMaintenance={setMaintenanceMode} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
