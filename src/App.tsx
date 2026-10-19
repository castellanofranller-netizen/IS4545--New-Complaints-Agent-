import React, { useState } from 'react';
import { Header } from './components/Header';
import { TriageForm } from './components/TriageForm';
import { TriageReportView } from './components/TriageReportView';
import { TriageQueue } from './components/TriageQueue';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PolicyGuideModal } from './components/PolicyGuideModal';
import { SAMPLE_COMPLAINTS } from './data/sampleComplaints';
import { PatientComplaint, SourceChannel, TriageResult } from './types/triage';
import { CanvasDashboard } from './components/CanvasDashboard';
import { 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Activity, 
  ArrowLeft,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [complaints, setComplaints] = useState<PatientComplaint[]>(SAMPLE_COMPLAINTS);
  const [activeComplaint, setActiveComplaint] = useState<PatientComplaint | null>(SAMPLE_COMPLAINTS[0]);
  const [activeTriageResult, setActiveTriageResult] = useState<TriageResult | null>(
    SAMPLE_COMPLAINTS[0].triageResult || null
  );
  const [activeTab, setActiveTab] = useState<'dashboard' | 'console' | 'queue' | 'analytics'>('dashboard');
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('Gemini 3.8 Flash');

  // Counts
  const criticalCount = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 4 – Critical'
  ).length;

  const handleRunTriage = async (formData: {
    complaintText: string;
    department: string;
    channel: SourceChannel;
    encounterType: string;
    patientId: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const triageRes: TriageResult = data.triage;
      const model = data.modelUsed || 'Gemini 3.8 Flash';
      setModelUsed(model);
      setActiveTriageResult(triageRes);

      // Create new complaint in state
      const now = new Date();
      const newComplaint: PatientComplaint = {
        id: `CMP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        complaintNumber: `GRV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        patientInitialsOrId: formData.patientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        channel: formData.channel,
        department: formData.department,
        dateReceived: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
        status: triageRes.severityLevel === 'LEVEL 4 – Critical' ? 'Escalated' : 'Triaged',
        text: formData.complaintText,
        triageResult: triageRes,
        triagedAt: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      };

      setComplaints((prev) => [newComplaint, ...prev]);
      setActiveComplaint(newComplaint);
    } catch (err: any) {
      console.error('Error running triage:', err);
      setErrorMessage(err.message || 'Failed to triage complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectComplaint = (complaint: PatientComplaint) => {
    setActiveComplaint(complaint);
    if (complaint.triageResult) {
      setActiveTriageResult(complaint.triageResult);
    }
    setActiveTab('console');
  };

  const handleUpdateComplaintStatus = (
    newStatus: PatientComplaint['status'],
    overrideNotes?: string
  ) => {
    if (!activeComplaint) return;

    const updated = {
      ...activeComplaint,
      status: newStatus,
      humanOverrideNotes: overrideNotes || activeComplaint.humanOverrideNotes,
    };

    setActiveComplaint(updated);
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleNewIntake = () => {
    setActiveComplaint(null);
    setActiveTriageResult(null);
    setActiveTab('console');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Header bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPolicyModal={() => setIsPolicyModalOpen(true)}
        criticalCount={criticalCount}
        totalCount={complaints.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-300 hover:text-white underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 0: Step 7 Interactive Canvas Dashboard */}
        {activeTab === 'dashboard' && (
          <CanvasDashboard
            complaints={complaints}
            activeComplaint={activeComplaint}
            onSelectComplaint={(c) => {
              setActiveComplaint(c);
              if (c.triageResult) setActiveTriageResult(c.triageResult);
            }}
            onNewIntake={handleNewIntake}
            onUpdateStatus={handleUpdateComplaintStatus}
          />
        )}

        {/* Tab 1: Live Triage Console */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            {/* Intake Form */}
            <TriageForm
              onTriage={handleRunTriage}
              isLoading={isLoading}
              selectedSampleId={activeComplaint?.id}
            />

            {/* If Triage Result exists, render TriageReportView */}
            {activeTriageResult && (
              <div className="pt-2">
                <TriageReportView
                  triage={activeTriageResult}
                  complaint={activeComplaint || undefined}
                  modelUsed={modelUsed}
                  onUpdateComplaintStatus={handleUpdateComplaintStatus}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Grievance Queue */}
        {activeTab === 'queue' && (
          <TriageQueue
            complaints={complaints}
            selectedComplaintId={activeComplaint?.id}
            onSelectComplaint={handleSelectComplaint}
            onNewComplaint={handleNewIntake}
          />
        )}

        {/* Tab 3: Risk Intelligence & Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard complaints={complaints} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>TriageCare Clinical Governance Assistant • Production Safety Standard</span>
          </div>
          <p className="text-[11px] text-slate-600">
            For Institutional Triage & Risk Prioritization Only — Does Not Constitute Final Clinical Dispute Resolution.
          </p>
        </div>
      </footer>

      {/* Governance & Rubric Modal */}
      <PolicyGuideModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />
    </div>
  );
}
