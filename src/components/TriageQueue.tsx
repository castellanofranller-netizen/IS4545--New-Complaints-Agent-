import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  FileText, 
  Building, 
  User, 
  Calendar,
  Share2,
  Plus
} from 'lucide-react';
import { ComplaintCategory, PatientComplaint, SeverityLevel } from '../types/triage';

interface TriageQueueProps {
  complaints: PatientComplaint[];
  selectedComplaintId?: string;
  onSelectComplaint: (complaint: PatientComplaint) => void;
  onNewComplaint: () => void;
}

export const TriageQueue: React.FC<TriageQueueProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onNewComplaint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredComplaints = complaints.filter((item) => {
    // Search text or ID
    const matchesSearch =
      searchTerm === '' ||
      item.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientInitialsOrId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase());

    // Severity filter
    const matchesSeverity =
      severityFilter === 'ALL' ||
      (severityFilter === 'CRITICAL' && item.triageResult?.severityLevel === 'LEVEL 4 – Critical') ||
      (severityFilter === 'HIGH' && item.triageResult?.severityLevel === 'LEVEL 3 – High') ||
      (severityFilter === 'MODERATE' && item.triageResult?.severityLevel === 'LEVEL 2 – Moderate') ||
      (severityFilter === 'LOW' && item.triageResult?.severityLevel === 'LEVEL 1 – Low');

    // Category filter
    const matchesCategory =
      categoryFilter === 'ALL' || item.triageResult?.primaryCategory === categoryFilter;

    // Status filter
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  const getSeverityBadge = (level?: SeverityLevel) => {
    switch (level) {
      case 'LEVEL 4 – Critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center space-x-1 animate-pulse">
            <AlertOctagon className="w-3 h-3 text-red-400" />
            <span>CRITICAL</span>
          </span>
        );
      case 'LEVEL 3 – High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span>HIGH</span>
          </span>
        );
      case 'LEVEL 2 – Moderate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            MODERATE
          </span>
        );
      case 'LEVEL 1 – Low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
            LOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
            PENDING
          </span>
        );
    }
  };

  const getStatusBadge = (status: PatientComplaint['status']) => {
    switch (status) {
      case 'Escalated':
        return <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">Escalated</span>;
      case 'Under Human Review':
        return <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">Human Review</span>;
      case 'Dispatched':
        return <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">Dispatched</span>;
      case 'Triaged':
        return <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Triaged</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">New</span>;
    }
  };

  const criticalCount = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 4 – Critical'
  ).length;

  const highCount = complaints.filter(
    (c) => c.triageResult?.severityLevel === 'LEVEL 3 – High'
  ).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Hospital Grievance & Complaint Queue
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {complaints.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Active patient feedback across all clinical services and intake streams
          </p>
        </div>

        <button
          onClick={onNewComplaint}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center space-x-1.5 shadow shadow-blue-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Grievance Intake</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, MRN, unit..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Level 4 – Critical ({criticalCount})</option>
            <option value="HIGH">Level 3 – High ({highCount})</option>
            <option value="MODERATE">Level 2 – Moderate</option>
            <option value="LOW">Level 1 – Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Patient Safety">Patient Safety</option>
            <option value="Clinical Care">Clinical Care</option>
            <option value="Privacy or Security">Privacy or Security</option>
            <option value="Billing">Billing</option>
            <option value="Communication">Communication</option>
            <option value="Staff Conduct">Staff Conduct</option>
            <option value="Wait Time">Wait Time</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Technology / Patient Portal">Technology / Portal</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Triage Statuses</option>
            <option value="Escalated">Escalated</option>
            <option value="Under Human Review">Under Human Review</option>
            <option value="Triaged">Triaged</option>
            <option value="Dispatched">Dispatched</option>
            <option value="New">New / Pending</option>
          </select>
        </div>
      </div>

      {/* Complaints List / Table */}
      <div className="space-y-2.5">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No complaints found matching the selected filter criteria.
          </div>
        ) : (
          filteredComplaints.map((item) => {
            const isSelected = item.id === selectedComplaintId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">
                      {item.complaintNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300 font-medium">
                      {item.patientInitialsOrId}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-cyan-400 font-medium">
                      {item.department}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(item.status)}
                    {getSeverityBadge(item.triageResult?.severityLevel)}
                  </div>
                </div>

                <p className="text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  "{item.text}"
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/70 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>{item.channel}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{item.dateReceived}</span>
                    </span>
                  </div>

                  {item.triageResult && (
                    <div className="flex items-center space-x-2 text-cyan-300 font-medium">
                      <Share2 className="w-3 h-3 text-emerald-400" />
                      <span>Route: {item.triageResult.escalationRoute}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
