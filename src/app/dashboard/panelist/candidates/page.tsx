import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Search, Eye, ExternalLink, FileText, Users } from "lucide-react"
import { fetchPanelistAssignedCandidates, type PanelistCandidate } from "../../../../lib/candidates-api"
import { useToast } from "@/hooks/use-toast"

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

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.register_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skill_set,
  )

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

  return (
    <DashboardLayout requiredRole="panelist">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assigned Candidates</h1>
            <p className="text-gray-600">Candidates assigned to you for interviews</p>
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

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Candidates ({filteredCandidates.length})</CardTitle>
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
                    <TableHead>Phone</TableHead>
                    <TableHead>Skill Set</TableHead>
                    <TableHead>Current Interview Round</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Previous Rounds</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No assigned candidates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <TableRow key={candidate._id}>
                        <TableCell className="font-medium">
                          {candidate.register_number}
                        </TableCell>
                        <TableCell>{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{formatPhoneNumber(candidate.phone_number)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={candidate.skill_set?.join(", ")}>
                            {candidate.skill_set?.join(", ")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidate.last_interview_round ? (
                            <Badge variant="outline">{candidate.last_interview_round}</Badge>
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
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(candidate)}
                            className="p-0 h-auto text-purple-600 hover:text-purple-800"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            {getPreviousRoundsText(candidate.previous_rounds)}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-muted-foreground"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Add Feedback
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
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm">{formatPhoneNumber(selectedCandidate.phone_number)}</p>
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

                              {round.scores && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Scores</label>
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {round.scores.communication && (
                                      <div className="text-xs">
                                        <span className="font-medium">Communication:</span> {round.scores.communication}/5
                                      </div>
                                    )}
                                    {round.scores.problem_solving && (
                                      <div className="text-xs">
                                        <span className="font-medium">Problem Solving:</span> {round.scores.problem_solving}/5
                                      </div>
                                    )}
                                    {round.scores.logical_thinking && (
                                      <div className="text-xs">
                                        <span className="font-medium">Logical Thinking:</span> {round.scores.logical_thinking}/5
                                      </div>
                                    )}
                                    {round.scores.code_quality && (
                                      <div className="text-xs">
                                        <span className="font-medium">Code Quality:</span> {round.scores.code_quality}/5
                                      </div>
                                    )}
                                    {round.scores.technical_knowledge && (
                                      <div className="text-xs">
                                        <span className="font-medium">Technical Knowledge:</span> {round.scores.technical_knowledge}/5
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
