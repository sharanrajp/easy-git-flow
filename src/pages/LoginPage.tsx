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
      // Fetch all users from the backend
      const response = await fetch("http://127.0.0.1:8000/panels/with-status", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })

      if (!response.ok) {
        setError("Unable to connect to server. Please try again.")
        return
      }

      const users = await response.json()

      // Find user with matching email and password
      const user = users.find((u: any) => u.username === email && u.password === password)

      if (!user) {
        setError("Invalid email or password")
      } else if (user.role === "admin") {
        navigate("/dashboard/hr")
      } else if (user.role === "panelist") {
        navigate("/dashboard/panelist")
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.")
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
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-glow">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to VueData ATS
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