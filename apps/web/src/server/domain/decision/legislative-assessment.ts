import type { CausativeFactorAnalysisResult } from "@/server/domain/decision/causative-factors";

export const LEGISLATIVE_ELEMENTS = [
  {
    key: "WORKER_STATUS",
    label: "Worker status",
    prompt: "Is the claimant a worker for the purposes of the applicable legislation?",
  },
  {
    key: "PERSONAL_INJURY",
    label: "Personal injury",
    prompt: "Is there a personal injury supported by the available medical evidence?",
  },
  {
    key: "EMPLOYMENT_CONNECTION",
    label: "Employment connection",
    prompt: "Did the injury arise out of, or in the course of, employment?",
  },
  {
    key: "SIGNIFICANT_CONTRIBUTING_FACTOR",
    label: "Employment contribution",
    prompt: "Was employment a significant contributing factor to the injury?",
  },
  {
    key: "REASONABLE_MANAGEMENT_ACTION",
    label: "Reasonable management action",
    prompt: "Does a reasonable management action exclusion require assessment?",
  },
  {
    key: "OTHER_REQUIREMENTS_OR_EXCLUSIONS",
    label: "Other requirements or exclusions",
    prompt: "Are there any other statutory requirements, exclusions or threshold issues?",
  },
] as const;

export type LegislativeElementKey = (typeof LEGISLATIVE_ELEMENTS)[number]["key"];
export type LegislativeAssessmentStatus =
  | "SATISFIED"
  | "NOT_SATISFIED"
  | "NOT_APPLICABLE"
  | "NOT_ASSESSED";

export type LegislativeAssessmentRecord = {
  elementKey: LegislativeElementKey;
  status: LegislativeAssessmentStatus;
  reasons: string;
  evidenceSummary: string;
  linkedFactorKeys: string[];
  assessedBy: string;
  assessedAt: Date | null;
};

export type LegislativeElementAnalysis = {
  key: LegislativeElementKey;
  label: string;
  prompt: string;
  status: LegislativeAssessmentStatus;
  trafficLight: "GREEN" | "RED" | "BLUE" | "GREY";
  reasons: string;
  evidenceSummary: string;
  linkedFactors: Array<{
    key: string;
    label: string;
    substantiationStatus: string;
    trafficLight: string;
  }>;
  assessedBy: string;
  assessedAt: Date | null;
};

export type LegislativeAssessmentResult = {
  elements: LegislativeElementAnalysis[];
  satisfied: number;
  notSatisfied: number;
  notApplicable: number;
  notAssessed: number;
  allRequiredElementsAssessed: boolean;
  explanation: string;
  boundaryNotice: string;
};

function normalise(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-AU");
}

function trafficLight(status: LegislativeAssessmentStatus) {
  if (status === "SATISFIED") return "GREEN" as const;
  if (status === "NOT_SATISFIED") return "RED" as const;
  if (status === "NOT_APPLICABLE") return "BLUE" as const;
  return "GREY" as const;
}

export function buildLegislativeAssessment(input: {
  causativeFactors: CausativeFactorAnalysisResult;
  assessments?: LegislativeAssessmentRecord[];
}): LegislativeAssessmentResult {
  const assessmentMap = new Map(
    (input.assessments ?? []).map((assessment) => [assessment.elementKey, assessment]),
  );
  const factorMap = new Map(
    input.causativeFactors.factors.map((factor) => [normalise(factor.label), factor]),
  );

  const elements = LEGISLATIVE_ELEMENTS.map((element): LegislativeElementAnalysis => {
    const assessment = assessmentMap.get(element.key);
    const status = assessment?.status ?? "NOT_ASSESSED";
    const linkedFactors = (assessment?.linkedFactorKeys ?? [])
      .map((factorKey) => factorMap.get(normalise(factorKey)))
      .filter((factor): factor is NonNullable<typeof factor> => Boolean(factor))
      .map((factor) => ({
        key: factor.id,
        label: factor.label,
        substantiationStatus: factor.substantiation.status,
        trafficLight: factor.substantiation.trafficLight,
      }));

    return {
      key: element.key,
      label: element.label,
      prompt: element.prompt,
      status,
      trafficLight: trafficLight(status),
      reasons: assessment?.reasons ?? "",
      evidenceSummary: assessment?.evidenceSummary ?? "",
      linkedFactors,
      assessedBy: assessment?.assessedBy ?? "",
      assessedAt: assessment?.assessedAt ?? null,
    };
  });

  const satisfied = elements.filter((element) => element.status === "SATISFIED").length;
  const notSatisfied = elements.filter((element) => element.status === "NOT_SATISFIED").length;
  const notApplicable = elements.filter((element) => element.status === "NOT_APPLICABLE").length;
  const notAssessed = elements.filter((element) => element.status === "NOT_ASSESSED").length;

  return {
    elements,
    satisfied,
    notSatisfied,
    notApplicable,
    notAssessed,
    allRequiredElementsAssessed: notAssessed === 0,
    explanation:
      notAssessed === 0
        ? "A human assessment has been recorded for every legislative element."
        : `${notAssessed} legislative element${notAssessed === 1 ? " remains" : "s remain"} unassessed.`,
    boundaryNotice:
      "CoffeeHQ records and displays assessments made by an authorised human user. It does not interpret legislation, determine whether an element is satisfied, or decide claim liability.",
  };
}
