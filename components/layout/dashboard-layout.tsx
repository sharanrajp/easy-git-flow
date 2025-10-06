 

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./header"
import { type User, getStoredUser } from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: User["role"]
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      navigate("/login")
      return
    }

    if (requiredRole && storedUser.role !== requiredRole) {
      // Redirect to appropriate dashboard
      switch (storedUser.role) {
        case "hr":
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-subtle animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (user.role === "panelist") {
    return (
      <div className="flex flex-col min-h-screen bg-background animate-fade-in">
        <Header user={user} />
        <main className="flex-1 p-6 animate-slide-up">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-6 animate-slide-up">{children}</main>
      </div>
    </div>
  )
}
