import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    // No sessionStorage usage - always redirect to login
    navigate("/login")
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default HomePage