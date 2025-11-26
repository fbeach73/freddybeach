"use client"

import { useSession } from "@/lib/auth-client"
import type { Role } from "@/lib/auth/check-role"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: Role[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return null
  }

  const role = (session?.user?.role as Role) || "user"

  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGate allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGate allowedRoles={["admin", "client"]} fallback={fallback}>
      {children}
    </RoleGate>
  )
}
