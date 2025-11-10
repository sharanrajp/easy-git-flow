import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import HRDashboard from "./app/dashboard/hr/page"
import HRCandidatesPage from "./app/dashboard/hr/candidates/page"
import HRUsersPage from "./app/dashboard/hr/users/page"
import HRVacanciesPage from "./app/dashboard/hr/vacancies/page"
import PanelistDashboard from "./app/dashboard/panelist/page"
import SuperadminDashboard from "./app/dashboard/superadmin/page"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/theme-provider"
import { useEffect } from "react"
import { API_BASE_URL } from "@/lib/api-config"


function App() {

  useEffect(() => {
    // Create SSE connection to backend
    const eventSource = new EventSource(`${API_BASE_URL}/sse/stream`)

    // When server sends a message
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📩 SSE event received:", data)

        // Handle interview scheduling
        if (data.type === "interview_scheduled") {
          // Example: trigger function to refetch scheduled interviews
          window.dispatchEvent(new CustomEvent("interview_scheduled", { detail: data }))
        }

        // Handle canidate panel assignment
        if (data.type === "candidate_panel_assigned") {
          window.dispatchEvent(new CustomEvent("candidate_panel_assigned", { detail: data }))
        }

        // Handle feedback submission
        if (data.type === "feedback_submitted") {
          window.dispatchEvent(new CustomEvent("feedback_submitted", { detail: data }))
        }
      } catch (err) {
        console.error("Failed to parse SSE message:", err)
      }
    }

    // Handle connection errors
    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err)
      eventSource.close()
    }

    // Cleanup on component unmount
    return () => {
      eventSource.close()
    }
  }, [])
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/hr" element={<HRDashboard />} />
            <Route path="/dashboard/hr/candidates" element={<HRCandidatesPage />} />
            <Route path="/dashboard/hr/users" element={<HRUsersPage />} />
            <Route path="/dashboard/hr/positions" element={<HRVacanciesPage />} />
            <Route path="/dashboard/panelist" element={<PanelistDashboard />} />
            <Route path="/dashboard/superadmin" element={<SuperadminDashboard />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App