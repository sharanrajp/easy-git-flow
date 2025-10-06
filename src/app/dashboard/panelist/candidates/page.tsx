import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, ExternalLink, FileText, Users, Clock, CheckCircle } from "lucide-react"
import { fetchPanelistAssignedCandidates, type PanelistCandidate } from "../../../../lib/candidates-api"
import { useToast } from "@/hooks/use-toast"
import { AssignedCandidateDetails } from "../../../../components/candidates/assigned-candidate-details"

export default function PanelistCandidatesPage() {
  const [candidates, setCandidates] = useState<PanelistCandidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<PanelistCandidate | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  // Check if the logged-in panelist has completed feedback for current round
  const hasFeedbackCompleted = (candidate: PanelistCandidate) => {
    if (!candidate.previous_rounds || candidate.previous_rounds.length === 0) return false
    
    // Get current user's name from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const currentPanelistName = currentUser.name
    
    // Find the round that matches the current interview round AND was assigned to this panelist
    const currentRound = candidate.previous_rounds.find((round: any) => 
      round.round === candidate.last_interview_round && 
      round.panel_name === currentPanelistName
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
  const completedInterviews = filteredCandidates.filter(candidate => hasFeedbackCompleted(candidate))

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

  // Convert PanelistCandidate to BackendCandidate format for the details component
  const convertToBackendCandidate = (candidate: PanelistCandidate): any => {
    return {
      ...candidate,
      applied_position: candidate.applied_position || "N/A",
      final_status: "assigned",
      total_experience: candidate.total_experience,
      created_at: candidate?.created_at,
      recruiter_name: candidate?.recruiter_name || "Unknown",
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

  return (
    <DashboardLayout requiredRole="panelist">
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
              Completed Interviews ({completedInterviews.length})
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
                {isLoading ? (
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
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Start Interview
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
                {isLoading ? (
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
                        <TableHead>Skill Set</TableHead>
                        <TableHead>Interview Round</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedInterviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No completed interviews found
                          </TableCell>
                        </TableRow>
                      ) : (
                        completedInterviews.map((candidate) => (
                          <TableRow key={candidate._id}>
                            <TableCell className="font-medium">
                              {candidate.register_number}
                            </TableCell>
                            <TableCell>{candidate.name}</TableCell>
                            <TableCell>{candidate.email}</TableCell>
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
                                variant="default"
                                size="sm"
                                onClick={() => handleViewDetails(candidate)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
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

        {/* Candidate Details Dialog */}
        <AssignedCandidateDetails
          candidate={selectedCandidate ? convertToBackendCandidate(selectedCandidate) : null}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />

        {/* Candidate Details Popover */}
        <Popover open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <PopoverContent className="w-[800px] max-h-[600px] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Candidate Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  ✕
                </Button>
              </div>
              
              {selectedCandidate && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                      <p className="text-sm">{selectedCandidate.register_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm">{selectedCandidate.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{selectedCandidate.email}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Skill Set</label>
                      <p className="text-sm">{selectedCandidate.skill_set}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Round</label>
                      <p className="text-sm">{selectedCandidate.last_interview_round || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resume</label>
                      {selectedCandidate.resume_link ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(selectedCandidate.resume_link, '_blank')}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Resume
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">Resume Not Found</p>
                      )}
                    </div>
                  </div>

                  {/* Previous Rounds */}
                  <div>
                    <h4 className="text-md font-semibold mb-4">Previous Interview Rounds</h4>
                    {selectedCandidate.previous_rounds && selectedCandidate.previous_rounds.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCandidate.previous_rounds.map((round: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Round</label>
                                  <p className="text-sm">{round.round}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                                  <Badge variant="outline" className="ml-2">{round.status}</Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Feedback Status</label>
                                  <Badge variant={round.feedback_submitted ? "default" : "secondary"} className="ml-2">
                                    {round.feedback_submitted ? "Completed" : "Pending"}
                                  </Badge>
                                </div>
                                {round.rating && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Rating</label>
                                    <p className="text-sm">{round.rating}/5</p>
                                  </div>
                                )}
                              </div>
                              
                              {round.feedback && (
                                <div className="mb-4">
                                  <label className="text-sm font-medium text-muted-foreground">Feedback</label>
                                  <p className="text-sm mt-1">{round.feedback}</p>
                                </div>
                              )}

                              {round && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Scores</label>
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {round.communication && (
                                      <div className="text-xs">
                                        <span className="font-medium">Communication:</span> {round.communication}/5
                                      </div>
                                    )}
                                    {round.problem_solving && (
                                      <div className="text-xs">
                                        <span className="font-medium">Problem Solving:</span> {round.problem_solving}/5
                                      </div>
                                    )}
                                    {round.logical_thinking && (
                                      <div className="text-xs">
                                        <span className="font-medium">Logical Thinking:</span> {round.logical_thinking}/5
                                      </div>
                                    )}
                                    {round.code_quality && (
                                      <div className="text-xs">
                                        <span className="font-medium">Code Quality:</span> {round.code_quality}/5
                                      </div>
                                    )}
                                    {round.technical_knowledge && (
                                      <div className="text-xs">
                                        <span className="font-medium">Technical Knowledge:</span> {round.technical_knowledge}/5
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No previous interview rounds found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </DashboardLayout>
  )
}
