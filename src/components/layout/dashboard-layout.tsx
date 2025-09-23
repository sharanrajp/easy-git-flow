import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./header"
import { type User } from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: User["role"]
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Since we removed localStorage, redirect to login
    // In a real app, you'd implement proper session management here
    navigate("/login")
  }, [navigate])

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}