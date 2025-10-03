// @ts-nocheck

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserCheck, Clock, CheckCircle, TrendingUp, Calendar, MessageSquare, Filter } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { calculateHRMetrics, type HRDashboardMetrics } from "@/lib/dashboard-api"
import { useToast } from "@/hooks/use-toast"
import { fetchVacancies } from "@/lib/vacancy-api"
import { getAllUsers, type User } from "@/lib/auth"
import type { Vacancy } from "@/lib/mock-data"
import { fetchUnassignedCandidates, fetchAssignedCandidates, fetchOngoingInterviews, type BackendCandidate } from "@/lib/candidates-api"

export default function HRDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const [candidateFilter, setCandidateFilter] = useState("day")
  const [vacancyFilter, setVacancyFilter] = useState("all")
  const [recruiterFilter, setRecruiterFilter] = useState("all")
  
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [hrUsers, setHrUsers] = useState<User[]>([])
  
  // Store all fetched data
  const [unassignedCandidates, setUnassignedCandidates] = useState<BackendCandidate[]>([])
  const [assignedCandidates, setAssignedCandidates] = useState<BackendCandidate[]>([])
  const [ongoingInterviews, setOngoingInterviews] = useState<any[]>([])
  
  // Calculate metrics from stored data when filters change
  const metrics = useMemo(() => {
    if (unassignedCandidates.length === 0 && assignedCandidates.length === 0) return null
    
    const filters = {
      vacancy: vacancyFilter !== "all" ? vacancyFilter : undefined,
      recruiter: recruiterFilter !== "all" ? recruiterFilter : undefined,
    }
    
    return calculateHRMetrics(unassignedCandidates, assignedCandidates, ongoingInterviews, filters, vacancies)
  }, [unassignedCandidates, assignedCandidates, ongoingInterviews, vacancyFilter, recruiterFilter, vacancies])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Listen for updates from other components
    const handleDataUpdate = () => {
      loadInitialData()
    }

    window.addEventListener('dashboardUpdate', handleDataUpdate)
    return () => window.removeEventListener('dashboardUpdate', handleDataUpdate)
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      const [fetchedVacancies, fetchedUsers, fetchedUnassigned, fetchedAssigned, fetchedOngoing] = await Promise.all([
        fetchVacancies(),
        getAllUsers(),
        fetchUnassignedCandidates(),
        fetchAssignedCandidates(),
        fetchOngoingInterviews()
      ])
      
      setVacancies(fetchedVacancies)
      setHrUsers(fetchedUsers.filter(user => user.role === 'hr'))
      setUnassignedCandidates(fetchedUnassigned)
      setAssignedCandidates(fetchedAssigned)
      setOngoingInterviews(fetchedOngoing)
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const MetricCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "blue",
    filterValue,
  }: {
    title: string
    value: string | number
    description?: string
    icon: any
    trend?: { value: number; label: string }
    color?: "blue" | "green" | "orange" | "red" | "gray"
    filterValue?: string
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      orange: "bg-orange-50 text-orange-600",
      red: "bg-red-50 text-red-600",
      gray: "bg-gray-50 text-gray-600",
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
              {filterValue && <p className="text-xs text-blue-600 mt-1">({filterValue})</p>}
              {trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{trend.value}% {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !metrics) {
    return (
      <DashboardLayout requiredRole="hr">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="hr">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your recruitment.</p>
            </div>
          </div>
        </div>

        {/* Candidate Overview Metrics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Candidate Overview</h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={candidateFilter} onValueChange={setCandidateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {vacancies.map(vacancy => (
                    <SelectItem key={vacancy.id} value={vacancy.id}>
                      {vacancy.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Applications"
              value={metrics.total_applications}
              icon={Users}
              trend={{ value: 12, label: candidateFilter === "day" ? "vs yesterday" : `vs last ${candidateFilter}` }}
              color="blue"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            <MetricCard
              title="Unassigned Candidates"
              value={metrics.unassigned_candidates}
              description="Awaiting recruiter assignment"
              icon={UserCheck}
              color="orange"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            <MetricCard
              title="Interviews Scheduled"
              value={metrics.interviews_scheduled}
              description="Across all rounds"
              icon={Clock}
              color="green"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
            <MetricCard
              title="Joined/Offer Released"
              value={`${metrics.joined_count}/${metrics.offer_released_count}`}
              icon={CheckCircle}
              trend={{ value: 25, label: `vs last ${candidateFilter}` }}
              color="green"
              filterValue={
                candidateFilter === "day"
                  ? "Today"
                  : candidateFilter === "week"
                    ? "This Week"
                    : candidateFilter === "month"
                      ? "This Month"
                      : "This Quarter"
              }
            />
          </div>
        </div>

        {/* Interview Pipeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Interview Pipeline</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Ongoing r1"
              value={metrics.ongoing_r1}
              description="Technical Screen in progress"
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Ongoing r2"
              value={metrics.ongoing_r2}
              description="Technical + Behavioral in progress"
              icon={Users}
              color="orange"
            />
            <MetricCard
              title="Ongoing r3"
              value={metrics.ongoing_r3}
              description="Manager Interview in progress"
              icon={Users}
              color="green"
            />
          </div>
        </div>

        {/* Performance & Hiring */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance & Hiring Metrics</h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {hrUsers.map(user => (
                    <SelectItem key={user._id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Successful Hires"
              value={metrics.successful_hires}
              description="This month"
              icon={CheckCircle}
              trend={{ value: 25, label: "vs last month" }}
              color="green"
            />
            <MetricCard
              title="Interview-to-Offer Rate"
              value={`${metrics.interview_to_offer_rate}%`}
              description="Conversion efficiency"
              icon={TrendingUp}
              color="blue"
            />
            <MetricCard
              title="Avg. Time to Hire"
              value={`${metrics.avg_time_to_hire} days`}
              description="From application to offer"
              icon={Calendar}
              color="gray"
            />
            <MetricCard
              title="Panelist Rating"
              value={`${metrics.panelist_rating}/5`}
              description="Average panelist feedback score"
              icon={MessageSquare}
              trend={{ value: 8, label: "improvement" }}
              color="green"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
