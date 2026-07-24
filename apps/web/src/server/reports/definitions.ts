export type ReportCategory =
  "GOLD_STANDARD" | "COMMUNICATION" | "MEDICAL" | "WORKFLOW";

export type ReportOutput = "DOCX" | "PDF" | "RTF" | "TEXT";

export type ReportDefinition = {
  id: string;
  category: ReportCategory;
  name: string;
  shortName: string;
  description: string;
  outputs: ReportOutput[];
  beanSupported: boolean;
  available: boolean;
};

export const reportCategoryLabels: Record<ReportCategory, string> = {
  GOLD_STANDARD: "Gold Standard",
  COMMUNICATION: "Communications",
  MEDICAL: "Medical",
  WORKFLOW: "Workflow",
};

export const reportCategoryDescriptions: Record<ReportCategory, string> = {
  GOLD_STANDARD:
    "Decision, analysis and executive reporting for claim determination.",
  COMMUNICATION:
    "Procedural fairness, evidence requests and claim correspondence.",
  MEDICAL:
    "Medical questions, causation enquiries and treatment-related review.",
  WORKFLOW: "Operational notes, handovers, timelines and evidence reporting.",
};

export const reportDefinitions: ReportDefinition[] = [
  {
    id: "reasons-for-decision",
    category: "GOLD_STANDARD",
    name: "Reasons for Decision",
    shortName: "Gold Standard RFD",
    description:
      "Prepare a structured acceptance or rejection decision using the evidence recorded on the claim.",
    outputs: ["DOCX", "PDF", "RTF"],
    beanSupported: true,
    available: true,
  },
  {
    id: "executive-claim-summary",
    category: "GOLD_STANDARD",
    name: "Executive Claim Summary",
    shortName: "Executive Summary",
    description:
      "Summarise the claim position, causative factors, evidence, risks and next actions.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "comprehensive-analysis",
    category: "GOLD_STANDARD",
    name: "Comprehensive Claim Analysis",
    shortName: "Claim Analysis",
    description:
      "Analyse medical, worker, employer and witness evidence, including conflicts and evidentiary gaps.",
    outputs: ["DOCX", "PDF"],
    beanSupported: true,
    available: true,
  },
  {
    id: "delay-reasons",
    category: "GOLD_STANDARD",
    name: "Delay Reasons for Decision",
    shortName: "Delay RFD",
    description:
      "Document why a determination could not be completed within the expected timeframe.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "natural-justice",
    category: "COMMUNICATION",
    name: "Natural Justice Correspondence",
    shortName: "Natural Justice",
    description:
      "Prepare procedural fairness correspondence addressing conflicting or adverse evidence.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "employer-letter",
    category: "COMMUNICATION",
    name: "Employer Correspondence",
    shortName: "Employer Letter",
    description:
      "Prepare a tailored request, update or clarification letter for the employer.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "worker-letter",
    category: "COMMUNICATION",
    name: "Worker Correspondence",
    shortName: "Worker Letter",
    description:
      "Prepare a tailored request, update or clarification letter for the worker.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "gp-report-request",
    category: "COMMUNICATION",
    name: "Treating Practitioner Report Request",
    shortName: "GP Request",
    description:
      "Generate a focused report request addressing diagnosis, causation and relevant contributing factors.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "witness-request",
    category: "COMMUNICATION",
    name: "Witness Information Request",
    shortName: "Witness Request",
    description:
      "Prepare focused questions for a witness about identified events and causative factors.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "medical-questions",
    category: "MEDICAL",
    name: "Medical Question Builder",
    shortName: "Medical Questions",
    description:
      "Build concise and evidence-based questions for treating practitioners or independent examiners.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "surgery-review",
    category: "MEDICAL",
    name: "Surgery Request Review",
    shortName: "Surgery Review",
    description:
      "Summarise the proposed treatment, clinical support, liability issues and outstanding enquiries.",
    outputs: ["DOCX", "PDF"],
    beanSupported: true,
    available: false,
  },
  {
    id: "causation-review",
    category: "MEDICAL",
    name: "Medical Causation Review",
    shortName: "Causation Review",
    description:
      "Compare the diagnosed condition against the identified work and non-work contributing factors.",
    outputs: ["DOCX", "PDF"],
    beanSupported: true,
    available: true,
  },
  {
    id: "file-notes",
    category: "WORKFLOW",
    name: "File Notes",
    shortName: "File Notes",
    description:
      "Convert calls, emails and interactions into structured CPIS-ready file notes.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "leave-handover",
    category: "WORKFLOW",
    name: "Leave Handover",
    shortName: "Leave Handover",
    description:
      "Summarise active claims, urgent actions, evidence outstanding and critical deadlines.",
    outputs: ["DOCX", "PDF"],
    beanSupported: true,
    available: true,
  },
  {
    id: "claim-timeline",
    category: "WORKFLOW",
    name: "Claim Timeline",
    shortName: "Timeline",
    description:
      "Generate a chronological summary of claim events, evidence and correspondence.",
    outputs: ["DOCX", "PDF", "TEXT"],
    beanSupported: true,
    available: true,
  },
  {
    id: "evidence-register",
    category: "WORKFLOW",
    name: "Evidence Register",
    shortName: "Evidence Register",
    description:
      "Export recorded evidence, outstanding requirements, blockers and source details.",
    outputs: ["DOCX", "PDF"],
    beanSupported: false,
    available: true,
  },
];

export function getReportDefinition(reportId: string) {
  return reportDefinitions.find((report) => report.id === reportId) ?? null;
}
