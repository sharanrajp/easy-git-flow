import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getStoredUser } from "../lib/auth"

function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      switch (user.role) {
        case "hr":
          navigate("/dashboard/hr")
          break
        case "panelist":
          navigate("/dashboard/panelist")
          break
        case "manager":
          navigate("/dashboard/manager")
          break
        default:
          navigate("/login")
      }
    } else {
      navigate("/login")
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default HomePage