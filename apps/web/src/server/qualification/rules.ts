export type QualificationAlertCode =
  | "S131_FIRST_SEEN_OVER_20_BUSINESS_DAYS"
  | "S131_CERTIFICATE_ISSUED_OVER_20_BUSINESS_DAYS"
  | "S131_FIRST_SEEN_OVER_6_MONTHS";

export type QualificationAlert = {
  code: QualificationAlertCode;
  label: string;
  detail: string;
  businessDays?: number;
  requiresConsideration: boolean;
};

export function businessDaysBetween(start: Date, end: Date): number {
  if (end <= start) return 0;
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(12, 0, 0, 0);
  const finish = new Date(end);
  finish.setHours(12, 0, 0, 0);
  while (cursor < finish) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function evaluateQualificationDates(input: {
  injuryDate?: Date | null;
  dateFirstSeen?: Date | null;
  certificateIssueDate?: Date | null;
}): QualificationAlert[] {
  const alerts: QualificationAlert[] = [];
  if (!input.injuryDate) return alerts;
  if (input.dateFirstSeen) {
    const days = businessDaysBetween(input.injuryDate, input.dateFirstSeen);
    if (days > 20) alerts.push({
      code: "S131_FIRST_SEEN_OVER_20_BUSINESS_DAYS",
      label: "Date first seen exceeds 20 business days",
      detail: `The recorded date first seen is ${days} weekdays after the injury date. Record the section 131 consideration.`,
      businessDays: days,
      requiresConsideration: true,
    });
    if (input.dateFirstSeen > addMonths(input.injuryDate, 6)) alerts.push({
      code: "S131_FIRST_SEEN_OVER_6_MONTHS",
      label: "Date first seen exceeds six months",
      detail: "The recorded date first seen is more than six months after the injury date. Record the section 131 consideration.",
      requiresConsideration: true,
    });
  }
  if (input.certificateIssueDate) {
    const days = businessDaysBetween(input.injuryDate, input.certificateIssueDate);
    if (days > 20) alerts.push({
      code: "S131_CERTIFICATE_ISSUED_OVER_20_BUSINESS_DAYS",
      label: "Certificate issue date exceeds 20 business days",
      detail: `The certificate issue date is ${days} weekdays after the injury date. Record the section 131 consideration.`,
      businessDays: days,
      requiresConsideration: true,
    });
  }
  return alerts;
}
