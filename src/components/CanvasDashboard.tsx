import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  Building2, 
  User, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Eye, 
  Lock, 
  UserCheck, 
  Activity, 
  Sparkles, 
  Filter, 
  Quote, 
  Sliders, 
  Printer, 
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  RefreshCw
} from 'lucide-react';
import { ComplaintCategory, EscalationRoute, PatientComplaint, RiskType, SeverityLevel, TriageResult } from '../types/triage';

interface CanvasDashboardProps {
  complaints: PatientComplaint[];
  activeComplaint: PatientComplaint | null;
  onSelectComplaint: (complaint: PatientComplaint) => void;
  onNewIntake: () => void;
  onUpdateStatus?: (status: PatientComplaint['status'], overrideNotes?: string) => void;
}

export const CanvasDashboard: React.FC<CanvasDashboardProps> = ({
  complaints,
  activeComplaint,
  onSelectComplaint,
  onNewIntake,
  onUpdateStatus,
}) => {
  const [riskFilter, setRiskFilter] = useState<'all' | 'flagged' | 'standard'>('all');
  const [accessibleMode, setAccessibleMode] = useState<boolean>(false);
  const [holdingTone, setHoldingTone] = useState<'compassionate' | 'formal' | 'compliance'>('compassionate');
  const [copiedHolding, setCopiedHolding] = useState<boolean>(false);
  const [copiedEhr, setCopiedEhr] = useState<boolean>(false);
  const [dispatchedNotice, setDispatchedNotice] = useState<boolean>(false);
  const [selectedRiskDetail, setSelectedRiskDetail] = useState<RiskType | null>(null);
  const [attestationSigned, setAttestationSigned] = useState<boolean>(false);
  const [reviewerName, setReviewerName] = useState<string>('Sarah Jenkins, RN, CPPS (Patient Safety Officer)');
  const [preservedChecks, setPreservedChecks] = useState<Record<string, boolean>>({
    'EHR Audit Trail & Access Logs': true,
    'Department Shift Roster': true,
    'Telemetry & Monitoring Strips': false,
    'Telephony Call Recordings': false,
  });

  const complaint = activeComplaint || complaints[0];
  const triage = complaint?.triageResult;

  if (!complaint || !triage) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <Activity className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Complaint Selected for Canvas</h3>
        <p className="text-sm text-slate-400">Select a complaint from the queue or create a new grievance intake.</p>
        <button
          onClick={onNewIntake}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
        >
          New Grievance Intake
        </button>
      </div>
    );
  }

  // Severity styles with accessible mode support
  const getSeverityConfig = (level: SeverityLevel) => {
    switch (level) {
      case 'LEVEL 4 – Critical':
        return {
          label: 'LEVEL 4 – CRITICAL',
          subLabel: 'Immediate Sentinel Event Risk & Legal Exposure',
          bannerBg: accessibleMode 
            ? 'bg-red-950 border-2 border-red-500 text-white ring-4 ring-red-500/40' 
            : 'bg-red-950/40 border-red-700/80 text-red-200',
          badgeBg: 'bg-red-900 text-red-100 border-red-600 font-black',
          progressPercent: 100,
          progressColor: 'bg-red-500',
          slaColor: 'text-red-400',
          slaBg: 'bg-red-950/90 border-red-700',
          icon: <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />,
        };
      case 'LEVEL 3 – High':
        return {
          label: 'LEVEL 3 – HIGH',
          subLabel: 'Potential Clinical Harm / Medication / ADA Accessibility',
          bannerBg: accessibleMode 
            ? 'bg-orange-950 border-2 border-orange-500 text-white ring-4 ring-orange-500/40' 
            : 'bg-orange-950/40 border-orange-700/80 text-orange-200',
          badgeBg: 'bg-orange-900 text-orange-100 border-orange-600 font-bold',
          progressPercent: 75,
          progressColor: 'bg-orange-500',
          slaColor: 'text-orange-400',
          slaBg: 'bg-orange-950/90 border-orange-700',
          icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
        };
      case 'LEVEL 2 – Moderate':
        return {
          label: 'LEVEL 2 – MODERATE',
          subLabel: 'Repeated Service Failure / Billing Dispute / Friction',
          bannerBg: accessibleMode 
            ? 'bg-amber-950 border-2 border-amber-500 text-white ring-4 ring-amber-500/40' 
            : 'bg-amber-950/40 border-amber-700/80 text-amber-200',
          badgeBg: 'bg-amber-900 text-amber-100 border-amber-600 font-bold',
          progressPercent: 50,
          progressColor: 'bg-amber-500',
          slaColor: 'text-amber-400',
          slaBg: 'bg-amber-950/90 border-amber-700',
          icon: <Activity className="w-6 h-6 text-amber-400" />,
        };
      case 'LEVEL 1 – Low':
      default:
        return {
          label: 'LEVEL 1 – LOW',
          subLabel: 'Routine Inconvenience / Facility Amenity Suggestion',
          bannerBg: accessibleMode 
            ? 'bg-emerald-950 border-2 border-emerald-500 text-white ring-4 ring-emerald-500/40' 
            : 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200',
          badgeBg: 'bg-emerald-900 text-emerald-100 border-emerald-600 font-bold',
          progressPercent: 25,
          progressColor: 'bg-emerald-500',
          slaColor: 'text-emerald-400',
          slaBg: 'bg-emerald-950/90 border-emerald-700',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
        };
    }
  };

  const severityCfg = getSeverityConfig(triage.severityLevel);

  // Dynamic holding statements based on tone
  const getDynamicHoldingStatement = () => {
    switch (holdingTone) {
      case 'formal':
        return `We acknowledge receipt of your communication regarding encounter ref ${complaint.complaintNumber}. Your submission has been cataloged under institutional grievance oversight protocols and directed to ${triage.escalationRoute} for administrative investigation. A formal written status report will be transmitted within regulatory timeframes.`;
      case 'compliance':
        return `Mercy Crest Health System has logged your complaint (Ref: ${complaint.complaintNumber}) in accordance with CMS Conditions of Participation (42 CFR § 482.13) and Joint Commission standards. The matter has been assigned to our ${triage.escalationRoute} for privileged peer review. Preserved audit logs are undergoing administrative evaluation.`;
      case 'compassionate':
      default:
        return triage.triageProtocols.recommendedHoldingStatement;
    }
  };

  const handleCopyHolding = () => {
    navigator.clipboard.writeText(getDynamicHoldingStatement());
    setCopiedHolding(true);
    setTimeout(() => setCopiedHolding(false), 2500);
  };

  const handleCopyEhr = () => {
    const text = `=== MERCY CREST CLINICAL TRIAGE CANVAS REPORT ===
Grievance ID: ${complaint.complaintNumber} | Patient Ref: ${complaint.patientInitialsOrId}
Department: ${complaint.department} | Channel: ${complaint.channel}
Received: ${complaint.dateReceived} | Triaged: ${complaint.triagedAt || 'Just now'}

[STEP 1: COMPLAINT CATEGORY]
- Primary: ${triage.primaryCategory}
- Secondary: ${triage.secondaryCategories.join(', ') || 'None'}
- Rationale: ${triage.categoryReasoning}

[STEP 2: SEVERITY LEVEL]
- Tier: ${triage.severityLevel}
- Clinical Reasoning: ${triage.severityReasoning}

[WHAT HAPPENED]
- Summary: ${triage.whatHappened.summary}
- Chronology:
${triage.whatHappened.chronology.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
- Involved Entities: ${triage.whatHappened.involvedDepartments.join(', ')}

[STEP 5: RISK DETECTION MATRIX]
${triage.risks.map(r => `  * [${r.flagged ? 'FLAGGED' : 'STANDARD'}] ${r.riskType}: ${r.explanation}`).join('\n')}

[STEP 6: ESCALATION RECOMMENDATION]
- Designated Route: ${triage.escalationRoute}
- Co-Notification: ${triage.secondaryRoute || 'None'}
- Justification: ${triage.escalationJustification}
- Target SLA: ${triage.recommendedSLA.timeframe} (${triage.recommendedSLA.urgencyLabel})

[HUMAN OVERSIGHT & ATTESTATION]
- Human Intervention Required: ${triage.humanIntervention.required ? 'YES' : 'NO'}
- Urgency: ${triage.humanIntervention.urgency}
- Attested By: ${reviewerName} ${attestationSigned ? '(CONFIRMED SIGNATURE ON FILE)' : '(PENDING SIGN-OFF)'}
===================================================`;

    navigator.clipboard.writeText(text);
    setCopiedEhr(true);
    setTimeout(() => setCopiedEhr(false), 2500);
  };

  const handleSimulateDispatch = () => {
    setDispatchedNotice(true);
    if (onUpdateStatus) {
      onUpdateStatus('Dispatched', `Electronically dispatched to ${triage.escalationRoute} via Canvas Dashboard.`);
    }
    setTimeout(() => setDispatchedNotice(false), 3500);
  };

  const filteredRisks = triage.risks.filter(r => {
    if (riskFilter === 'flagged') return r.flagged;
    if (riskFilter === 'standard') return !r.flagged;
    return true;
  });

  const flaggedCount = triage.risks.filter(r => r.flagged).length;

  return (
    <div className={`space-y-6 ${accessibleMode ? 'contrast-125 font-sans' : ''}`}>
      {/* SECTION 7.1: Interactive Incident Selector Carousel / Filmstrip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Interactive Incident Canvas Selector
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {complaints.length} Queue Items
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click any incident to instantly render its complete Step 1–6 triage dossier in the Canvas
              </p>
            </div>
          </div>

          {/* Canvas Controls: Accessible Mode & New Intake */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAccessibleMode(!accessibleMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                accessibleMode
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle WCAG AAA high contrast visual mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{accessibleMode ? 'High-Contrast Active' : 'Accessibility Mode'}</span>
            </button>

            <button
              onClick={onNewIntake}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 shadow shadow-blue-900/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Intake</span>
            </button>
          </div>
        </div>

        {/* Carousel / Mini-Cards */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pt-3 pb-1 scrollbar-thin">
          {complaints.map((c) => {
            const isSelected = c.id === complaint.id;
            const sev = c.triageResult?.severityLevel || 'LEVEL 1 – Low';
            const isL4 = sev.includes('Critical');
            const isL3 = sev.includes('High');

            return (
              <button
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className={`shrink-0 w-64 p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-md ring-2 ring-cyan-500/30'
                    : 'bg-slate-950/70 hover:bg-slate-800/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-200">
                    {c.complaintNumber}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isL4 ? 'bg-red-900 text-red-100 border border-red-700 animate-pulse' :
                    isL3 ? 'bg-orange-900 text-orange-100 border border-orange-700' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {sev.split('–')[0].trim()}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white truncate mb-1">
                  {c.triageResult?.primaryCategory || 'Under Review'}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                  "{c.text}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800">
                  <span>{c.department.split('/')[0]}</span>
                  <span className="text-cyan-400 font-medium">{c.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 7.2: STEP PROGRESSION RIBBON */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4 shadow-lg flex items-center justify-between text-xs overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 font-bold text-slate-400 shrink-0">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="uppercase tracking-wider text-[11px] text-cyan-300">Triage Pipeline:</span>
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0">
          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center justify-center text-[10px]">1</span>
            <span className="font-semibold text-cyan-300">Category</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center justify-center text-[10px]">2</span>
            <span className="font-semibold text-amber-300">Severity</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold flex items-center justify-center text-[10px]">3</span>
            <span className="font-semibold text-blue-300">Dossier</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center justify-center text-[10px]">5</span>
            <span className="font-semibold text-purple-300">8 Risks</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center justify-center text-[10px]">6</span>
            <span className="font-semibold text-emerald-300">Escalate</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center text-[10px] shadow">7</span>
            <span className="font-bold text-white underline decoration-cyan-400">Canvas Dashboard</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2">
          <button
            onClick={handleCopyEhr}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center space-x-1 border border-slate-700"
          >
            {copiedEhr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedEhr ? 'Copied' : 'Copy Record'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 7.3: EXECUTIVE HERO CANVAS (Steps 1, 2, 6 Synthesis) */}
      <div className={`p-6 rounded-3xl border ${severityCfg.bannerBg} shadow-2xl relative overflow-hidden transition-all backdrop-blur`}>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Main Badge & Title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-sm ${severityCfg.badgeBg}`}>
                {severityCfg.label}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-cyan-300 border border-cyan-800/80 shadow-sm">
                PRIMARY: {triage.primaryCategory}
              </span>

              {triage.humanIntervention.required && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-950 text-red-200 border border-red-700 flex items-center space-x-1 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>MANDATORY HUMAN OVERSIGHT</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Incident Ref: {complaint.complaintNumber}</span>
                <span className="text-slate-400 font-normal text-base">({complaint.patientInitialsOrId})</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {severityCfg.subLabel} — Assigned to <strong className="text-white underline decoration-emerald-400">{triage.escalationRoute}</strong>.
              </p>
            </div>
          </div>

          {/* SLA Countdown Card & Dispatch Trigger */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 shadow-xl shrink-0 flex flex-col justify-between space-y-3 min-w-[240px]">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Response Target SLA:</span>
                </span>
                <span className="font-bold text-white">{triage.recommendedSLA.urgencyLabel}</span>
              </div>
              <div className="text-lg font-black text-cyan-300 tracking-tight">
                {triage.recommendedSLA.timeframe}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2 border border-slate-800">
                <div
                  className={`h-full ${severityCfg.progressColor} rounded-full transition-all duration-700`}
                  style={{ width: `${severityCfg.progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleSimulateDispatch}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-lg ${
                dispatchedNotice
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
              }`}
            >
              {dispatchedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Escalation Notice Dispatched!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Jurisdictional Routing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7.4: INTERACTIVE CANVAS MATRIX (Steps 1, 2, 5, 6 Detailed Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: STEP 1 (Category) & STEP 2 (Severity Reasoning) */}
        <div className="space-y-6 lg:col-span-1">
          {/* STEP 1: Category Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>STEP 1: Complaint Category</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1 of 10 Approved</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Primary Designation:</span>
              <div className="text-base font-bold text-white bg-cyan-950/80 border border-cyan-800 px-3 py-1.5 rounded-xl shadow-sm inline-block">
                {triage.primaryCategory}
              </div>
            </div>

            {triage.secondaryCategories && triage.secondaryCategories.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Secondary Overlapping Vectors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {triage.secondaryCategories.map((sec, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-950 text-slate-300 border border-slate-700">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-400 block mb-0.5">Classification Reasoning:</span>
              <p className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {triage.categoryReasoning}
              </p>
            </div>
          </div>

          {/* STEP 2: Severity Assessment Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>STEP 2: Severity Assessment</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">L1 - L4 Rubric</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Assigned Severity:</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-black border ${severityCfg.badgeBg}`}>
                  {triage.severityLevel}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">SLA Target</span>
                <span className="text-xs font-bold text-cyan-300 font-mono">{triage.recommendedSLA.hours} Hours</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 pt-1">
              <span className="font-semibold text-slate-400 block">Clinical Severity Determination:</span>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed font-normal">
                {triage.severityReasoning}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-200">Regulatory Standard:</strong> {triage.recommendedSLA.rationale}
            </div>
          </div>
        </div>

        {/* COLUMN 2 & 3: WHAT HAPPENED & STEP 6 ESCALATION ROUTE (lg:col-span-2) */}
        <div className="space-y-6 lg:col-span-2">
          {/* "WHAT HAPPENED" INCIDENT DOSSIER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Incident Dossier: What Happened
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Department: <strong className="text-slate-200">{complaint.department}</strong>
              </span>
            </div>

            {/* Objective Summary */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300">Executive Clinical Summary:</span>
              <p className="text-xs sm:text-sm text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                {triage.whatHappened.summary}
              </p>
            </div>

            {/* Interactive Chronology Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chronological Event Reconstruction:</span>
              </span>
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {triage.whatHappened.chronology.map((event, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-900/80 border border-blue-600 text-blue-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed pt-0.5">{event}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Grievance Quotes Callout */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Quote className="w-3.5 h-3.5 text-amber-400" />
                <span>Extracted Key Patient Statements:</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {triage.whatHappened.keyPatientStatements.map((quote, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs italic text-slate-200 border-l-4 border-l-amber-500 shadow-sm"
                  >
                    {quote}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 6: ESCALATION RECOMMENDATION CANVAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">6</span>
                <span>STEP 6: Escalation Recommendation</span>
              </span>
              <span className="text-xs text-slate-400">1 of 10 Approved Jurisdictions</span>
            </div>

            {/* Visual Node Routing Flow */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shrink-0">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase block">
                    Designated Primary Jurisdiction:
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight">
                    ROUTE TO: {triage.escalationRoute}
                  </div>
                  {triage.secondaryRoute && (
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Co-Notification Required: <strong className="text-slate-200">{triage.secondaryRoute}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="md:text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Turnaround</span>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800 block mt-0.5">
                  {triage.recommendedSLA.timeframe}
                </span>
              </div>
            </div>

            {/* Justification based on identified risks */}
            <div className="text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-slate-300 block">
                Jurisdictional Escalation Justification (Grounded in Identified Risks):
              </span>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                {triage.escalationJustification}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7.5: STEP 5 MULTI-VECTOR RISK MATRIX CANVAS (Interactive 8-Risk Deck) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                STEP 5: Multi-Vector Risk Detection Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Interactive screening across all 8 institutional risk dimensions ({flaggedCount} Elevated Flags)
              </p>
            </div>
          </div>

          {/* Risk Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                riskFilter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All 8 Risks
            </button>
            <button
              onClick={() => setRiskFilter('flagged')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                riskFilter === 'flagged' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Flagged Only ({flaggedCount})
            </button>
            <button
              onClick={() => setRiskFilter('standard')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                riskFilter === 'standard' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard ({8 - flaggedCount})
            </button>
          </div>
        </div>

        {/* 8-Risk Cards Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {filteredRisks.map((risk, idx) => {
            const isSelected = selectedRiskDetail === risk.riskType;
            return (
              <div
                key={idx}
                onClick={() => setSelectedRiskDetail(isSelected ? null : risk.riskType)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  risk.flagged
                    ? accessibleMode
                      ? 'bg-red-950 border-2 border-red-500 shadow-md shadow-red-950/50'
                      : 'bg-red-950/30 hover:bg-red-950/40 border-red-800/80 shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-950/80 border-slate-800 opacity-80'
                } ${isSelected ? 'ring-2 ring-purple-400' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold ${risk.flagged ? 'text-red-300' : 'text-slate-300'}`}>
                      {risk.riskType}
                    </span>
                    {risk.flagged ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/90 text-red-200 border border-red-700 animate-pulse">
                        FLAGGED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                        Standard
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {risk.explanation}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/70 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{risk.flagged ? 'Elevated Oversight' : 'Monitored'}</span>
                  <span className="text-cyan-400 hover:underline">
                    {isSelected ? 'Collapse' : 'Details'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7.6: HUMAN OVERSIGHT, ATTESTATION & ACTIONABLE PROTOCOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Holding Statement Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Quote className="w-3.5 h-3.5 text-blue-400" />
                <span>Patient Holding Statement (Non-Admission of Liability)</span>
              </span>

              {/* Tone Switcher */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setHoldingTone('compassionate')}
                  className={`px-2 py-0.5 rounded ${
                    holdingTone === 'compassionate' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Compassionate
                </button>
                <button
                  onClick={() => setHoldingTone('formal')}
                  className={`px-2 py-0.5 rounded ${
                    holdingTone === 'formal' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Administrative
                </button>
                <button
                  onClick={() => setHoldingTone('compliance')}
                  className={`px-2 py-0.5 rounded ${
                    holdingTone === 'compliance' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  CMS / Joint Comm.
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Hospital risk-management approved initial response acknowledging receipt without prejudging the clinical outcome or admitting institutional liability:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 italic leading-relaxed font-normal shadow-inner">
              "{getDynamicHoldingStatement()}"
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              Tone: <strong className="text-slate-300 capitalize">{holdingTone}</strong>
            </span>
            <button
              onClick={handleCopyHolding}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 transition-colors shadow shadow-blue-900/30"
            >
              {copiedHolding ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Statement Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Statement</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Credentialed Human Reviewer Attestation & Evidence Lock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Human Triage Officer Attestation & Evidence Lock</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              attestationSigned ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {attestationSigned ? 'Signed & Verified' : 'Attestation Pending'}
            </span>
          </div>

          {/* Designated Roles */}
          <div className="text-xs space-y-1">
            <span className="text-slate-400 font-semibold block">Designated Human Oversight Roles:</span>
            <div className="flex flex-wrap gap-1.5">
              {triage.humanIntervention.targetRoles.map((role, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 text-xs font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Evidence Lock Checklist */}
          <div className="text-xs space-y-1.5">
            <span className="text-slate-400 font-semibold block">Evidence Preservation Mandate (42 CFR § 482.13):</span>
            <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {Object.keys(preservedChecks).map((item) => (
                <label key={item} className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={preservedChecks[item]}
                    onChange={(e) => setPreservedChecks(prev => ({ ...prev, [item]: e.target.checked }))}
                    className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reviewer Signature Box */}
          <div className="pt-2 border-t border-slate-800/80 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Reviewer Name & Credential"
                className="w-full sm:w-auto flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => setAttestationSigned(!attestationSigned)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                  attestationSigned
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {attestationSigned ? 'Attestation Confirmed ✓' : 'Sign & Endorse Triage'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
