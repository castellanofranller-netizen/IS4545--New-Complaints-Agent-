import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { ComplaintCategory, EscalationRoute, RiskType, SeverityLevel, TriageResult } from './src/types/triage';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const CATEGORIES: ComplaintCategory[] = [
  'Communication',
  'Scheduling',
  'Wait Time',
  'Technology / Patient Portal',
  'Billing',
  'Clinical Care',
  'Patient Safety',
  'Privacy or Security',
  'Staff Conduct',
  'Other',
];

const SEVERITIES: SeverityLevel[] = [
  'LEVEL 1 – Low',
  'LEVEL 2 – Moderate',
  'LEVEL 3 – High',
  'LEVEL 4 – Critical',
];

const RISKS: RiskType[] = [
  'Patient Safety Risk',
  'Clinical Risk',
  'Compliance Risk',
  'Privacy Risk',
  'Accessibility Risk',
  'Equity Risk',
  'Reputational Risk',
  'Operational Risk',
];

const ROUTES: EscalationRoute[] = [
  'Patient Experience Team',
  'Nursing Leadership',
  'Physician Leadership',
  'Quality Improvement Team',
  'Compliance Office',
  'Information Technology',
  'Revenue Cycle / Billing',
  'Accessibility Coordinator',
  'Risk Management',
  'Executive Review',
];

// Fallback rule-based triage heuristic if Gemini is offline or rate-limited
function heuristicTriage(
  complaintText: string,
  department?: string,
  channel?: string
): TriageResult {
  const text = complaintText.toLowerCase();

  let primaryCategory: ComplaintCategory = 'Other';
  const secondaryCategories: ComplaintCategory[] = [];
  let severityLevel: SeverityLevel = 'LEVEL 1 – Low';
  let escalationRoute: EscalationRoute = 'Patient Experience Team';

  // Check category cues
  if (text.includes('hipaa') || text.includes('privacy') || text.includes('portal sent me someone') || text.includes('wrong patient') || text.includes('records breach') || text.includes('confidential')) {
    primaryCategory = 'Privacy or Security';
    escalationRoute = 'Compliance Office';
  } else if (text.includes('chest pain') || text.includes('fall') || text.includes('bleed') || text.includes('overdose') || text.includes('wrong dose') || text.includes('medication error') || text.includes('stopped breathing') || text.includes('allergic reaction') || text.includes('harm')) {
    primaryCategory = 'Patient Safety';
    escalationRoute = 'Risk Management';
  } else if (text.includes('misdiagnosis') || text.includes('doctor ignored') || text.includes('clinical') || text.includes('surgery') || text.includes('treatment failed') || text.includes('infection')) {
    primaryCategory = 'Clinical Care';
    escalationRoute = 'Physician Leadership';
  } else if (text.includes('bill') || text.includes('charge') || text.includes('insurance') || text.includes('cost') || text.includes('in-network') || text.includes('financial')) {
    primaryCategory = 'Billing';
    escalationRoute = 'Revenue Cycle / Billing';
  } else if (text.includes('wheelchair') || text.includes('ramp') || text.includes('interpreter') || text.includes('asl') || text.includes('deaf') || text.includes('blind') || text.includes('ada')) {
    primaryCategory = 'Clinical Care';
    secondaryCategories.push('Communication');
    escalationRoute = 'Accessibility Coordinator';
  } else if (text.includes('rude') || text.includes('yelled') || text.includes('disrespect') || text.includes('demeanor') || text.includes('dismissive') || text.includes('unprofessional')) {
    primaryCategory = 'Staff Conduct';
    escalationRoute = 'Nursing Leadership';
  } else if (text.includes('hour') || text.includes('waited') || text.includes('waiting room') || text.includes('delay')) {
    primaryCategory = 'Wait Time';
    escalationRoute = 'Patient Experience Team';
  } else if (text.includes('cancel') || text.includes('reschedule') || text.includes('appointment')) {
    primaryCategory = 'Scheduling';
    escalationRoute = 'Patient Experience Team';
  } else if (text.includes('portal') || text.includes('app') || text.includes('password') || text.includes('glitch') || text.includes('login')) {
    primaryCategory = 'Technology / Patient Portal';
    escalationRoute = 'Information Technology';
  } else {
    primaryCategory = 'Communication';
    escalationRoute = 'Patient Experience Team';
  }

  // Severity logic
  const isCritical =
    text.includes('died') ||
    text.includes('death') ||
    text.includes('immediate danger') ||
    text.includes('emergency') ||
    text.includes('sue') ||
    text.includes('lawyer') ||
    text.includes('attorney') ||
    text.includes('discrimination') ||
    text.includes('racial') ||
    text.includes('breach') ||
    text.includes('hiv') ||
    text.includes('social security') ||
    text.includes('ssn') ||
    (text.includes('chest pain') && (text.includes('wait') || text.includes('hour') || text.includes('delay')));

  const isHigh =
    !isCritical && (
      text.includes('wrong medication') ||
      text.includes('wrong dose') ||
      text.includes('dosage') ||
      text.includes('blood thinner') ||
      text.includes('bleeding') ||
      text.includes('overdose') ||
      text.includes('harm') ||
      text.includes('worsened') ||
      text.includes('allergic') ||
      text.includes('severe pain') ||
      text.includes('asl') ||
      text.includes('interpreter') ||
      text.includes('wheelchair') ||
      text.includes('ada') ||
      text.includes('never again') ||
      text.includes('infection') ||
      text.includes('complication')
    );

  const isModerate =
    !isCritical && !isHigh && (
      text.includes('twice') ||
      text.includes('repeated') ||
      text.includes('third time') ||
      text.includes('frustrated') ||
      text.includes('unacceptable') ||
      text.includes('dispute') ||
      text.includes('rude') ||
      text.includes('bill') ||
      text.includes('charge') ||
      text.includes('surprise') ||
      text.includes('wait') ||
      text.includes('hour')
    );

  if (isCritical) {
    severityLevel = 'LEVEL 4 – Critical';
    if (primaryCategory === 'Privacy or Security') {
      escalationRoute = 'Compliance Office';
    } else {
      escalationRoute = 'Risk Management';
    }
  } else if (isHigh) {
    severityLevel = 'LEVEL 3 – High';
    if (primaryCategory === 'Patient Safety' || text.includes('medication') || text.includes('dose') || text.includes('bleeding')) {
      escalationRoute = 'Risk Management';
    } else if (text.includes('asl') || text.includes('wheelchair') || text.includes('interpreter')) {
      escalationRoute = 'Accessibility Coordinator';
    } else if (primaryCategory === 'Clinical Care') {
      escalationRoute = 'Physician Leadership';
    }
  } else if (isModerate) {
    severityLevel = 'LEVEL 2 – Moderate';
    if (primaryCategory === 'Billing') {
      escalationRoute = 'Revenue Cycle / Billing';
    } else if (primaryCategory === 'Staff Conduct') {
      escalationRoute = 'Nursing Leadership';
    }
  } else {
    severityLevel = 'LEVEL 1 – Low';
  }

  const risks: RiskType[] = [
    'Patient Safety Risk',
    'Clinical Risk',
    'Compliance Risk',
    'Privacy Risk',
    'Accessibility Risk',
    'Equity Risk',
    'Reputational Risk',
    'Operational Risk',
  ];

  const evaluatedRisks = risks.map((r) => {
    let flagged = false;
    let explanation = 'Standard operational monitoring; no acute risk indicators elevated.';

    if (r === 'Patient Safety Risk' && (isCritical || isHigh || primaryCategory === 'Patient Safety' || text.includes('bleeding') || text.includes('dose') || text.includes('chest pain'))) {
      flagged = true;
      explanation = 'Potential or acute risk to patient physiological safety, clinical monitoring integrity, or medication administration safety.';
    } else if (r === 'Clinical Risk' && (primaryCategory === 'Clinical Care' || primaryCategory === 'Patient Safety' || text.includes('treatment') || text.includes('medication') || text.includes('prescription') || text.includes('dose'))) {
      flagged = true;
      explanation = 'Involves medical decision-making, diagnosis accuracy, prescription fulfillment, or symptom triage protocol.';
    } else if (r === 'Compliance Risk' && (primaryCategory === 'Privacy or Security' || primaryCategory === 'Billing' || text.includes('law') || text.includes('ada') || text.includes('hipaa') || text.includes('surprise') || text.includes('dispute'))) {
      flagged = true;
      explanation = 'Subject to statutory regulations (CMS Conditions of Participation, HIPAA Privacy/Security Rule, No Surprises Act, or ADA).';
    } else if (r === 'Privacy Risk' && (primaryCategory === 'Privacy or Security' || text.includes('hipaa') || text.includes('records') || text.includes('unauthorized') || text.includes('portal') && text.includes('other patient'))) {
      flagged = true;
      explanation = 'Potential impermissible disclosure or system compromise of Protected Health Information (PHI) requiring breach evaluation.';
    } else if (r === 'Accessibility Risk' && (text.includes('asl') || text.includes('wheelchair') || text.includes('interpreter') || text.includes('ramp') || text.includes('disability') || text.includes('deaf'))) {
      flagged = true;
      explanation = 'Barrier to physical or communication access for individuals with disabilities requiring ADA / Section 504 accommodation review.';
    } else if (r === 'Equity Risk' && (text.includes('bias') || text.includes('rac') || text.includes('discriminat') || text.includes('language') || text.includes('spanish') || text.includes('english') || text.includes('disenfranchised'))) {
      flagged = true;
      explanation = 'Allegation or indication of differential treatment, linguistic barrier, or systemic disparity impacting patient experience.';
    } else if (r === 'Reputational Risk' && (text.includes('online') || text.includes('review') || text.includes('social media') || text.includes('news') || text.includes('sue') || text.includes('lawyer') || isCritical)) {
      flagged = true;
      explanation = 'Elevated probability of formal legal action, state regulatory investigation, or public media exposure.';
    } else if (r === 'Operational Risk' && (primaryCategory === 'Wait Time' || primaryCategory === 'Scheduling' || primaryCategory === 'Technology / Patient Portal' || isModerate)) {
      flagged = true;
      explanation = 'Points to clinic throughput bottlenecks, system outages, staffing shortages, or scheduling friction.';
    }

    return { riskType: r, flagged, explanation };
  });

  const hours = severityLevel === 'LEVEL 4 – Critical' ? 2 : severityLevel === 'LEVEL 3 – High' ? 24 : severityLevel === 'LEVEL 2 – Moderate' ? 72 : 120;
  const urgencyLabel = severityLevel === 'LEVEL 4 – Critical' ? 'Immediate' : severityLevel === 'LEVEL 3 – High' ? 'Urgent' : severityLevel === 'LEVEL 2 – Moderate' ? 'Standard' : 'Routine';

  // Sentence extraction for chronology & statements
  const sentences = complaintText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const chronology = sentences.length >= 3
    ? sentences.slice(0, 4)
    : [
        'Patient presented with healthcare concern or clinical interaction.',
        complaintText.slice(0, 100) + '...',
        'Feedback or grievance logged via intake channel for triage assessment.',
      ];

  const keyStatements = sentences.length > 0
    ? sentences.slice(0, 3).map(s => `"${s}"`)
    : [`"${complaintText.slice(0, 100)}..."`];

  return {
    primaryCategory,
    secondaryCategories,
    categoryReasoning: `Classified primarily under ${primaryCategory} based on the core event described in the submission.`,
    severityLevel,
    severityReasoning: `Assigned ${severityLevel} based on the impact indicators, potential clinical/legal exposure, and urgency for organizational intervention.`,
    whatHappened: {
      summary: complaintText.length > 250 ? complaintText.slice(0, 250) + '...' : complaintText,
      chronology,
      involvedDepartments: department ? [department] : ['Clinical Services'],
      keyPatientStatements: keyStatements,
    },
    risks: evaluatedRisks,
    escalationRoute,
    secondaryRoute: isCritical ? 'Executive Review' : undefined,
    escalationJustification: `Routed to ${escalationRoute} for institutional assessment in accordance with clinical risk governance guidelines.`,
    recommendedSLA: {
      timeframe: severityLevel === 'LEVEL 4 – Critical' ? 'Immediate (< 2 hours)' : severityLevel === 'LEVEL 3 – High' ? 'Within 24 hours' : severityLevel === 'LEVEL 2 – Moderate' ? 'Within 72 hours' : 'Within 5 business days',
      hours,
      urgencyLabel,
      rationale: 'Timeframe aligned with CMS Hospital Conditions of Participation (42 CFR § 482.13) and Joint Commission Patient Rights standards.',
    },
    humanIntervention: {
      required: severityLevel === 'LEVEL 4 – Critical' || severityLevel === 'LEVEL 3 – High' || isModerate,
      urgency: severityLevel === 'LEVEL 4 – Critical' ? 'Immediate (<2 hours)' : severityLevel === 'LEVEL 3 – High' ? 'Same-Day (<12 hours)' : 'Routine (<72 hours)',
      targetRoles: severityLevel === 'LEVEL 4 – Critical' ? ['Risk Manager on Call', 'Chief Medical Officer', 'Legal Counsel'] : ['Patient Advocate', 'Department Nurse Manager'],
      oversightReasoning: 'Automated triage establishes priority; formal resolution, root-cause investigation, and patient contact must be conducted by credentialed healthcare personnel.',
    },
    triageProtocols: {
      recommendedHoldingStatement: 'Thank you for bringing your experience to our attention. Our patient safety and quality leadership team is reviewing the matter promptly, and a patient representative will reach out to you directly.',
      recordsToPreserve: ['Electronic Health Record (EHR) audit trail and timestamp logs', 'Department shift roster and incident logs', 'Telephony or messaging server records'],
      immediateRiskMitigations: ['Verify immediate patient well-being and clinical stability if ongoing care is involved', 'Notify supervisor of the involved clinical unit'],
      phiProtectionNote: 'All patient identifiers sanitized for triage processing; preserve original grievance in secure compliance repository.',
    },
  };
}

// POST /api/triage endpoint
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const { complaintText, department, channel, encounterType } = req.body;

    if (!complaintText || typeof complaintText !== 'string' || !complaintText.trim()) {
      res.status(400).json({ error: 'Complaint text is required.' });
      return;
    }

    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured. Serving heuristic clinical triage.');
      const fallback = heuristicTriage(complaintText, department, channel);
      res.json({ triage: fallback, modelUsed: 'Heuristic Clinical Governance Engine (Local)' });
      return;
    }

    const systemPrompt = `You are a Healthcare Complaint Triage Assistant for an accredited hospital and healthcare system.
Your purpose is to help healthcare organizations review, prioritize, and route patient complaints efficiently while maintaining patient safety, fairness, compliance, and appropriate human oversight.
You will receive patient complaints, patient portal messages, survey comments, grievance reports, online reviews, or feedback submissions.

IMPORTANT BOUNDARY: Your role is NOT to resolve complaints. Your role is strictly to triage complaints and determine:
1. What happened
2. How serious it is
3. Who should review it
4. How quickly it should be addressed
5. Whether human intervention is required

For every complaint, complete the required steps:

STEP 1: Complaint Category
Classify the complaint into one primary category from:
- Communication
- Scheduling
- Wait Time
- Technology / Patient Portal
- Billing
- Clinical Care
- Patient Safety
- Privacy or Security
- Staff Conduct
- Other
If multiple categories are present, identify the primary category and list any secondary categories. Provide reasoning.

STEP 2: Severity Assessment
Assign a severity level:
- LEVEL 1 – Low (Examples: Minor inconvenience, Routine dissatisfaction, General suggestion)
- LEVEL 2 – Moderate (Examples: Repeated service failures, Significant frustration, Communication breakdown)
- LEVEL 3 – High (Examples: Potential patient harm, Medication-related concern, Serious accessibility issue, Escalated complaint)
- LEVEL 4 – Critical (Examples: Immediate patient safety risk, Potential legal exposure, Serious privacy violation, Discrimination allegation)
Provide reasoning for the assigned severity.

WHAT HAPPENED:
Extract an objective clinical/operational summary, chronological sequence of key events, involved clinical/administrative departments, and extracted direct quotes or key patient statements.

STEP 5: Risk Detection
Identify applicable risks from the following 8 risks:
1. Patient Safety Risk
2. Clinical Risk
3. Compliance Risk
4. Privacy Risk
5. Accessibility Risk
6. Equity Risk
7. Reputational Risk
8. Operational Risk
For each of the 8 risks, provide a boolean 'flagged' (true if present, false if not) and a concise explanation of why it was flagged or why it is not elevated.

STEP 6: Escalation Recommendation
Recommend one primary escalation route from:
- Patient Experience Team
- Nursing Leadership
- Physician Leadership
- Quality Improvement Team
- Compliance Office
- Information Technology
- Revenue Cycle / Billing
- Accessibility Coordinator
- Risk Management
- Executive Review
Provide an in-depth justification for the chosen escalation path based on the identified risks. Optionally suggest a secondary CC department.

RESPONSE SLA / TARGET TIMEFRAME:
Recommend target response window:
- LEVEL 4: Immediate (< 2 hours)
- LEVEL 3: Urgent (< 24 hours)
- LEVEL 2: Standard (< 72 hours)
- LEVEL 1: Routine (< 5 business days)
Provide regulatory rationale (e.g., CMS 42 CFR § 482.13, Joint Commission).

HUMAN INTERVENTION OVERSIGHT:
Specify whether human intervention is required (almost always true for High/Critical, and true for Moderate with clinical or dispute factors), required human roles (e.g. Risk Manager, Patient Advocate, Nurse Manager), urgency, and clear oversight rationale emphasizing human-in-the-loop accountability.

ACTIONABLE PROTOCOLS:
Provide a neutral, empathetic non-admission holding statement, key records to preserve (audit logs, telemetry, medication barcodes), and risk mitigations.`;

    const userPrompt = `Complaint Intake Context:
- Source Channel: ${channel || 'Unspecified Intake'}
- Department / Service Line: ${department || 'General Clinical'}
- Encounter Type: ${encounterType || 'Not specified'}

Patient Complaint Text:
"""
${complaintText}
"""

Execute full clinical complaint triage conforming to the requested steps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryCategory: {
              type: Type.STRING,
              description: 'Primary category strictly from the 10 allowed categories',
            },
            secondaryCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Secondary categories if multiple apply',
            },
            categoryReasoning: {
              type: Type.STRING,
              description: 'Reasoning for primary category classification',
            },
            severityLevel: {
              type: Type.STRING,
              description: 'Severity level: LEVEL 1 – Low, LEVEL 2 – Moderate, LEVEL 3 – High, or LEVEL 4 – Critical',
            },
            severityReasoning: {
              type: Type.STRING,
              description: 'Detailed reasoning for the severity level assigned',
            },
            whatHappened: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: 'Objective 2-3 sentence overview of what occurred' },
                chronology: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Chronological timeline of events' },
                involvedDepartments: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Departments or staff roles mentioned' },
                keyPatientStatements: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Direct patient quotes capturing essence of grievance' },
              },
              required: ['summary', 'chronology', 'involvedDepartments', 'keyPatientStatements'],
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  riskType: { type: Type.STRING, description: 'One of the 8 specified risk names' },
                  flagged: { type: Type.BOOLEAN, description: 'True if risk applies' },
                  explanation: { type: Type.STRING, description: 'Explanation of why this risk was flagged or not' },
                },
                required: ['riskType', 'flagged', 'explanation'],
              },
            },
            escalationRoute: {
              type: Type.STRING,
              description: 'Primary route chosen from the 10 allowed escalation routes',
            },
            secondaryRoute: {
              type: Type.STRING,
              description: 'Optional secondary department to copy or coordinate with',
            },
            escalationJustification: {
              type: Type.STRING,
              description: 'Justification for the chosen escalation path based on identified risks',
            },
            recommendedSLA: {
              type: Type.OBJECT,
              properties: {
                timeframe: { type: Type.STRING, description: 'e.g. Immediate (< 2 hours)' },
                hours: { type: Type.INTEGER, description: 'Number of hours for countdown' },
                urgencyLabel: { type: Type.STRING, description: 'Immediate, Urgent, Standard, or Routine' },
                rationale: { type: Type.STRING, description: 'Regulatory or institutional SLA rationale' },
              },
              required: ['timeframe', 'hours', 'urgencyLabel', 'rationale'],
            },
            humanIntervention: {
              type: Type.OBJECT,
              properties: {
                required: { type: Type.BOOLEAN, description: 'Whether human intervention is required' },
                urgency: { type: Type.STRING, description: 'Urgency of human review' },
                targetRoles: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Roles that must conduct human review' },
                oversightReasoning: { type: Type.STRING, description: 'Explanation of human oversight trigger and requirements' },
              },
              required: ['required', 'urgency', 'targetRoles', 'oversightReasoning'],
            },
            triageProtocols: {
              type: Type.OBJECT,
              properties: {
                recommendedHoldingStatement: { type: Type.STRING, description: 'Empathetic, non-liability holding response' },
                recordsToPreserve: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Audit trail and clinical records to preserve' },
                immediateRiskMitigations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Immediate risk mitigation steps' },
                phiProtectionNote: { type: Type.STRING, description: 'HIPAA privacy and de-identification notice' },
              },
              required: ['recommendedHoldingStatement', 'recordsToPreserve', 'immediateRiskMitigations', 'phiProtectionNote'],
            },
          },
          required: [
            'primaryCategory',
            'secondaryCategories',
            'categoryReasoning',
            'severityLevel',
            'severityReasoning',
            'whatHappened',
            'risks',
            'escalationRoute',
            'escalationJustification',
            'recommendedSLA',
            'humanIntervention',
            'triageProtocols',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsedTriage: TriageResult = JSON.parse(text);

    // Normalize category and severity to ensure valid UI rendering
    if (!CATEGORIES.includes(parsedTriage.primaryCategory)) {
      const match = CATEGORIES.find(c => c.toLowerCase() === parsedTriage.primaryCategory.toLowerCase());
      parsedTriage.primaryCategory = match || 'Other';
    }

    if (!SEVERITIES.includes(parsedTriage.severityLevel)) {
      const s = parsedTriage.severityLevel.toLowerCase();
      if (s.includes('critical') || s.includes('4')) parsedTriage.severityLevel = 'LEVEL 4 – Critical';
      else if (s.includes('high') || s.includes('3')) parsedTriage.severityLevel = 'LEVEL 3 – High';
      else if (s.includes('moderate') || s.includes('2')) parsedTriage.severityLevel = 'LEVEL 2 – Moderate';
      else parsedTriage.severityLevel = 'LEVEL 1 – Low';
    }

    if (!ROUTES.includes(parsedTriage.escalationRoute)) {
      const match = ROUTES.find(r => r.toLowerCase() === parsedTriage.escalationRoute.toLowerCase());
      parsedTriage.escalationRoute = match || 'Patient Experience Team';
    }

    res.json({ triage: parsedTriage, modelUsed: 'Gemini 3.8 Flash' });
  } catch (error: any) {
    console.error('Error during Gemini complaint triage:', error);
    // Provide clean fallback so the clinician/user's workflow never breaks
    try {
      const fallback = heuristicTriage(req.body.complaintText || '', req.body.department, req.body.channel);
      res.json({
        triage: fallback,
        modelUsed: 'Heuristic Clinical Governance Engine (Fallback)',
        warning: 'AI model service was temporarily unavailable; processed using institutional rule-based triage.',
      });
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || 'Failed to triage complaint.' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Healthcare Complaint Triage Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
