// @ts-nocheck

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  FileText,
  Star,
  Timer,
  Filter,
} from "lucide-react"
import { getPanelistDashboardData } from "@/lib/panelist-data"
import {
  getInterviewSessionsForPanelist,
  startInterview,
  getCandidateDetails,
  type InterviewSession,
} from "@/lib/interview-data"
import { getCurrentUser } from "@/lib/auth"
import { useEffect, useState } from "react"
import { FeedbackDialog } from "@/components/panelist/feedback-dialog"
import { formatDate } from "@/lib/utils"

export default function PanelistDashboard() {
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [completedInterviews, setCompletedInterviews] = useState<InterviewSession[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)
  const [interviewTimers, setInterviewTimers] = useState<Record<string, number>>({})
  const [showViewFeedback, setShowViewFeedback] = useState(false)
  const [viewingFeedbackSession, setViewingFeedbackSession] = useState<InterviewSession | null>(null)
  const [performanceFilter, setPerformanceFilter] = useState<string>("this-month")
  const itemsPerPage = 5

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    if (currentUser?.name) {
      const sessions = getInterviewSessionsForPanelist(currentUser.name)
      const scheduled = sessions.filter(
        (s) => s.status === "scheduled" || s.status === "in-progress" || s.status === "paused",
      )
      const completed = sessions.filter((s) => s.status === "completed")

      setInterviewSessions(scheduled)
      setCompletedInterviews(completed)
    }
  }, [currentUser?.name])

  useEffect(() => {
    const interval = setInterval(() => {
      setInterviewTimers((prev) => {
        const updated = { ...prev }
        interviewSessions.forEach((session) => {
          if (session.status === "in-progress") {
            updated[session.id] = (updated[session.id] || 0) + 1
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [interviewSessions])

  useEffect(() => {
    const handleInterviewUpdate = (event: CustomEvent) => {
      const updatedSession = event.detail as InterviewSession
      if (updatedSession.panelistName === currentUser?.name) {
        if (updatedSession.status === "completed") {
          setCompletedInterviews((prev) => {
            const exists = prev.find((s) => s.id === updatedSession.id)
            if (!exists) {
              return [updatedSession, ...prev]
            }
            return prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
          })
          setInterviewSessions((prev) => prev.filter((s) => s.id !== updatedSession.id))
          setInterviewTimers((prev) => {
            const updated = { ...prev }
            delete updated[updatedSession.id]
            return updated
          })
        } else {
          setInterviewSessions((prev) => {
            const updated = [...prev]
            const index = updated.findIndex((s) => s.id === updatedSession.id)
            if (index >= 0) {
              updated[index] = updatedSession
            } else {
              updated.push(updatedSession)
            }
            return updated
          })
        }
      }
    }

    window.addEventListener("interviewSessionUpdated", handleInterviewUpdate as EventListener)
    return () => window.removeEventListener("interviewSessionUpdated", handleInterviewUpdate as EventListener)
  }, [currentUser?.name])

  const handleStartInterview = (sessionId: string) => {
    setInterviewTimers((prev) => ({ ...prev, [sessionId]: 0 }))
    startInterview(sessionId)
  }

  const handleEndWithFeedback = (session: InterviewSession) => {
    setSelectedSession(session)
    setShowFeedbackDialog(true)
  }

  const handleFeedbackSubmit = () => {
    if (currentUser?.name) {
      const sessions = getInterviewSessionsForPanelist(currentUser.name)
      const scheduled = sessions.filter(
        (s) => s.status === "scheduled" || s.status === "in-progress" || s.status === "paused",
      )
      const completed = sessions.filter((s) => s.status === "completed")

      setInterviewSessions(scheduled)
      setCompletedInterviews(completed)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleViewResume = (candidateId: string) => {
    const candidateDetails = getCandidateDetails(candidateId)
    if (candidateDetails?.resumeUrl) {
      window.open(candidateDetails.resumeUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleViewFeedback = (session: InterviewSession) => {
    setViewingFeedbackSession(session)
    setShowViewFeedback(true)
  }

  const data = getPanelistDashboardData()

  const getMetricsForPanelistType = () => {
    const now = new Date()
    let filteredInterviews = completedInterviews

    switch (performanceFilter) {
      case "today":
        filteredInterviews = completedInterviews.filter((session) => {
          const sessionDate = new Date(session.scheduledTime)
          return sessionDate.toDateString() === now.toDateString()
        })
        break
      case "yesterday":
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        filteredInterviews = completedInterviews.filter((session) => {
          const sessionDate = new Date(session.scheduledTime)
          return sessionDate.toDateString() === yesterday.toDateString()
        })
        break
      case "this-week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        filteredInterviews = completedInterviews.filter((session) => {
          const sessionDate = new Date(session.scheduledTime)
          return sessionDate >= weekStart
        })
        break
      case "this-month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        filteredInterviews = completedInterviews.filter((session) => {
          const sessionDate = new Date(session.scheduledTime)
          return sessionDate >= monthStart
        })
        break
      default:
        filteredInterviews = completedInterviews
    }

    const avgDuration =
      filteredInterviews.length > 0
        ? Math.round(
            filteredInterviews.reduce((sum, session) => sum + (session.elapsedTime || 60), 0) /
              filteredInterviews.length,
          )
        : 0

    const isDummyData = filteredInterviews.length === 0 && currentUser?.name === "Mike Chen"

    if (isDummyData) {
      // Return dummy metrics based on filter period
      switch (performanceFilter) {
        case "today":
          return {
            completedInterviews: 2,
            averageDuration: 45,
            selectedCount: 1,
          }
        case "yesterday":
          return {
            completedInterviews: 3,
            averageDuration: 52,
            selectedCount: 2,
          }
        case "this-week":
          return {
            completedInterviews: 8,
            averageDuration: 48,
            selectedCount: 5,
          }
        case "this-month":
          return {
            completedInterviews: 15,
            averageDuration: 50,
            selectedCount: 9,
          }
        default:
          return {
            completedInterviews: 15,
            averageDuration: 50,
            selectedCount: 9,
          }
      }
    }

    return {
      completedInterviews: filteredInterviews.length,
      averageDuration: avgDuration,
      selectedCount: filteredInterviews.filter((session) => session.feedback?.decision === "selected").length,
    }
  }

  const metrics = getMetricsForPanelistType()

  const getPanelistStatus = () => {
    const hasInProgressInterview = interviewSessions.some((session) => session.status === "in-progress")
    if (hasInProgressInterview) return { status: "In Interview", color: "bg-orange-100 text-orange-800" }

    return { status: "Available", color: "bg-green-100 text-green-800" }
  }

  const panelistStatus = getPanelistStatus()

  const totalPages = Math.ceil(completedInterviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCompletedInterviews = completedInterviews.slice(startIndex, startIndex + itemsPerPage)

  const MetricCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "blue",
  }: {
    title: string
    value: string | number
    description?: string
    icon: any
    trend?: { value: number; label: string }
    color?: "blue" | "green" | "orange" | "red" | "gray" | "purple"
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      orange: "bg-orange-50 text-orange-600",
      red: "bg-red-50 text-red-600",
      gray: "bg-gray-50 text-gray-600",
      purple: "bg-purple-50 text-purple-600",
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
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

  const CandidateCard = ({ session }: { session: InterviewSession }) => {
    const candidateDetails = getCandidateDetails(session.candidateId)
    const currentTimer = interviewTimers[session.id] || 0

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{session.candidateName}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {session.round}
                  </Badge>
                  <Badge
                    className={
                      session.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : session.status === "in-progress"
                          ? "bg-orange-100 text-orange-800"
                          : session.status === "paused"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                    }
                  >
                    {session.status === "in-progress" ? "In Progress" : session.status}
                  </Badge>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(session.scheduledTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(session.scheduledTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-base font-medium text-gray-800">{session.position}</p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {candidateDetails?.skills?.slice(0, 3).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidateDetails?.skills?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidateDetails.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Experience:</span>
                    <span className="text-sm text-gray-600">{candidateDetails?.experience || "N/A"}</span>
                  </div>
                </div>
              </div>

              {session.status === "in-progress" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Interview in Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-lg font-mono font-bold text-orange-800">{formatTimer(currentTimer)}</span>
                    </div>
                  </div>
                </div>
              )}

              {session.status === "paused" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Pause className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Interview Paused - Timer Stopped</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ml-6 flex flex-col space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </Button>
              {session.status === "scheduled" && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStartInterview(session.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview
                </Button>
              )}
              {session.status === "in-progress" && (
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleEndWithFeedback(session)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  End with Feedback
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout requiredRole="panelist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentUser?.panelist_type === "manager" ? "Manager Dashboard" : "Panelist Dashboard"}
            </h1>
            <p className="text-gray-600">
              {currentUser?.panelist_type === "manager"
                ? "Manage your team and oversee interview processes."
                : "Welcome back! Here's your interview schedule and performance."}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Completed Interviews"
              value={metrics.completedInterviews}
              description="Total completed"
              icon={CheckCircle}
              color="blue"
            />
            <MetricCard
              title="Selected Candidates"
              value={metrics.selectedCount}
              description="Successfully selected"
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Average Duration"
              value={metrics.averageDuration > 0 ? `${metrics.averageDuration}m` : "0m"}
              description="Per interview"
              icon={Clock}
              color="purple"
            />
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Status</p>
                    <Badge className={`mt-2 ${panelistStatus.color}`}>{panelistStatus.status}</Badge>
                    <p className="text-sm text-gray-500 mt-1">Real-time status</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Scheduled Interview
          </h2>
          <div className="space-y-4">
            {interviewSessions.slice(0, 1).map((session) => (
              <CandidateCard key={session.id} session={session} />
            ))}
            {interviewSessions.length === 0 && (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No interviews scheduled</p>
                    <p className="text-sm">You'll see your next interview here when it's assigned.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed Interviews
              </div>
              {completedInterviews.length > itemsPerPage && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompletedInterviews.map((session) => {
                  const candidateDetails = getCandidateDetails(session.candidateId)
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.candidateName}</TableCell>
                      <TableCell>{session.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.round}</Badge>
                      </TableCell>
                      <TableCell>{candidateDetails?.experience || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidateDetails?.skills?.slice(0, 2).map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidateDetails?.skills?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{candidateDetails.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(session.scheduledTime)}</div>
                          <div className="text-gray-500">{new Date(session.scheduledTime).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>{session.elapsedTime ? `${Math.floor(session.elapsedTime / 60)}m` : "60m"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            session.feedback?.decision === "selected"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {session.feedback?.decision === "selected" ? "Selected" : "Rejected"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewResume(session.candidateId)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Resume
                          </Button>
                          {session.feedback && (
                            <Button size="sm" variant="outline" onClick={() => handleViewFeedback(session)}>
                              <Star className="h-4 w-4 mr-1" />
                              View Feedback
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {completedInterviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">No completed interviews yet</div>
            )}
          </CardContent>
        </Card>

        {selectedSession && (
          <FeedbackDialog
            isOpen={showFeedbackDialog}
            onClose={() => setShowFeedbackDialog(false)}
            session={selectedSession}
            onSubmit={handleFeedbackSubmit}
          />
        )}

        {viewingFeedbackSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Interview Feedback Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowViewFeedback(false)
                      setViewingFeedbackSession(null)
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <span className="text-xl">×</span>
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Candidate Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Candidate Name</p>
                        <p className="text-base text-gray-900 font-medium">{viewingFeedbackSession.candidateName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Position Applied</p>
                        <p className="text-base text-gray-900">{viewingFeedbackSession.position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interview Round</p>
                        <Badge variant="outline" className="mt-1">
                          {viewingFeedbackSession.round}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Final Decision</p>
                        <Badge
                          className={`mt-1 ${
                            viewingFeedbackSession.feedback?.decision === "selected"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {viewingFeedbackSession.feedback?.decision === "selected" ? "Selected" : "Rejected"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {viewingFeedbackSession.feedback && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Rating Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm font-medium text-gray-700 mb-2">Problem Solving</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= (viewingFeedbackSession.feedback?.detailedRatings?.problemSolving || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {viewingFeedbackSession.feedback?.detailedRatings?.problemSolving || 0}/5
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm font-medium text-gray-700 mb-2">Communication</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= (viewingFeedbackSession.feedback?.detailedRatings?.communication || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {viewingFeedbackSession.feedback?.detailedRatings?.communication || 0}/5
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm font-medium text-gray-700 mb-2">Code Quality</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= (viewingFeedbackSession.feedback?.detailedRatings?.codeQuality || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {viewingFeedbackSession.feedback?.detailedRatings?.codeQuality || 0}/5
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm font-medium text-gray-700 mb-2">Technical Knowledge</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= (viewingFeedbackSession.feedback?.detailedRatings?.technicalKnowledge || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {viewingFeedbackSession.feedback?.detailedRatings?.technicalKnowledge || 0}/5
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm font-medium text-gray-700 mb-2">Teamwork</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= (viewingFeedbackSession.feedback?.detailedRatings?.teamwork || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {viewingFeedbackSession.feedback?.detailedRatings?.teamwork || 0}/5
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-3 border-2 border-blue-200">
                          <p className="text-sm font-medium text-blue-800 mb-2">Overall Average</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-6 w-6 ${
                                    star <= (viewingFeedbackSession.feedback?.rating || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-lg font-bold text-blue-900">
                              {viewingFeedbackSession.feedback?.rating || 0}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewingFeedbackSession.feedback?.notes && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Detailed Feedback Comments</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {viewingFeedbackSession.feedback.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Interview Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interview Date</p>
                        <p className="text-base text-gray-900">
                          {formatDate(viewingFeedbackSession.scheduledTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interview Time</p>
                        <p className="text-base text-gray-900">
                          {new Date(viewingFeedbackSession.scheduledTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Duration</p>
                        <p className="text-base text-gray-900">
                          {viewingFeedbackSession.elapsedTime
                            ? `${Math.floor(viewingFeedbackSession.elapsedTime / 60)} minutes`
                            : "60 minutes"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Feedback Submitted</p>
                        <p className="text-base text-gray-900">
                          {viewingFeedbackSession.feedback?.submittedAt
                            ? new Date(viewingFeedbackSession.feedback.submittedAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
