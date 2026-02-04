import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export type Role = "admin" | "client" | "user"

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}

export async function getRole(): Promise<Role | null> {
  const session = await getSession()
  if (!session) return null
  return (session.user.role as Role) || "user"
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/")
  }
  return session
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const userRole = (session.user.role as Role) || "user"

  if (!allowedRoles.includes(userRole)) {
    redirect("/dashboard")
  }

  return session
}

export async function requireAdmin() {
  return requireRole(["admin"])
}

export async function isAdmin(): Promise<boolean> {
  const role = await getRole()
  return role === "admin"
}

export async function isClient(): Promise<boolean> {
  const role = await getRole()
  return role === "client" || role === "admin"
}

export async function isEmailVerified(): Promise<boolean> {
  const session = await getSession()
  if (!session) return false
  return session.user.emailVerified === true
}

export async function requireEmailVerified() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  if (!session.user.emailVerified) {
    redirect("/verify-email")
  }

  return session
}
