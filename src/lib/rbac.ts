export type UserRole = "student" | "staff" | "admin";

export interface UserSession {
  id: string;
  role: UserRole;
  departmentId?: string;
}

export function canAccessQueue(user: UserSession, departmentId: string): boolean {
  if (user.role === "admin") return true;
  if (user.role === "staff") return user.departmentId === departmentId;
  return false;
}

export function canReassignTicket(user: UserSession): boolean {
  return user.role === "admin";
}

export function canSelfDemote(actingUserId: string, targetUserId: string, newRole: UserRole): boolean {
  if (actingUserId === targetUserId && newRole !== "admin") {
    return false; // Prevent admin from demoting themselves
  }
  return true;
}
