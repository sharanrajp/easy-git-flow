import type { User } from "@/lib/auth"

/**
 * Defines which roles each user role can create
 */
export const ROLE_HIERARCHY: Record<string, string[]> = {
  admin: ["admin", "hr", "recruiter", "tpm_tem", "panel_member"],
  hr: ["recruiter", "tpm_tem", "panel_member"],
  recruiter: ["tpm_tem", "panel_member"],
  tpm_tem: [],
  panel_member: [],
}

/**
 * Returns the list of roles that a user with the given role can create
 */
export function getCreatableRoles(userRole: User["role"]): string[] {
  return ROLE_HIERARCHY[userRole] || []
}

/**
 * Checks if a user with the given role can create any users
 */
export function canCreateUsers(userRole: User["role"]): boolean {
  return getCreatableRoles(userRole).length > 0
}

/**
 * Checks if a user can access the users management page
 */
export function canAccessUsersPage(userRole: User["role"]): boolean {
  return ["admin", "hr", "recruiter"].includes(userRole)
}
