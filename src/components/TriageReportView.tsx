import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Share2, 
  Copy, 
  Check, 
  FileCheck, 
  ChevronRight, 
  Quote, 
  Calendar, 
  Building, 
  UserCheck, 
  Lock, 
  Printer, 
  Edit3, 
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { ComplaintCategory, EscalationRoute, PatientComplaint, SeverityLevel, TriageResult } from '../types/triage';

interface TriageReportViewProps {
  triage: TriageResult;
  complaint?: PatientComplaint;
  modelUsed?: string;
  onUpdateComplaintStatus?: (status: PatientComplaint['status'], overrideNotes?: string) => void;
}

export const TriageReportView: React.FC<TriageReportViewProps> = ({
  triage,
  complaint,
  modelUsed = 'Gemini 3.8 Flash',
  onUpdateComplaintStatus,
}) => {
  const [copiedHolding, setCopiedHolding] = useState(false);
  const [copiedFullReport, setCopiedFullReport] = useState(false);
  const [isEditingOverride, setIsEditingOverride] = useState(false);
  const [overrideSeverity, setOverrideSeverity] = useState<SeverityLevel>(triage.severityLevel);
  const [overrideRoute, setOverrideRoute] = useState<EscalationRoute>(triage.escalationRoute);
  const [officerNotes, setOfficerNotes] = useState(complaint?.humanOverrideNotes || '');
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Severity visual helpers
  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case 'LEVEL 4 – Critical':
        return {
          bg: 'bg-red-500/20 border-red-500/80 text-red-300 ring-2 ring-red-500/30',
          badge: 'bg-red-950 text-red-200 border-red-700',
          icon: <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />,
          label: 'CRITICAL',
          subLabel: 'Immediate Sentinel Risk / Legal Exposure',
        };
      case 'LEVEL 3 – High':
        return {
          bg: 'bg-orange-500/20 border-orange-500/80 text-orange-300',
          badge: 'bg-orange-950 text-orange-200 border-orange-700',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          label: 'HIGH',
          subLabel: 'Potential Harm / Regulatory Grievance',
        };
      case 'LEVEL 2 – Moderate':
        return {
          bg: 'bg-amber-500/20 border-amber-500/80 text-amber-300',
          badge: 'bg-amber-950 text-amber-200 border-amber-700',
          icon: <AlertCircleIcon className="w-5 h-5 text-amber-400" />,
          label: 'MODERATE',
          subLabel: 'Repeated Service Failure / Breakdown',
        };
      case 'LEVEL 1 – Low':
      default:
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300',
          badge: 'bg-emerald-950 text-emerald-200 border-emerald-700',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          label: 'LOW',
          subLabel: 'Routine Inconvenience / Suggestion',
        };
    }
  };

  const severityStyle = getSeverityBadge(overrideSeverity);

  const copyHoldingStatement = () => {
    navigator.clipboard.writeText(triage.triageProtocols.recommendedHoldingStatement);
    setCopiedHolding(true);
    setTimeout(() => setCopiedHolding(false), 2500);
  };

  const copyStructuredReport = () => {
    const reportText = `=================================================================
MERCY CREST HEALTH SYSTEM - PATIENT SAFETY & TRIAGE INCIDENT REPORT
CONFIDENTIAL - MEDICAL PEER REVIEW & QUALITY GOVERNANCE PRIVILEGED
=================================================================
Complaint Ref: ${complaint?.complaintNumber || 'UNSAVED-INTAKE'}
Patient Ref: ${complaint?.patientInitialsOrId || 'N/A'}
Department: ${complaint?.department || 'Clinical Services'}
Intake Channel: ${complaint?.channel || 'Portal/Grievance'}
Date/Time Triaged: ${complaint?.triagedAt || new Date().toLocaleString()}
Analysis Engine: ${modelUsed}

STEP 1: COMPLAINT CATEGORY
- Primary Category: ${triage.primaryCategory}
- Secondary Categories: ${triage.secondaryCategories.join(', ') || 'None'}
- Category Reasoning: ${triage.categoryReasoning}

STEP 2: SEVERITY ASSESSMENT
- Assigned Severity: ${overrideSeverity}
- Severity Reasoning: ${triage.severityReasoning}

WHAT HAPPENED (INCIDENT DOSSIER)
- Executive Summary: ${triage.whatHappened.summary}
- Chronology:
${triage.whatHappened.chronology.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
- Involved Entities: ${triage.whatHappened.involvedDepartments.join(', ')}
- Direct Patient Statements:
${triage.whatHappened.keyPatientStatements.map((q) => `  * ${q}`).join('\n')}

STEP 5: RISK DETECTION MATRIX
${triage.risks.map((r) => `- [${r.flagged ? 'ELEVATED' : 'STANDARD'}] ${r.riskType}: ${r.explanation}`).join('\n')}

STEP 6: ESCALATION RECOMMENDATION
- Primary Route: ${overrideRoute}
- Secondary CC Route: ${triage.secondaryRoute || 'None'}
- Escalation Justification: ${triage.escalationJustification}

RESPONSE SLA & TIME WINDOW
- Recommended SLA: ${triage.recommendedSLA.timeframe} (${triage.recommendedSLA.urgencyLabel})
- Regulatory Rationale: ${triage.recommendedSLA.rationale}

HUMAN INTERVENTION REQUIREMENT
- Human Oversight Required: ${triage.humanIntervention.required ? 'YES (MANDATORY)' : 'NO'}
- Urgency: ${triage.humanIntervention.urgency}
- Designated Roles: ${triage.humanIntervention.targetRoles.join(', ')}
- Oversight Rationale: ${triage.humanIntervention.oversightReasoning}

RECOMMENDED IMMEDIATE HOLDING STATEMENT
"${triage.triageProtocols.recommendedHoldingStatement}"

EVIDENCE PRESERVATION MANDATE
${triage.triageProtocols.recordsToPreserve.map((rec) => `- ${rec}`).join('\n')}

TRIAGE OFFICER ENDORSEMENT
- Human Reviewer Notes: ${officerNotes || 'Endorsed per automated clinical assessment protocol'}
=================================================================`;

    navigator.clipboard.writeText(reportText);
    setCopiedFullReport(true);
    setTimeout(() => setCopiedFullReport(false), 2500);
  };

  const handleDispatch = () => {
    setDispatchedSuccess(true);
    if (onUpdateComplaintStatus) {
      onUpdateComplaintStatus('Dispatched', officerNotes);
    }
    setTimeout(() => setDispatchedSuccess(false), 3500);
  };

  const handleSaveOfficerNotes = () => {
    setIsEditingOverride(false);
    if (onUpdateComplaintStatus) {
      onUpdateComplaintStatus('Under Human Review', officerNotes);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Clinical Triage Hero Banner */}
      <div className={`p-5 rounded-2xl border ${severityStyle.bg} backdrop-blur-md relative overflow-hidden transition-all shadow-xl`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Severity & Alert Status */}
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 shrink-0 shadow">
              {severityStyle.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${severityStyle.badge}`}>
                  {overrideSeverity}
                </span>

                {triage.humanIntervention.required ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-950/80 text-red-300 border border-red-700/80 flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span>MANDATORY HUMAN INTERVENTION</span>
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Standard Batch Review
                  </span>
                )}

                <span className="text-[11px] text-slate-400 flex items-center space-x-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Engine: {modelUsed}</span>
                </span>
              </div>

              <h1 className="text-lg font-bold text-white tracking-tight">
                {triage.primaryCategory} • Route to {overrideRoute}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Response Window:{' '}
                <strong className="text-white underline decoration-cyan-400/50 underline-offset-2">
                  {triage.recommendedSLA.timeframe}
                </strong>{' '}
                ({triage.recommendedSLA.urgencyLabel}) — {severityStyle.subLabel}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingOverride(!isEditingOverride)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Officer Override / Notes</span>
            </button>

            <button
              onClick={copyStructuredReport}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              {copiedFullReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy EHR Report</span>
                </>
              )}
            </button>

            <button
              onClick={handleDispatch}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow transition-all ${
                dispatchedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
              }`}
            >
              {dispatchedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Notice Dispatched!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Route Notice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Human Officer Override Panel (Expandable) */}
        {isEditingOverride && (
          <div className="mt-4 pt-4 border-t border-slate-700/60 bg-slate-950/70 p-4 rounded-xl text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Credentialed Triage Officer Override & Clinical Attestation</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Peer Review & Grievance Governance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Adjust Severity Level:
                </label>
                <select
                  value={overrideSeverity}
                  onChange={(e) => setOverrideSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="LEVEL 4 – Critical">LEVEL 4 – Critical</option>
                  <option value="LEVEL 3 – High">LEVEL 3 – High</option>
                  <option value="LEVEL 2 – Moderate">LEVEL 2 – Moderate</option>
                  <option value="LEVEL 1 – Low">LEVEL 1 – Low</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Adjust Primary Escalation Route:
                </label>
                <select
                  value={overrideRoute}
                  onChange={(e) => setOverrideRoute(e.target.value as EscalationRoute)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Patient Experience Team">Patient Experience Team</option>
                  <option value="Nursing Leadership">Nursing Leadership</option>
                  <option value="Physician Leadership">Physician Leadership</option>
                  <option value="Quality Improvement Team">Quality Improvement Team</option>
                  <option value="Compliance Office">Compliance Office</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Revenue Cycle / Billing">Revenue Cycle / Billing</option>
                  <option value="Accessibility Coordinator">Accessibility Coordinator</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Executive Review">Executive Review</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Triage Officer Clinical / Risk Notes:
              </label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={2}
                placeholder="Enter documentation of peer review discussion, EMR chart audit request, or justification for modifying automated triage..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditingOverride(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOfficerNotes}
                className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow"
              >
                Save Officer Attestation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Steps 1 & 2 + What Happened */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: STEP 1 (Category) & STEP 2 (Severity) */}
        <div className="space-y-6 lg:col-span-1">
          {/* STEP 1: Complaint Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>STEP 1: Complaint Category</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1 of 10 Standard</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Primary Classification:</span>
              <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm">
                {triage.primaryCategory}
              </div>
            </div>

            {triage.secondaryCategories && triage.secondaryCategories.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Secondary Categories Present:</span>
                <div className="flex flex-wrap gap-1.5">
                  {triage.secondaryCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-400 block mb-0.5">Classification Rationale:</span>
              <p>{triage.categoryReasoning}</p>
            </div>
          </div>

          {/* STEP 2: Severity Assessment */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>STEP 2: Severity Assessment</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">L1 - L4 Rubric</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Assigned Severity Tier:</span>
              <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${severityStyle.badge}`}>
                {overrideSeverity}
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <span className="font-semibold text-slate-400 block">Severity Determination Reasoning:</span>
              <p className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                {triage.severityReasoning}
              </p>
            </div>
          </div>

          {/* Human Intervention Trigger Box */}
          <div className={`p-4 rounded-2xl border ${
            triage.humanIntervention.required
              ? 'bg-red-950/20 border-red-800/70'
              : 'bg-slate-900 border-slate-800'
          } text-xs space-y-2.5 shadow-lg`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <UserCheck className={`w-4 h-4 ${triage.humanIntervention.required ? 'text-red-400' : 'text-slate-400'}`} />
                <span>Human Oversight Mandate</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                triage.humanIntervention.required ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-300'
              }`}>
                {triage.humanIntervention.urgency}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {triage.humanIntervention.oversightReasoning}
            </p>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Credentialed Reviewers Required:
              </span>
              <div className="flex flex-wrap gap-1">
                {triage.humanIntervention.targetRoles.map((role, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-700 text-cyan-300 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: "What Happened" Incident Dossier (lg:col-span-2) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Incident Dossier */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Incident Dossier: What Happened
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Objective extraction & timeline synthesis
              </span>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Executive Summary:</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-normal">
                {triage.whatHappened.summary}
              </p>
            </div>

            {/* Chronological Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chronological Sequence of Events:</span>
              </span>
              <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                {triage.whatHappened.chronology.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-700/80 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Involved Departments & Key Quotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Involved Entities */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Involved Departments & Services:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {triage.whatHappened.involvedDepartments.map((dept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-200 border border-slate-800 font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Quotes / Statements */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Patient / Grievance Statements:</span>
                </span>
                <div className="space-y-1.5">
                  {triage.whatHappened.keyPatientStatements.map((stmt, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs italic text-slate-300 border-l-2 border-l-amber-500"
                    >
                      {stmt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 6: Escalation Recommendation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">6</span>
                <span>STEP 6: Escalation Recommendation</span>
              </span>
              <span className="text-xs text-slate-400">1 of 10 Approved Jurisdictions</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/60">
              <div>
                <span className="text-xs text-emerald-300 font-medium block">Designated Primary Route:</span>
                <div className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2 mt-0.5">
                  <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>ROUTE TO: {overrideRoute}</span>
                </div>
                {triage.secondaryRoute && (
                  <p className="text-xs text-slate-400 mt-1">
                    Co-Notification (CC): <strong className="text-slate-200">{triage.secondaryRoute}</strong>
                  </p>
                )}
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[11px] text-slate-400 block">SLA Target Window</span>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800 block mt-0.5">
                  {triage.recommendedSLA.timeframe}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-slate-300 block">
                Escalation Pathway Justification (Grounded in Identified Risks):
              </span>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                {triage.escalationJustification}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 5: Risk Detection Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              STEP 5: Multi-Vector Risk Detection Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Systematic screening across 8 institutional risk dimensions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {triage.risks.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                item.flagged
                  ? 'bg-red-950/25 border-red-800/80 shadow-sm shadow-red-950/30'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${item.flagged ? 'text-red-300' : 'text-slate-300'}`}>
                    {item.riskType}
                  </span>
                  {item.flagged ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/90 text-red-200 border border-red-700 uppercase tracking-wider animate-pulse">
                      Flagged
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Triage Protocols & Records Preservation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Holding Statement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Quote className="w-3.5 h-3.5 text-blue-400" />
                <span>Recommended Patient Holding Statement (Non-Admission)</span>
              </span>
              <span className="text-[10px] text-slate-500">Risk-Management Approved</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immediate compassionate acknowledgment reassuring the patient that their grievance is under prioritized clinical review without premature admission of liability:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              "{triage.triageProtocols.recommendedHoldingStatement}"
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Copy to EMR Portal messaging or letter dispatch</span>
            <button
              onClick={copyHoldingStatement}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              {copiedHolding ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
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

        {/* Evidence Preservation & Risk Mitigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Evidence Preservation & Risk Protocols</span>
            </span>
            <span className="text-[10px] text-slate-500">Audit Trail Lock</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-300 font-semibold block mb-1">
                Mandatory Records to Preserve:
              </span>
              <ul className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {triage.triageProtocols.recordsToPreserve.map((rec, i) => (
                  <li key={i} className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-slate-300 font-semibold block mb-1">
                Immediate Clinical Risk Mitigations:
              </span>
              <ul className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {triage.triageProtocols.immediateRiskMitigations.map((mit, i) => (
                  <li key={i} className="flex items-center space-x-2 text-slate-300">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{mit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/50 text-[11px] text-blue-200">
              <strong>HIPAA & Quality Governance:</strong> {triage.triageProtocols.phiProtectionNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
