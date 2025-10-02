import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { type User, getStoredUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only check auth on initial mount, not on every route change
    const storedUser = getStoredUser()
    
    if (!storedUser && !location.pathname.startsWith('/login') && location.pathname !== '/') {
      navigate("/login")
    } else {
      setUser(storedUser)
    }
    
    setIsLoading(false)
  }, []) // Empty dependency array - only run once on mount

  // Listen for user updates from other components
  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent<User>) => {
      setUser(event.detail)
    }

    window.addEventListener('userUpdated', handleUserUpdate as EventListener)
    return () => window.removeEventListener('userUpdated', handleUserUpdate as EventListener)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
