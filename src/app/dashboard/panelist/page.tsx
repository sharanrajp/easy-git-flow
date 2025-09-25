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
import { AssignedCandidateDetails } from "../../../components/candidates/assigned-candidate-details"

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

  // Convert PanelistCandidate to BackendCandidate format for the details component
  const convertToBackendCandidate = (candidate: PanelistCandidate): any => {
    return {
      ...candidate,
      applied_position: candidate.applied_position || "N/A",
      final_status: "assigned",
      total_experience: candidate.total_experience,
      source: undefined,
      appliedDate: undefined,
      created_at: candidate.created_at,
      recruiter: undefined,
      assignedPanelist: undefined,
      panel_name: undefined,
      currentRound: candidate.last_interview_round,
      last_interview_round: candidate.last_interview_round,
      interviewDateTime: undefined,
      waitTime: null,
      waitTimeStarted: null,
      isCheckedIn: false,
      interview_type: candidate.interview_type,
      notice_period: candidate.notice_period,
      current_ctc: candidate.current_ctc,
      expected_ctc: candidate.expected_ctc,
      willing_to_relocate: candidate.willing_to_relocate,
      previous_rounds: candidate.previous_rounds?.map(round => ({
        round: round.round,
        status: round.status,
        feedback_submitted: round.feedback_submitted,
        rating: round.rating?.toString(),
        feedback: round.feedback,
        panel_name: round.panel_name, // Default since not in PanelistCandidate
        panel_email: undefined,
        communication: round?.communication,
        problem_solving: round?.problem_solving,
        logical_thinking: round?.logical_thinking,
        code_quality: round?.code_quality,
        technical_knowledge: round?.technical_knowledge,
      })) || []
    }
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
    let filteredCandidates = candidates

    switch (performanceFilter) {
      case "today":
        filteredCandidates = candidates.filter((candidate) => {
          if (!candidate.created_at) return false
          const candidateDate = new Date(candidate.created_at)
          return candidateDate.toDateString() === now.toDateString()
        })
        break
      case "yesterday":
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        filteredCandidates = candidates.filter((candidate) => {
          if (!candidate.created_at) return false
          const candidateDate = new Date(candidate.created_at)
          return candidateDate.toDateString() === yesterday.toDateString()
        })
        break
      case "this-week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        filteredCandidates = candidates.filter((candidate) => {
          if (!candidate.created_at) return false
          const candidateDate = new Date(candidate.created_at)
          return candidateDate >= weekStart
        })
        break
      case "this-month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        filteredCandidates = candidates.filter((candidate) => {
          if (!candidate.created_at) return false
          const candidateDate = new Date(candidate.created_at)
          return candidateDate >= monthStart
        })
        break
      default:
        filteredCandidates = candidates
    }

    // Calculate metrics from real candidate data
    const completedInterviewsCount = filteredCandidates.filter(candidate => 
      candidate.previous_rounds && candidate.previous_rounds.some((round: any) => round.feedback_submitted === true)
    ).length

    const selectedCount = filteredCandidates.filter(candidate =>
      candidate.previous_rounds && candidate.previous_rounds.some((round: any) => round.status === "selected")
    ).length

    const rejectedCount = filteredCandidates.filter(candidate =>
      candidate.previous_rounds && candidate.previous_rounds.some((round: any) => round.status === "rejected")
    ).length

    return {
      completedInterviews: completedInterviewsCount,
      selectedCount: selectedCount,
      rejectedCount: rejectedCount,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              title="Rejected Candidates"
              value={metrics.rejectedCount}
              description="Candidates rejected"
              icon={Timer}
              color="red"
            />
          </div>
        </div>
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

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
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledInterviews.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedCandidateInterviews.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                      <div>Problem Solving: {viewingFeedbackSession.feedback.detailedRatings?.problem_solving || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Communication: {viewingFeedbackSession.feedback.detailedRatings?.communication || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Code Quality: {viewingFeedbackSession.feedback.detailedRatings?.code_quality || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
                      <div>Technical Knowledge: {viewingFeedbackSession.feedback.detailedRatings?.technical_knowledge || viewingFeedbackSession.feedback.rating}/5 ⭐</div>
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
        <AssignedCandidateDetails
          candidate={viewingCandidate ? convertToBackendCandidate(viewingCandidate) : null}
          isOpen={showCandidateFeedback}
          onClose={() => setShowCandidateFeedback(false)}
        />
      </div>
    </DashboardLayout>
  )
}