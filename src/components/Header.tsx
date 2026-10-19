import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  BarChart3, 
  BookOpen, 
  Sparkles,
  AlertTriangle,
  Stethoscope,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'console' | 'queue' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'console' | 'queue' | 'analytics') => void;
  openPolicyModal: () => void;
  criticalCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openPolicyModal,
  criticalCount,
  totalCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">TriageCare AI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                  Clinical Governance
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Healthcare Complaint Triage & Sentinel Risk Routing
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-300" />
              <span>Canvas Dashboard</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase tracking-wider">
                Step 7
              </span>
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'console'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Intake Console</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'queue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grievance Queue</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                {totalCount}
              </span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-950 text-red-400 border border-red-800 animate-pulse font-semibold">
                  {criticalCount} Critical
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Risk Intelligence</span>
            </button>
          </nav>

          {/* Right Action buttons & Compliance indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center text-xs text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Human Oversight Enforced</span>
            </div>

            <button
              onClick={openPolicyModal}
              className="flex items-center space-x-1.5 text-xs text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/80 px-3 py-1.5 rounded-lg transition-colors"
              title="View Triage Policy & Rubrics"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-medium">Triage Rubric</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-950/90 px-4 py-2 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 text-xs rounded-md font-semibold whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Canvas Dashboard
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'console' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Intake Console
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1 text-xs rounded-md ${
            activeTab === 'queue' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Queue ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1 text-xs rounded-md ${
            activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Risk Intelligence
        </button>
      </div>
    </header>
  );
};
