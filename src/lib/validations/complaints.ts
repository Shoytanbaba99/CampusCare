import { z } from "zod";

export const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100),
  departmentId: z.string().min(1, "Please select a valid department."),
  categoryId: z.string().min(1, "Please select a valid issue category."),
  location: z.string().min(3, "Location details must be at least 3 characters long."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)."),
  isAnonymous: z.boolean().optional().default(false),
});

export const slaOverrideSchema = z.object({
  complaintId: z.string().min(1, "Complaint ID is required."),
  newSlaDate: z.string().min(1, "Please select a valid new target completion date."),
  reason: z.string().min(5, "Please provide a reason for the SLA date override (at least 5 characters)."),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;
export type SlaOverrideInput = z.infer<typeof slaOverrideSchema>;
