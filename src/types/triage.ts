export type ComplaintCategory =
  | 'Communication'
  | 'Scheduling'
  | 'Wait Time'
  | 'Technology / Patient Portal'
  | 'Billing'
  | 'Clinical Care'
  | 'Patient Safety'
  | 'Privacy or Security'
  | 'Staff Conduct'
  | 'Other';

export type SeverityLevel =
  | 'LEVEL 1 – Low'
  | 'LEVEL 2 – Moderate'
  | 'LEVEL 3 – High'
  | 'LEVEL 4 – Critical';

export type RiskType =
  | 'Patient Safety Risk'
  | 'Clinical Risk'
  | 'Compliance Risk'
  | 'Privacy Risk'
  | 'Accessibility Risk'
  | 'Equity Risk'
  | 'Reputational Risk'
  | 'Operational Risk';

export type EscalationRoute =
  | 'Patient Experience Team'
  | 'Nursing Leadership'
  | 'Physician Leadership'
  | 'Quality Improvement Team'
  | 'Compliance Office'
  | 'Information Technology'
  | 'Revenue Cycle / Billing'
  | 'Accessibility Coordinator'
  | 'Risk Management'
  | 'Executive Review';

export type SourceChannel =
  | 'Patient Portal Message'
  | 'CAHPS / Patient Survey'
  | 'Formal Grievance Form'
  | 'Written Letter / Email'
  | 'Telephone Transcription'
  | 'Online Review / Public Feedback'
  | 'ER Discharge Feedback';

export interface RiskItem {
  riskType: RiskType;
  flagged: boolean;
  explanation: string;
}

export interface TriageResult {
  // Step 1: Complaint Category
  primaryCategory: ComplaintCategory;
  secondaryCategories: ComplaintCategory[];
  categoryReasoning: string;

  // Step 2: Severity Assessment
  severityLevel: SeverityLevel;
  severityReasoning: string;

  // Incident Overview: What Happened
  whatHappened: {
    summary: string;
    chronology: string[];
    involvedDepartments: string[];
    keyPatientStatements: string[];
  };

  // Step 5: Risk Detection
  risks: RiskItem[];

  // Step 6: Escalation Recommendation
  escalationRoute: EscalationRoute;
  secondaryRoute?: string;
  escalationJustification: string;

  // Response SLA / Target Timeframe
  recommendedSLA: {
    timeframe: string;
    hours: number;
    urgencyLabel: 'Immediate' | 'Urgent' | 'Standard' | 'Routine';
    rationale: string;
  };

  // Human Intervention
  humanIntervention: {
    required: boolean;
    urgency: 'Immediate (<2 hours)' | 'Same-Day (<12 hours)' | 'Routine (<72 hours)' | 'Standard Batch Review';
    targetRoles: string[];
    oversightReasoning: string;
  };

  // Actionable Protocols
  triageProtocols: {
    recommendedHoldingStatement: string;
    recordsToPreserve: string[];
    immediateRiskMitigations: string[];
    phiProtectionNote: string;
  };
}

export interface PatientComplaint {
  id: string;
  complaintNumber: string;
  patientInitialsOrId: string;
  channel: SourceChannel;
  department: string;
  dateReceived: string;
  text: string;
  status: 'New' | 'Triaged' | 'Under Human Review' | 'Escalated' | 'Dispatched';
  triageResult?: TriageResult;
  humanOverrideNotes?: string;
  triagedAt?: string;
}
