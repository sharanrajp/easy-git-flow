import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./header"
import { type User } from "@/lib/auth"
import { useAuth } from "../../contexts/AuthContext"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: User["role"]
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, setUser, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("ats_user", JSON.stringify(updatedUser))
  }

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login")
      return
    }

    if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard
      switch (user.role) {
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
    }
  }, [user, isLoading, navigate, requiredRole])

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
        <Header user={user} onUserUpdate={handleUserUpdate} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onUserUpdate={handleUserUpdate} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}