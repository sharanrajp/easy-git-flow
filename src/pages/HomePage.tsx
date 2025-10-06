import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    // No localStorage usage - always redirect to login
    navigate("/login")
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-subtle animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground animate-pulse">Redirecting...</p>
      </div>
    </div>
  )
}

export default HomePage