/**
 * ============================================================================
 * CampusCare Core Modules Unit Test Suite
 * Generated & Verified with Qodo Gen (CodiumAI)
 *
 * Scope:
 * 1. Zod Schema Validation (Authentication, Complaint Submission, SLA Override)
 * 2. SLA Engine (Priority Hour Mapping, Due Timestamp Calculation, Overdue Status)
 * 3. Role-Based Access Control (Department Queues, Reassignment, Self-Demotion)
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "../src/lib/validations/auth";
import { complaintSchema, slaOverrideSchema } from "../src/lib/validations/complaints";
import { calculateSlaDueDate, isTicketOverdue, SLA_HOURS_MAP } from "../src/lib/sla";
import { canAccessQueue, canReassignTicket, canSelfDemote, UserSession } from "../src/lib/rbac";

describe("1. Zod Schema Validation Suite [Verified by Qodo Gen]", () => {
  describe("Auth Schemas", () => {
    it("should accept valid university credentials on login", () => {
      const validPayload = {
        email: "student@campuscare.edu",
        password: "Student123!",
      };
      const result = loginSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email formats", () => {
      const invalidPayload = {
        email: "not-an-email",
        password: "Student123!",
      };
      const result = loginSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid university email");
      }
    });

    it("should reject passwords shorter than 6 characters", () => {
      const shortPassPayload = {
        fullName: "Alex Johnson",
        email: "student@campuscare.edu",
        password: "123",
      };
      const result = signupSchema.safeParse(shortPassPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 6 characters");
      }
    });
  });

  describe("Complaint Schemas", () => {
    it("should accept a complete, valid complaint payload", () => {
      const validComplaint = {
        title: "AC Unit Leaking Water",
        departmentId: "11111111-1111-1111-1111-111111111111",
        categoryId: "11111111-1111-1111-1111-111111111112",
        location: "Lab Room 402, Academic Building B",
        priority: "high" as const,
        description: "Water leaking constantly from ceiling AC onto student workstations.",
        isAnonymous: false,
      };
      const result = complaintSchema.safeParse(validComplaint);
      expect(result.success).toBe(true);
    });

    it("should reject complaints with title shorter than 5 characters", () => {
      const invalidTitle = {
        title: "AC",
        departmentId: "11111111-1111-1111-1111-111111111111",
        categoryId: "11111111-1111-1111-1111-111111111112",
        location: "Lab 402",
        priority: "high" as const,
        description: "Water leaking from AC onto desks.",
      };
      const result = complaintSchema.safeParse(invalidTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 5 characters");
      }
    });

    it("should reject invalid priority values not in enum", () => {
      const invalidPriority = {
        title: "AC Unit Leaking Water",
        departmentId: "11111111-1111-1111-1111-111111111111",
        categoryId: "11111111-1111-1111-1111-111111111112",
        location: "Lab 402",
        priority: "super-urgent",
        description: "Water leaking from ceiling onto workstations.",
      };
      const result = complaintSchema.safeParse(invalidPriority);
      expect(result.success).toBe(false);
    });
  });

  describe("SLA Override Schema", () => {
    it("should accept valid override with complaint ID, new date, and justification reason", () => {
      const validOverride = {
        complaintId: "cmp_98432",
        newSlaDate: "2026-11-05T18:00:00.000Z",
        reason: "Replacement compressor parts ordered, arriving Thursday morning.",
      };
      const result = slaOverrideSchema.safeParse(validOverride);
      expect(result.success).toBe(true);
    });

    it("should reject SLA override without a valid reason note", () => {
      const invalidOverride = {
        complaintId: "cmp_98432",
        newSlaDate: "2026-11-05T18:00:00.000Z",
        reason: "wait",
      };
      const result = slaOverrideSchema.safeParse(invalidOverride);
      expect(result.success).toBe(false);
    });
  });
});

describe("2. SLA Target Calculation & Deadline Engine [Verified by Qodo Gen]", () => {
  it("should enforce exact SLA response windows per priority tier", () => {
    expect(SLA_HOURS_MAP.critical).toBe(4);   // 4 Hours
    expect(SLA_HOURS_MAP.high).toBe(24);     // 24 Hours
    expect(SLA_HOURS_MAP.medium).toBe(72);   // 72 Hours (3 Days)
    expect(SLA_HOURS_MAP.low).toBe(168);     // 168 Hours (7 Days)
  });

  it("should accurately calculate target completion timestamp for critical incidents", () => {
    const baseDate = new Date("2026-11-02T10:00:00.000Z");
    const targetDate = calculateSlaDueDate("critical", baseDate);

    // Exactly 4 hours later: 14:00:00
    expect(targetDate.toISOString()).toBe("2026-11-02T14:00:00.000Z");
  });

  it("should fallback to 72 hours if an unknown priority is passed", () => {
    const baseDate = new Date("2026-11-02T10:00:00.000Z");
    const targetDate = calculateSlaDueDate("unknown" as unknown as "low", baseDate);
    expect(targetDate.toISOString()).toBe("2026-11-05T10:00:00.000Z");
  });

  it("should accurately calculate target completion timestamp for 24h high priority incidents", () => {
    const baseDate = new Date("2026-11-02T10:00:00.000Z");
    const targetDate = calculateSlaDueDate("high", baseDate);

    // Exactly 24 hours later: 2026-11-03T10:00:00
    expect(targetDate.toISOString()).toBe("2026-11-03T10:00:00.000Z");
  });

  it("should flag overdue status when current wall clock exceeds target deadline (ISO string)", () => {
    const pastDeadline = "2026-11-02T08:00:00.000Z";
    const currentTime = new Date("2026-11-02T10:00:00.000Z");

    expect(isTicketOverdue(pastDeadline, currentTime)).toBe(true);
  });

  it("should not flag overdue when current time is within SLA target", () => {
    const futureDeadline = new Date("2026-11-02T16:00:00.000Z");
    const currentTime = new Date("2026-11-02T10:00:00.000Z");

    expect(isTicketOverdue(futureDeadline, currentTime)).toBe(false);
  });
});

describe("3. Role-Based Access Control (RBAC) & Safety Guards [Verified by Qodo Gen]", () => {
  const studentUser: UserSession = { id: "usr_student_1", role: "student" };
  const itStaffUser: UserSession = { id: "usr_staff_it", role: "staff", departmentId: "dept_it" };
  const adminUser: UserSession = { id: "usr_admin_1", role: "admin" };

  it("should grant staff access to their own department queue only", () => {
    expect(canAccessQueue(itStaffUser, "dept_it")).toBe(true);
    expect(canAccessQueue(itStaffUser, "dept_electrical")).toBe(false);
  });

  it("should deny student access to any staff department queue", () => {
    expect(canAccessQueue(studentUser, "dept_it")).toBe(false);
  });

  it("should grant admin access across all department queues", () => {
    expect(canAccessQueue(adminUser, "dept_it")).toBe(true);
    expect(canAccessQueue(adminUser, "dept_electrical")).toBe(true);
  });

  it("should only allow admin users to reassign tickets", () => {
    expect(canReassignTicket(adminUser)).toBe(true);
    expect(canReassignTicket(itStaffUser)).toBe(false);
    expect(canReassignTicket(studentUser)).toBe(false);
  });

  it("should prevent admin self-demotion to preserve system access integrity", () => {
    // Admin trying to demote themselves to student -> REJECTED
    expect(canSelfDemote("usr_admin_1", "usr_admin_1", "student")).toBe(false);

    // Admin demoting another user -> ALLOWED
    expect(canSelfDemote("usr_admin_1", "usr_staff_it", "student")).toBe(true);
  });
});
