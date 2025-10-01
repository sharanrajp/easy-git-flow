import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import HRDashboard from "./app/dashboard/hr/page"
import HRCandidatesPage from "./app/dashboard/hr/candidates/page"
import HRUsersPage from "./app/dashboard/hr/users/page"
import HRVacanciesPage from "./app/dashboard/hr/vacancies/page"
import PanelistDashboard from "./app/dashboard/panelist/page"
import ManagerDashboard from "./app/dashboard/manager/page"
import ManagerCandidatesPage from "./app/dashboard/manager/candidates/page"
import ManagerOffersPage from "./app/dashboard/manager/offers/page"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext"

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/hr" element={<HRDashboard />} />
              <Route path="/dashboard/hr/candidates" element={<HRCandidatesPage />} />
              <Route path="/dashboard/hr/users" element={<HRUsersPage />} />
              <Route path="/dashboard/hr/vacancies" element={<HRVacanciesPage />} />
              <Route path="/dashboard/panelist" element={<PanelistDashboard />} />
              <Route path="/dashboard/manager" element={<ManagerDashboard />} />
              <Route path="/dashboard/manager/candidates" element={<ManagerCandidatesPage />} />
              <Route path="/dashboard/manager/offers" element={<ManagerOffersPage />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App