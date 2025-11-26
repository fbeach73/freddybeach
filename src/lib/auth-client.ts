import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins"
import type { auth } from "./auth"
import { ac, admin, client, user } from "./auth/permissions"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    // Infer custom session types from server auth instance
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles: { admin, client, user },
    }),
  ],
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  admin: adminActions,
} = authClient

// Export session type for use in components
export type Session = typeof authClient.$Infer.Session