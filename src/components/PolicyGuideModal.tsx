import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Share2, 
  Clock, 
  UserCheck,
  FileText
} from 'lucide-react';

interface PolicyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyGuideModal: React.FC<PolicyGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'categories' | 'severities' | 'risks' | 'routing' | 'governance'>('categories');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Healthcare Complaint Triage Governance Framework
              </h2>
              <p className="text-xs text-slate-400">
                Regulatory Standards, Severity Rubrics, Risk Vectors & Escalation Pathways
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 space-x-2 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveSection('categories')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSection === 'categories'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Step 1: 10 Categories
          </button>
          <button
            onClick={() => setActiveSection('severities')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSection === 'severities'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Step 2: 4 Severity Levels
          </button>
          <button
            onClick={() => setActiveSection('risks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSection === 'risks'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Step 5: 8 Risk Vectors
          </button>
          <button
            onClick={() => setActiveSection('routing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSection === 'routing'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Step 6: 10 Escalation Routes
          </button>
          <button
            onClick={() => setActiveSection('governance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSection === 'governance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Human Oversight Mandate
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeSection === 'categories' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-900/50 p-3.5 rounded-xl text-xs text-blue-200 flex items-start space-x-2.5">
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong>STEP 1 Protocol:</strong> Classify every submission into exactly <strong>one primary category</strong>. If multiple operational facets are entangled, assign the primary based on highest clinical or regulatory weight, and catalog secondary categories.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Communication', desc: 'Breakdowns in bedside dialogue, discharge instructions, informed consent explanations, or lack of auxiliary language services.' },
                  { name: 'Scheduling', desc: 'Appointment delays, canceled bookings, clinic availability bottlenecks, or specialist referral coordination failures.' },
                  { name: 'Wait Time', desc: 'Excessive ambulatory delays, emergency room lobby wait times, inpatient bed assignment holding delays.' },
                  { name: 'Technology / Patient Portal', desc: 'MyChart or electronic portal outages, password lockout, telemedicine video connection failure, telehealth app errors.' },
                  { name: 'Billing', desc: 'Disputed charges, unexpected out-of-network balance bills, insurance pre-authorization denials, billing phone service issues.' },
                  { name: 'Clinical Care', desc: 'Diagnosis disputes, bedside nursing procedure execution, surgical complications, pain management dissatisfaction, clinical plan execution.' },
                  { name: 'Patient Safety', desc: 'Adverse medication events, inpatient falls, delayed emergency triage, diagnostic omissions, equipment failure leading to peril.' },
                  { name: 'Privacy or Security', desc: 'HIPAA violations, patient portal data cross-exposure, misplaced paper records, verbal disclosures in public waiting areas.' },
                  { name: 'Staff Conduct', desc: 'Disrespectful demeanor, dismissive remarks, aggressive interaction, bedside discourtesy, lack of empathy.' },
                  { name: 'Other', desc: 'Facility amenities, parking machines, cafeteria food quality, wayfinding signage, environmental temperature.' },
                ].map((cat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
                    <span className="font-semibold text-white text-xs mb-1 text-cyan-300">{cat.name}</span>
                    <p className="text-slate-400 leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'severities' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-900/50 p-3.5 rounded-xl text-xs text-amber-200 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>STEP 2 Protocol:</strong> Severity dictates institutional SLA and the urgency of mandatory human risk intervention.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-900 text-red-100 border border-red-700">
                      LEVEL 4 – Critical
                    </span>
                    <span className="text-xs text-red-400 font-semibold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> SLA: Immediate (&lt; 2 Hours)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    <strong>Criteria:</strong> Immediate patient safety risk, potential legal exposure, serious privacy violation (HIPAA breach), acute discrimination allegation, sentinel event.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Examples: Code STEMI delayed in waiting room resulting in cardiac necrosis; patient portal displaying third-party psychiatric records; active attorney retention; severe medication overdose.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-900 text-orange-100 border border-orange-700">
                      LEVEL 3 – High
                    </span>
                    <span className="text-xs text-orange-400 font-semibold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> SLA: Within 24 Hours
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    <strong>Criteria:</strong> Potential patient harm (near-misses), medication-related concern, serious accessibility issue (ADA/Section 504), escalated formal grievance.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Examples: Supratherapeutic discharge anticoagulant prescription caught by family; deaf patient denied requested ASL interpreter; clinical treatment delay exceeding 48 hours without update.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-900 text-amber-100 border border-amber-700">
                      LEVEL 2 – Moderate
                    </span>
                    <span className="text-xs text-amber-400 font-semibold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> SLA: Within 72 Hours
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    <strong>Criteria:</strong> Repeated service failures, significant frustration, communication breakdown, persistent billing dispute.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Examples: Surprise out-of-network assistant surgeon bill after pre-authorization; multiple canceled imaging appointments; physician dismissive bedside manner.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-900 text-emerald-100 border border-emerald-700">
                      LEVEL 1 – Low
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> SLA: Within 5 Business Days
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    <strong>Criteria:</strong> Minor inconvenience, routine dissatisfaction, general suggestion.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Examples: Malfunctioning parking validator machine; suggestion for decaf herbal tea in waiting lobby; minor temperature preference in exam room.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'risks' && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-900/50 p-3.5 rounded-xl text-xs text-purple-200">
                <strong>STEP 5 Protocol:</strong> Evaluate 8 distinct institutional risk dimensions on every case. Explain why each flagged risk requires specialized handling.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Patient Safety Risk', focus: 'Physical injury, sentinel events, emergency delays, falls, wrong-site or wrong-patient interventions.' },
                  { name: 'Clinical Risk', focus: 'Diagnostic error, therapeutic delay, medication reconciliation failure, contraindication oversight.' },
                  { name: 'Compliance Risk', focus: 'CMS Conditions of Participation (42 CFR § 482.13), EMTALA, HIPAA, No Surprises Act, Joint Commission.' },
                  { name: 'Privacy Risk', focus: 'Unauthorized disclosure of PHI, portal cross-linking errors, paper chart disclosures, breach reporting triggers.' },
                  { name: 'Accessibility Risk', focus: 'ADA Title III, Section 504 / 1557 auxiliary aids, physical wheelchair barriers, ASL / interpreter failures.' },
                  { name: 'Equity Risk', focus: 'Allegations of racial, ethnic, gender, socioeconomic, or linguistic discrimination; disparate treatment.' },
                  { name: 'Reputational Risk', focus: 'Public social media virality, news media exposure, online reviews, regulatory complaints, litigation.' },
                  { name: 'Operational Risk', focus: 'Staffing deficits, throughput bottlenecks, IT portal downtime, interdepartmental handoff failures.' },
                ].map((risk, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="font-semibold text-purple-300 block mb-1">{risk.name}</span>
                    <p className="text-slate-400 leading-relaxed">{risk.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'routing' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-3.5 rounded-xl text-xs text-emerald-200">
                <strong>STEP 6 Protocol:</strong> Direct the grievance to the single most appropriate primary oversight entity, with clear justification grounded in the identified risks.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Patient Experience Team', role: 'General grievances, customer service recovery, amenities, CAHPS satisfaction trends.' },
                  { name: 'Nursing Leadership', role: 'Inpatient bedside nursing care, medication administration by nurses, nursing supervisor reviews.' },
                  { name: 'Physician Leadership', role: 'Attending physician conduct, clinical diagnosis, surgical decisions, peer review.' },
                  { name: 'Quality Improvement Team', role: 'Clinical pathway defects, infection control, systemic process breakdowns.' },
                  { name: 'Compliance Office', role: 'HIPAA privacy breaches, regulatory audits, billing fraud allegations, civil rights.' },
                  { name: 'Information Technology', role: 'EHR portal bugs, software malfunctions, network drops affecting telemedicine.' },
                  { name: 'Revenue Cycle / Billing', role: 'Itemized charges, insurance disputes, No Surprises Act claims, financial counselor reviews.' },
                  { name: 'Accessibility Coordinator', role: 'ADA accommodation, ASL medical interpretation, physical facility accessibility.' },
                  { name: 'Risk Management', role: 'Sentinel events, patient injuries, medication errors, malpractice/attorney notifications.' },
                  { name: 'Executive Review', role: 'Systemic crises, major media exposure, board-level inquiries, high-liability events.' },
                ].map((route, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start space-x-2.5">
                    <Share2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-300 block mb-0.5">{route.name}</span>
                      <p className="text-slate-400 leading-relaxed">{route.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'governance' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/80 space-y-3">
                <div className="flex items-center space-x-2 text-blue-300 font-bold text-sm">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span>The Non-Resolution Rule & Human Oversight Mandate</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Strict Operational Boundary:</strong> The TriageCare AI Assistant is explicitly engineered <em>never</em> to independently resolve, close, or settle patient grievances. Its sole remit is objective intake, categorization, severity assessment, risk detection, and escalation routing.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Key Human-in-the-Loop Safeguards:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>Mandatory human sign-off on all Level 3 (High) and Level 4 (Critical) incidents prior to closure.</li>
                    <li>Automatic EMR audit record preservation notices dispatched upon safety risk detection.</li>
                    <li>Clinical Peer Review and Legal Privilege protection headers applied automatically.</li>
                    <li>Empathetic holding statements must omit admissions of institutional liability while affirming prompt, prioritized investigation.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Complies with CMS 42 CFR § 482.13 and Joint Commission Standard RI.01.07.01</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            Close Rubric
          </button>
        </div>
      </div>
    </div>
  );
};
