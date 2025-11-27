/**
 * Claim role constants - single source of truth for claim roles
 * Used in API validation, form options, and display labels
 */
export const CLAIM_ROLES = [
  "owner",
  "manager",
  "authorized_representative",
] as const;

export type ClaimRole = (typeof CLAIM_ROLES)[number];

/**
 * Human-readable labels for claim roles
 */
export const CLAIM_ROLE_LABELS: Record<ClaimRole, string> = {
  owner: "Owner",
  manager: "Manager",
  authorized_representative: "Authorized Representative",
};

/**
 * Role options for form select components
 */
export const CLAIM_ROLE_OPTIONS = CLAIM_ROLES.map((role) => ({
  value: role,
  label: CLAIM_ROLE_LABELS[role],
}));

/**
 * Get the label for a claim role
 */
export function getClaimRoleLabel(role: string): string {
  return CLAIM_ROLE_LABELS[role as ClaimRole] || role;
}

/**
 * Validate if a string is a valid claim role
 */
export function isValidClaimRole(role: string): role is ClaimRole {
  return CLAIM_ROLES.includes(role as ClaimRole);
}
