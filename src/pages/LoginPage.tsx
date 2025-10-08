import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchUserProfile } from '../lib/auth'
import atsHeroImage from "@/assets/ats-hero-image.jpg"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Clear any stale authentication data on mount
  useEffect(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("ats_user")
    localStorage.removeItem("ats_users")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Call login endpoint
      const loginResponse = await fetch("https://b2ma3tdd2m.us-west-2.awsapprunner.com/auth/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password,
        })
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}))
        if (loginResponse.status === 0) {
          setError("Unable to connect to server. Please check if the backend is running.")
        } else if (loginResponse.status === 401) {
          setError("Invalid email or password")
        } else {
          setError(errorData.message || `Server error (${loginResponse.status})`)
        }
        return
      }

      const loginData = await loginResponse.json()
      const { access_token, refresh_token } = loginData

      if (!access_token) {
        setError("Login failed. No access token received.")
        return
      }

      // Store both tokens in localStorage
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      // Fetch users with the token
      const usersResponse = await fetch("http://127.0.0.1:8000/panels/with-status", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`
        }
      })

      if (!usersResponse.ok) {
        if (usersResponse.status === 401) {
          setError("Authentication failed. Please try logging in again.")
        } else {
          setError(`Failed to fetch user data (${usersResponse.status}). Please try again.`)
        }
        return
      }

      const users = await usersResponse.json()
      
      // Store users in localStorage
      localStorage.setItem("ats_users", JSON.stringify(users))

      // Find current user to determine redirect
      const currentUser = users.find((u: any) => u.email === email || u.username === email)
      
      if (currentUser) {
        try {
          // Fetch detailed user profile
          const userProfile = await fetchUserProfile()
          
          // Merge profile data with user data from panels endpoint
          const enrichedUser = { ...currentUser, ...userProfile }
          
          // Store enriched user info
          localStorage.setItem("ats_user", JSON.stringify(enrichedUser))
          
          // Redirect based on role
          if (enrichedUser.role === "admin") {
            navigate("/dashboard/hr")
          } else if (enrichedUser.role === "panelist") {
            navigate("/dashboard/panelist")
          } else if (enrichedUser.role === "manager") {
            navigate("/dashboard/manager")
          } else {
            navigate("/dashboard/hr") // Default fallback
          }
        } catch (profileError) {
          console.warn("Failed to fetch user profile, using basic user data:", profileError)
          // Fallback to basic user data if profile fetch fails
          localStorage.setItem("ats_user", JSON.stringify(currentUser))
          
          // Redirect based on role
          if (currentUser.role === "admin") {
            navigate("/dashboard/hr")
          } else if (currentUser.role === "panelist") {
            navigate("/dashboard/panelist")
          } else if (currentUser.role === "manager") {
            navigate("/dashboard/manager")
          } else {
            navigate("/dashboard/hr") // Default fallback
          }
        }
      } else {
        setError("User role not recognized. Please contact administrator.")
      }

    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Unable to connect to server. Please ensure the backend is running on port 8000.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Image with Diagonal Clip */}
      <div 
        className="hidden lg:flex lg:w-[55%] relative bg-gradient-primary"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)'
        }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40 z-10"></div>
        
        {/* Hero Image */}
        <img 
          src={atsHeroImage} 
          alt="Applicant Tracking System - Streamline your hiring process" 
          className="object-cover w-full h-full"
          draggable="false"
        />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 xl:px-20">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Streamline Your
              <br />
              Hiring Process
            </h1>
            <p className="text-lg xl:text-xl max-w-md">
              Transform your recruitment workflow with our intelligent Applicant Tracking System
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign-in Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background relative">
        {/* Mobile background decoration */}
        <div className="lg:hidden absolute inset-0 bg-gradient-subtle opacity-50"></div>
        <div className="lg:hidden absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/vuedata-blue.webp" 
              alt="VueData Logo" 
              draggable="false" 
              height={25} 
              width={200}
              className="animate-slide-down"
            />
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-2 mb-8 animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Sign-in Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-scale-in">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-white font-semibold hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage