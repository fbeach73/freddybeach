import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  business: ["create", "read", "update", "delete", "claim", "verify", "approve"],
  aiTools: ["use", "manage"],
  analytics: ["view", "export"],
  claims: ["submit", "approve", "reject", "view"],
} as const;

export const ac = createAccessControl(statement);

// Admin: Full platform control (admin@freddybeach.com)
export const admin = ac.newRole({
  ...adminAc.statements,
  business: ["create", "read", "update", "delete", "claim", "verify", "approve"],
  aiTools: ["use", "manage"],
  analytics: ["view", "export"],
  claims: ["submit", "approve", "reject", "view"],
});

// Client: Business owners with approved listings
export const client = ac.newRole({
  business: ["read", "update", "claim"],
  aiTools: ["use"],
  analytics: ["view"],
  claims: ["submit", "view"],
});

// User: Default role for new signups (browse + submit claims)
export const user = ac.newRole({
  business: ["read"],
  claims: ["submit"],
});
