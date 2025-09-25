import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
  Search,
  Eye,
  ExternalLink,
} from "lucide-react"
import { getPanelistDashboardData } from "@/lib/panelist-data"
import {
  getInterviewSessionsForPanelist,
  startInterview,
  getCandidateDetails,
  type InterviewSession,
} from "@/lib/interview-data"
import { getCurrentUser } from "@/lib/auth"
import { useEffect, useState, useCallback, useMemo } from "react"
import { FeedbackDialog } from "@/components/panelist/feedback-dialog"
import { ScheduledFeedbackDialog } from "@/components/panelist/scheduled-feedback-dialog"
import { formatDate } from "@/lib/utils"
import { fetchPanelistAssignedCandidates, type PanelistCandidate } from "@/lib/candidates-api"
import { useToast } from "@/hooks/use-toast"

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
  const [showCandidateFeedback, setShowCandidateFeedback] = useState(false)
  const [viewingCandidate, setViewingCandidate] = useState<PanelistCandidate | null>(null)
  const [showScheduledFeedback, setShowScheduledFeedback] = useState(false)
  const [selectedScheduledCandidate, setSelectedScheduledCandidate] = useState<PanelistCandidate | null>(null)
  const [performanceFilter, setPerformanceFilter] = useState<string>("this-month")
  
  // Candidates state
  const [candidates, setCandidates] = useState<PanelistCandidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<PanelistCandidate | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(true)
  
  const itemsPerPage = 5
  const { toast } = useToast()

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    if (user) {
      loadCandidates()
    }
  }, [])

  const loadCandidates = useCallback(async () => {
    try {
      setIsCandidatesLoading(true)
      const data = await fetchPanelistAssignedCandidates()
      setCandidates(data)
    } catch (error) {
      console.error('Error loading candidates:', error)
      toast({
        title: "Error",
        description: "Failed to load assigned candidates",
        variant: "destructive",
      })
    } finally {
      setIsCandidatesLoading(false)
    }
  }, [toast])

  // Check if candidate has completed feedback for current round
  const hasFeedbackCompleted = (candidate: PanelistCandidate) => {
    if (!candidate.previous_rounds || candidate.previous_rounds.length === 0) return false
    
    // Find the most recent round that matches the current interview round
    const currentRound = candidate.previous_rounds.find((round: any) => 
      round.round === candidate.last_interview_round
    )
    
    return currentRound?.feedback_submitted === true
  }

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.register_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.skill_set && Array.isArray(candidate.skill_set) && 
       candidate.skill_set.some((skill: string) => 
         skill.toLowerCase().includes(searchTerm.toLowerCase())
       ))
  )

  const scheduledInterviews = filteredCandidates.filter(candidate => !hasFeedbackCompleted(candidate))
  const completedCandidateInterviews = filteredCandidates.filter(candidate => hasFeedbackCompleted(candidate))

  const formatPhoneNumber = (phone_number: string | undefined) => {
    if (!phone_number) return "N/A"
    return String(phone_number) // Convert to string to avoid scientific notation
  }

  const getPreviousRoundsText = (rounds: PanelistCandidate['previous_rounds']) => {
    if (!rounds || rounds.length === 0) return "No Previous Rounds"
    
    const completedCount = rounds.filter((r: any) => r.feedback_submitted).length
    const totalCount = rounds.length
    
    return `View ${totalCount} Round(s) Feedback (${completedCount}/${totalCount} Completed)`
  }

  const handleViewDetails = (candidate: PanelistCandidate) => {
    setSelectedCandidate(candidate)
    setIsDetailsOpen(true)
  }

  const handleViewCandidateFeedback = (candidate: PanelistCandidate) => {
    setViewingCandidate(candidate)
    setShowCandidateFeedback(true)
  }

  const handleScheduledFeedbackClose = useCallback(() => {
    setShowScheduledFeedback(false)
    setSelectedScheduledCandidate(null)
  }, [])

  const handleScheduledFeedback = useCallback((candidate: PanelistCandidate) => {
    setSelectedScheduledCandidate(candidate)
    setShowScheduledFeedback(true)
  }, [])

  const handleScheduledFeedbackSubmit = useCallback(() => {
    loadCandidates() // Refresh the candidates list
    handleScheduledFeedbackClose()
  }, [loadCandidates, handleScheduledFeedbackClose])

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
    if (candidateDetails?.resume) {
      window.open(candidateDetails.resume, "_blank", "noopener,noreferrer")
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

        {/* Interview Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{scheduledInterviews.length}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCandidateInterviews.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interview Tabs */}
          <Tabs defaultValue="scheduled" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled Interviews ({scheduledInterviews.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed Interviews ({completedCandidateInterviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Scheduled Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCandidatesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading candidates...</div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reg. No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Skill Set</TableHead>
                          <TableHead>Interview Round</TableHead>
                          <TableHead>Resume</TableHead>
                          <TableHead>Previous Rounds</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledInterviews.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No scheduled interviews found
                            </TableCell>
                          </TableRow>
                        ) : (
                          scheduledInterviews.map((candidate) => (
                            <TableRow key={candidate._id}>
                              <TableCell className="font-medium">
                                {candidate.register_number}
                              </TableCell>
                              <TableCell>{candidate.name}</TableCell>
                              <TableCell>{candidate.email}</TableCell>
                              <TableCell>{formatPhoneNumber(candidate.phone_number)}</TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={Array.isArray(candidate.skill_set) ? candidate.skill_set.join(", ") : candidate.skill_set}>
                                  {Array.isArray(candidate.skill_set) ? candidate.skill_set.join(", ") : candidate.skill_set}
                                </div>
                              </TableCell>
                              <TableCell>
                                {candidate.last_interview_round ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {candidate.last_interview_round}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {candidate.resume_link ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(candidate.resume_link, '_blank')}
                                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Resume
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Resume Not Found</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(candidate)}
                                  className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
                                >
                                  {getPreviousRoundsText(candidate.previous_rounds)}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleScheduledFeedback(candidate)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Feedback
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Completed Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCandidatesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading candidates...</div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reg. No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Skill Set</TableHead>
                          <TableHead>Interview Round</TableHead>
                          <TableHead>Resume</TableHead>
                          <TableHead>Previous Rounds</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedCandidateInterviews.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No completed interviews found
                            </TableCell>
                          </TableRow>
                        ) : (
                          completedCandidateInterviews.map((candidate) => (
                            <TableRow key={candidate._id}>
                              <TableCell className="font-medium">
                                {candidate.register_number}
                              </TableCell>
                              <TableCell>{candidate.name}</TableCell>
                              <TableCell>{candidate.email}</TableCell>
                              <TableCell>{formatPhoneNumber(candidate.phone_number)}</TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={Array.isArray(candidate.skill_set) ? candidate.skill_set.join(", ") : candidate.skill_set}>
                                  {Array.isArray(candidate.skill_set) ? candidate.skill_set.join(", ") : candidate.skill_set}
                                </div>
                              </TableCell>
                              <TableCell>
                                {candidate.last_interview_round ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {candidate.last_interview_round}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {candidate.resume_link ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(candidate.resume_link, '_blank')}
                                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Resume
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Resume Not Found</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(candidate)}
                                  className="text-green-600 hover:text-green-800 border-green-200 hover:bg-green-50"
                                >
                                  {getPreviousRoundsText(candidate.previous_rounds)}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleViewCandidateFeedback(candidate)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Feedback
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Candidate Details Popover */}
        <Popover open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <PopoverContent className="w-96">
            {selectedCandidate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedCandidate.name}</h3>
                  <Badge className="bg-blue-100 text-blue-800">{selectedCandidate.register_number}</Badge>
                </div>
                
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {selectedCandidate.email}</p>
                  <p><span className="font-medium">Phone:</span> {formatPhoneNumber(selectedCandidate.phone_number)}</p>
                  <p><span className="font-medium">Skills:</span> {Array.isArray(selectedCandidate.skill_set) ? selectedCandidate.skill_set.join(", ") : selectedCandidate.skill_set}</p>
                  <p><span className="font-medium">Current Round:</span> {selectedCandidate.last_interview_round || "N/A"}</p>
                </div>

                {selectedCandidate.previous_rounds && selectedCandidate.previous_rounds.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Previous Rounds:</h4>
                    <div className="space-y-1">
                      {selectedCandidate.previous_rounds.map((round: any, index: number) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{round.round}</span>
                            <Badge variant={round.feedback_submitted ? "default" : "secondary"}>
                              {round.status}
                            </Badge>
                          </div>
                          {round.feedback_submitted && (
                            <div className="mt-1 text-xs text-gray-600">
                              <p>Rating: {round.rating || "N/A"}</p>
                              {round.feedback && <p>Feedback: {round.feedback}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Feedback Dialog */}
        {selectedSession && (
          <FeedbackDialog
            isOpen={showFeedbackDialog}
            onClose={() => setShowFeedbackDialog(false)}
            session={selectedSession}
            onSubmit={handleFeedbackSubmit}
          />
        )}

        {/* Enhanced Scheduled Feedback Dialog */}
        {selectedScheduledCandidate && (
          <ScheduledFeedbackDialog 
            isOpen={showScheduledFeedback}
            onClose={handleScheduledFeedbackClose}
            candidate={selectedScheduledCandidate}
            onSubmit={handleScheduledFeedbackSubmit}
          />
        )}

        {/* View Feedback Modal */}
        {showViewFeedback && viewingFeedbackSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Interview Feedback</h2>
                <Button variant="outline" onClick={() => setShowViewFeedback(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p><strong>Candidate:</strong> {viewingFeedbackSession.candidateName}</p>
                  <p><strong>Position:</strong> {viewingFeedbackSession.position}</p>
                  <p><strong>Round:</strong> {viewingFeedbackSession.round}</p>
                  <p><strong>Date:</strong> {formatDate(viewingFeedbackSession.scheduledTime)}</p>
                </div>
                
                {viewingFeedbackSession.feedback && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Ratings:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Problem Solving: {viewingFeedbackSession.feedback.detailedRatings?.problemSolving || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Communication: {viewingFeedbackSession.feedback.detailedRatings?.communication || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Code Quality: {viewingFeedbackSession.feedback.detailedRatings?.codeQuality || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Technical Knowledge: {viewingFeedbackSession.feedback.detailedRatings?.technicalKnowledge || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Teamwork: {viewingFeedbackSession.feedback.detailedRatings?.teamwork || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Decision:</h3>
                      <Badge className={viewingFeedbackSession.feedback.decision === "selected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {viewingFeedbackSession.feedback.decision === "selected" ? "Selected" : "Rejected"}
                      </Badge>
                    </div>
                    
                    {viewingFeedbackSession.feedback.notes && (
                      <div>
                        <h3 className="font-medium">Comments:</h3>
                        <p className="text-sm bg-gray-50 p-3 rounded">{viewingFeedbackSession.feedback.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Candidate Feedback Modal */}
        {showCandidateFeedback && viewingCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Interview Feedback History</h2>
                <Button variant="outline" onClick={() => setShowCandidateFeedback(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Candidate Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Name:</strong> {viewingCandidate.name}</p>
                    <p><strong>Email:</strong> {viewingCandidate.email}</p>
                    <p><strong>Registration No:</strong> {viewingCandidate.register_number}</p>
                    <p><strong>Phone:</strong> {formatPhoneNumber(viewingCandidate.phone_number)}</p>
                    <p><strong>Skills:</strong> {Array.isArray(viewingCandidate.skill_set) ? viewingCandidate.skill_set.join(", ") : viewingCandidate.skill_set}</p>
                    <p><strong>Current Round:</strong> {viewingCandidate.last_interview_round || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Interview Rounds History</h3>
                  {viewingCandidate.previous_rounds && viewingCandidate.previous_rounds.length > 0 ? (
                    <div className="space-y-4">
                      {viewingCandidate.previous_rounds.map((round: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-lg">{round.round}</h4>
                              <Badge variant={round.feedback_submitted ? "default" : "secondary"} className={
                                round.status === "selected" ? "bg-green-100 text-green-800" : 
                                round.status === "rejected" ? "bg-red-100 text-red-800" : 
                                "bg-yellow-100 text-yellow-800"
                              }>
                                {round.status}
                              </Badge>
                              {round.feedback_submitted && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Feedback Submitted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {round.feedback_submitted && (
                            <div className="space-y-3">
                              {round.rating && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Overall Rating:</p>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-gray-900">{round.rating}/5</span>
                                    <div className="flex space-x-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-4 w-4 ${
                                            star <= round.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {round.scores && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">Detailed Scores:</p>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    {round.scores.communication && (
                                      <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-medium">Communication:</span> {round.scores.communication}/5
                                      </div>
                                    )}
                                    {round.scores.problem_solving && (
                                      <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-medium">Problem Solving:</span> {round.scores.problem_solving}/5
                                      </div>
                                    )}
                                    {round.scores.logical_thinking && (
                                      <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-medium">Logical Thinking:</span> {round.scores.logical_thinking}/5
                                      </div>
                                    )}
                                    {round.scores.code_quality && (
                                      <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-medium">Code Quality:</span> {round.scores.code_quality}/5
                                      </div>
                                    )}
                                    {round.scores.technical_knowledge && (
                                      <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-medium">Technical Knowledge:</span> {round.scores.technical_knowledge}/5
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {round.feedback && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Feedback Comments:</p>
                                  <p className="text-sm bg-gray-50 p-3 rounded border">{round.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {!round.feedback_submitted && (
                            <div className="text-center py-4 text-gray-500">
                              <p className="text-sm">No feedback submitted for this round yet</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No interview rounds found for this candidate</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}