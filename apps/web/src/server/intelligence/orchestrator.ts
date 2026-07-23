import { createUnavailableSpecialist, findSpecialistDefinition } from "./specialists";
import type {
  IntelligenceRequest,
  IntelligenceResult,
  IntelligenceSpecialist,
  IntelligenceSpecialistId,
} from "./types";

export type IntelligenceAuditWriter = (event: {
  action: "INTELLIGENCE_REQUESTED" | "INTELLIGENCE_COMPLETED";
  organisationId: string;
  investigationId: string;
  requestedByUserId: string;
  specialistId: IntelligenceSpecialistId;
  capability: IntelligenceRequest["capability"];
  requestId?: string;
  status?: IntelligenceResult["status"];
  serviceVersion: string;
}) => Promise<void>;

export class InvestigationIntelligenceEngine {
  private readonly specialists = new Map<IntelligenceSpecialistId, IntelligenceSpecialist>();

  constructor(
    specialists: IntelligenceSpecialist[] = [],
    private readonly writeAudit?: IntelligenceAuditWriter,
  ) {
    for (const specialist of specialists) this.specialists.set(specialist.id, specialist);
  }

  register(specialist: IntelligenceSpecialist) {
    this.specialists.set(specialist.id, specialist);
  }

  async execute(request: IntelligenceRequest): Promise<IntelligenceResult> {
    if (request.inputRecordIds.length === 0) {
      throw new Error("Intelligence requests must reference at least one source record.");
    }

    const definition = findSpecialistDefinition(request.capability);
    if (!definition) throw new Error(`No specialist supports ${request.capability}.`);

    const specialist =
      this.specialists.get(definition.id) ?? createUnavailableSpecialist(definition.id);

    await this.writeAudit?.({
      action: "INTELLIGENCE_REQUESTED",
      organisationId: request.organisationId,
      investigationId: request.investigationId,
      requestedByUserId: request.requestedByUserId,
      specialistId: specialist.id,
      capability: request.capability,
      serviceVersion: specialist.serviceVersion,
    });

    const result = await specialist.execute(request);

    if (result.capability !== request.capability || result.specialistId !== specialist.id) {
      throw new Error("The intelligence specialist returned an invalid response envelope.");
    }

    await this.writeAudit?.({
      action: "INTELLIGENCE_COMPLETED",
      organisationId: request.organisationId,
      investigationId: request.investigationId,
      requestedByUserId: request.requestedByUserId,
      specialistId: specialist.id,
      capability: request.capability,
      requestId: result.requestId,
      status: result.status,
      serviceVersion: result.serviceVersion,
    });

    return result;
  }
}
