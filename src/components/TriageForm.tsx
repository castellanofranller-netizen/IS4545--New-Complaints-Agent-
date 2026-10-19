import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  FileText, 
  Building2, 
  Radio, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { SourceChannel } from '../types/triage';
import { SAMPLE_COMPLAINTS } from '../data/sampleComplaints';

interface TriageFormProps {
  onTriage: (formData: {
    complaintText: string;
    department: string;
    channel: SourceChannel;
    encounterType: string;
    patientId: string;
  }) => Promise<void>;
  isLoading: boolean;
  selectedSampleId?: string;
}

const CHANNELS: SourceChannel[] = [
  'Patient Portal Message',
  'Formal Grievance Form',
  'Telephone Transcription',
  'CAHPS / Patient Survey',
  'Written Letter / Email',
  'Online Review / Public Feedback',
  'ER Discharge Feedback',
];

const DEPARTMENTS = [
  'Emergency Medicine',
  'Inpatient Surgical Ward / Pharmacy',
  'Cardiology Ambulatory Clinic',
  'Health Information Management / IT',
  'Outpatient Specialty Clinic',
  'Revenue Cycle / Patient Financial Services',
  'Oncology & Infusion Center',
  'Women\'s Health / OBGYN',
  'Pediatrics & Adolescent Care',
  'Neurology & Spine Care',
  'General Clinical / Unassigned',
];

const ENCOUNTER_TYPES = [
  'Emergency Department Visit',
  'Inpatient Acute Admission',
  'Outpatient Specialty Visit',
  'Ambulatory Surgery',
  'Telehealth / Virtual Visit',
  'Ancillary / Laboratory / Imaging',
  'Administrative / Billing Only',
];

export const TriageForm: React.FC<TriageFormProps> = ({
  onTriage,
  isLoading,
  selectedSampleId,
}) => {
  const [complaintText, setComplaintText] = useState('');
  const [channel, setChannel] = useState<SourceChannel>('Patient Portal Message');
  const [department, setDepartment] = useState('Emergency Medicine');
  const [encounterType, setEncounterType] = useState('Emergency Department Visit');
  const [patientId, setPatientId] = useState('PT-1049');

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_COMPLAINTS.find((s) => s.id === sampleId);
    if (sample) {
      setComplaintText(sample.text);
      setChannel(sample.channel);
      setDepartment(sample.department);
      setPatientId(sample.patientInitialsOrId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || isLoading) return;

    onTriage({
      complaintText,
      department,
      channel,
      encounterType,
      patientId,
    });
  };

  const handleReset = () => {
    setComplaintText('');
    setPatientId('PT-' + Math.floor(1000 + Math.random() * 9000));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Clinical Grievance Intake Console
            </h2>
            <p className="text-xs text-slate-400">
              Submit patient feedback, portal messages, or survey comments for automated risk triage
            </p>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Load Benchmark:</span>
          <select
            onChange={(e) => handleSelectSample(e.target.value)}
            defaultValue=""
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none max-w-[210px] truncate"
          >
            <option value="" disabled>
              Select clinical case...
            </option>
            <option value="CMP-2026-8812">L4: ED Chest Pain Delayed (STEMI)</option>
            <option value="CMP-2026-8804">L4: HIPAA Portal Leak (HIV/Psych)</option>
            <option value="CMP-2026-8790">L3: Anticoagulant 4x Dose Near-Miss</option>
            <option value="CMP-2026-8775">L3: Deaf Patient Denied ASL Interpreter</option>
            <option value="CMP-2026-8742">L2: Surprise Out-of-Network Bill</option>
            <option value="CMP-2026-8711">L1: Broken Parking Validator / Tea</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Context metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center space-x-1">
              <Radio className="w-3 h-3 text-blue-400" />
              <span>Intake Channel</span>
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as SourceChannel)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-cyan-400" />
              <span>Clinical Department</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center space-x-1">
              <Stethoscope className="w-3 h-3 text-indigo-400" />
              <span>Encounter Type</span>
            </label>
            <select
              value={encounterType}
              onChange={(e) => setEncounterType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {ENCOUNTER_TYPES.map((enc) => (
                <option key={enc} value={enc}>
                  {enc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center space-x-1">
              <User className="w-3 h-3 text-purple-400" />
              <span>Patient Ref / Identifier</span>
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. PT-8912"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Complaint Text Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="text-slate-300 font-medium flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Patient Complaint / Grievance Statement:</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {complaintText.length} characters
            </span>
          </div>

          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            rows={5}
            placeholder="Paste verbatim patient complaint, portal grievance message, telephone note, or post-discharge feedback here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors leading-relaxed"
            required
          />
        </div>

        {/* Buttons & Status row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Vector Analysis: Category • Severity • 8 Risk Dimensions • Escalation Routing</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !complaintText.trim()}
              className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                isLoading || !complaintText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-900/30 active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Triaging with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Execute Clinical Triage</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
