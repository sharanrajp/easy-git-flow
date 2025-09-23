import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { type User, getStoredUser, getToken } from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: User["role"]
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    const storedUser = getStoredUser()

    // Check if user is authenticated
    if (!token || !storedUser) {
      navigate("/login")
      return
    }

    // Check role authorization
    if (requiredRole && storedUser.role !== requiredRole) {
      // Redirect to appropriate dashboard
      switch (storedUser.role) {
        case "hr":
        case "admin":
          navigate("/dashboard/hr")
          break
        case "panelist":
          navigate("/dashboard/panelist")
          break
        case "manager":
          navigate("/dashboard/manager")
          break
      }
      return
    }

    setUser(storedUser)
    setIsLoading(false)
  }, [navigate, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (user.role === "panelist") {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}