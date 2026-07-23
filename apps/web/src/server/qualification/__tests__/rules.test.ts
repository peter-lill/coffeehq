import { describe, expect, it } from "vitest";
import { businessDaysBetween, evaluateQualificationDates } from "../rules";
describe("qualification rules", () => {
  it("counts weekdays", () => expect(businessDaysBetween(new Date("2026-07-03"), new Date("2026-07-06"))).toBe(1));
  it("raises first-seen and issue-date alerts after twenty weekdays", () => {
    const alerts = evaluateQualificationDates({ injuryDate: new Date("2026-01-01"), dateFirstSeen: new Date("2026-02-10"), certificateIssueDate: new Date("2026-02-10") });
    expect(alerts.map(a=>a.code)).toContain("S131_FIRST_SEEN_OVER_20_BUSINESS_DAYS");
    expect(alerts.map(a=>a.code)).toContain("S131_CERTIFICATE_ISSUED_OVER_20_BUSINESS_DAYS");
  });
  it("raises six month first-seen alert", () => expect(evaluateQualificationDates({ injuryDate:new Date("2025-01-01"), dateFirstSeen:new Date("2025-08-01") }).some(a=>a.code==="S131_FIRST_SEEN_OVER_6_MONTHS")).toBe(true));
});
