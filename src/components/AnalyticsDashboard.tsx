import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Share2, 
  Building,
  Activity
} from 'lucide-react';
import { PatientComplaint, RiskType } from '../types/triage';

interface AnalyticsDashboardProps {
  complaints: PatientComplaint[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ complaints }) => {
  const total = complaints.length || 1;

  // Severity metrics
  const l4Critical = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 4 – Critical'
  ).length;
  const l3High = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 3 – High'
  ).length;
  const l2Moderate = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 2 – Moderate'
  ).length;
  const l1Low = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 1 – Low'
  ).length;

  // Risk detection counts
  const allRisks: RiskType[] = [
    'Patient Safety Risk',
    'Clinical Risk',
    'Compliance Risk',
    'Privacy Risk',
    'Accessibility Risk',
    'Equity Risk',
    'Reputational Risk',
    'Operational Risk',
  ];

  const riskCounts: Record<RiskType, number> = {
    'Patient Safety Risk': 0,
    'Clinical Risk': 0,
    'Compliance Risk': 0,
    'Privacy Risk': 0,
    'Accessibility Risk': 0,
    'Equity Risk': 0,
    'Reputational Risk': 0,
    'Operational Risk': 0,
  };

  complaints.forEach((c) => {
    c.triageResult?.risks?.forEach((r) => {
      if (r.flagged) {
        riskCounts[r.riskType] = (riskCounts[r.riskType] || 0) + 1;
      }
    });
  });

  // Routing counts
  const routeCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    if (c.triageResult?.escalationRoute) {
      const r = c.triageResult.escalationRoute;
      routeCounts[r] = (routeCounts[r] || 0) + 1;
    }
  });

  const sortedRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]);

  // SLA Performance stats
  const humanInterventionsRequired = complaints.filter(
    (c) => c.triageResult?.humanIntervention.required
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Grievances Ingested</span>
            <div className="text-xl font-bold text-white tracking-tight">{complaints.length} Cases</div>
            <span className="text-[10px] text-emerald-400 font-medium">100% Triaged & Classified</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-red-300 font-medium block">Level 4 – Critical Alerts</span>
            <div className="text-xl font-bold text-red-100 tracking-tight">{l4Critical} Incidents</div>
            <span className="text-[10px] text-red-400 font-semibold">Immediate &lt;2h SLA Triggered</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-orange-900/50 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-orange-300 font-medium block">Level 3 – High Priority</span>
            <div className="text-xl font-bold text-orange-100 tracking-tight">{l3High} Incidents</div>
            <span className="text-[10px] text-orange-400 font-semibold">24h Clinical Oversight</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Mandatory Human Review</span>
            <div className="text-xl font-bold text-white tracking-tight">{humanInterventionsRequired} Cases</div>
            <span className="text-[10px] text-cyan-400 font-medium">
              {Math.round((humanInterventionsRequired / total) * 100)}% Governance Threshold
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Severity Level Distribution (Step 2 Rubric)
              </h3>
            </div>
            <span className="text-xs text-slate-400">CMS & Joint Commission</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* L4 */}
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span className="text-red-400 font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  LEVEL 4 – Critical (Immediate Sentinel Risk)
                </span>
                <span>
                  {l4Critical} ({Math.round((l4Critical / total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${(l4Critical / total) * 100}%` }}
                />
              </div>
            </div>

            {/* L3 */}
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span className="text-orange-400 font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                  LEVEL 3 – High (Harm / Medication / ADA)
                </span>
                <span>
                  {l3High} ({Math.round((l3High / total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(l3High / total) * 100}%` }}
                />
              </div>
            </div>

            {/* L2 */}
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span className="text-amber-400 font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  LEVEL 2 – Moderate (Repeated Breakdown / Billing)
                </span>
                <span>
                  {l2Moderate} ({Math.round((l2Moderate / total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(l2Moderate / total) * 100}%` }}
                />
              </div>
            </div>

            {/* L1 */}
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span className="text-emerald-400 font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  LEVEL 1 – Low (Routine Inconvenience / Suggestion)
                </span>
                <span>
                  {l1Low} ({Math.round((l1Low / total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(l1Low / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Vector Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Risk Vector Detection Frequency (Step 5 Matrix)
              </h3>
            </div>
            <span className="text-xs text-slate-400">8 Institutional Vectors</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {allRisks.map((risk) => {
              const count = riskCounts[risk] || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={risk} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-medium text-slate-200">{risk}</span>
                    <span className="font-mono text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Escalation Route Workload & Systemic Clinical Safety Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escalation Route Allocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Escalation Department Routing Load (Step 6)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Jurisdictional Handoffs</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {sortedRoutes.map(([route, count]) => (
              <div
                key={route}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
              >
                <div className="flex items-center space-x-2 text-slate-200 font-medium">
                  <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{route}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 font-bold text-cyan-300 border border-slate-700">
                    {count} {count === 1 ? 'case' : 'cases'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {Math.round((count / total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentinel Clinical Quality Safety Highlights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Systemic Quality Hotspots & RCA Triggers
              </h3>
            </div>
            <span className="text-xs text-slate-400">Institutional Learnings</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-300">Emergency Triage Door-to-EKG Bottleneck</span>
                <span className="text-[10px] bg-red-900/80 text-red-200 px-1.5 py-0.5 rounded">RCA Priority</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Acute chest pain triage bypass identified in waiting lobby. Recommendation to mandate immediate triage EKG protocol within 10 minutes of ambulance or walk-in arrival.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300">MyChart Patient Portal Identity Cross-Link</span>
                <span className="text-[10px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded">HIPAA Notice</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Electronic Master Patient Index (EMPI) algorithmic collision resulted in unauthorized sensitive chart exposure. Recommended immediate interface engine token audit.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">CPOE Anticoagulant Discharge Safeguards</span>
                <span className="text-[10px] bg-amber-900/80 text-amber-200 px-1.5 py-0.5 rounded">Pharmacy CDS</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                High-alert oral anticoagulant supratherapeutic near-miss indicates need for hard-stop maximum single-dose clinical decision support rules at outpatient discharge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
