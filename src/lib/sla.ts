export type PriorityLevel = "low" | "medium" | "high" | "critical";

export const SLA_HOURS_MAP: Record<PriorityLevel, number> = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export function calculateSlaDueDate(priority: PriorityLevel, baseDate: Date = new Date()): Date {
  const hours = SLA_HOURS_MAP[priority] ?? 72;
  return new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
}

export function isTicketOverdue(slaDueAt: string | Date, now: Date = new Date()): boolean {
  const dueDate = typeof slaDueAt === "string" ? new Date(slaDueAt) : slaDueAt;
  return now.getTime() > dueDate.getTime();
}
