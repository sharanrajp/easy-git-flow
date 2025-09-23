import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2 } from "lucide-react"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Call login endpoint
      const loginResponse = await fetch("http://127.0.0.1:8000/auth/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password,
        })
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}))
        setError(errorData.message || "Invalid email or password")
        return
      }

      const loginData = await loginResponse.json()
      const { access_token } = loginData

      if (!access_token) {
        setError("Login failed. No access token received.")
        return
      }

      // Store token in localStorage
      localStorage.setItem("ats_token", access_token)

      // Fetch users with the token
      const usersResponse = await fetch("http://127.0.0.1:8000/panels/with-status", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`
        }
      })

      if (!usersResponse.ok) {
        setError("Failed to fetch user data. Please try again.")
        return
      }

      const users = await usersResponse.json()
      
      // Store users in localStorage
      localStorage.setItem("ats_users", JSON.stringify(users))

      // Find current user to determine redirect
      const currentUser = users.find((u: any) => u.email === email || u.username === email)
      
      if (currentUser) {
        // Store current user info
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
      } else {
        setError("User role not recognized. Please contact administrator.")
      }

    } catch (err) {
      setError("Unable to connect to server. Please try again.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    alert("Forgot password functionality is not implemented in this demo.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md shadow-elegant border-0 backdrop-blur-sm bg-gradient-card relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div>
              <img src="/vuedata-blue.webp" alt="vueDataImage" draggable="false" height={25} width={200}/>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to ATS
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow smooth-transition text-white font-semibold py-3" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary-glow smooth-transition font-medium"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage