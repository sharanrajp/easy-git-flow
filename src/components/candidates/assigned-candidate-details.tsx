import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResumeDialog } from "./resume-dialog"
import { useState } from "react"
import { FileSearch, CheckCircle, X, Star } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type BackendCandidate as APIBackendCandidate } from "@/lib/candidates-api"

// Local formatDate function since it's not exported from utils
function formatDate(dateString: string | Date): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

// Extended type for candidate details with additional fields
export type BackendCandidate = Omit<APIBackendCandidate, 'previous_rounds'> & {
  register_number?: string
  isCheckedIn?: boolean
  previous_rounds?: Array<{
    round?: string
    status?: string
    feedback_submitted?: boolean
    rating?: string | number
    feedback?: string
    panel_name?: string
    panel_email?: string
    communication?: number
    problem_solving?: number
    logical_thinking?: number
    code_quality?: number
    technical_knowledge?: number
  }>
}

interface AssignedCandidateDetailsProps {
  candidate: BackendCandidate | null
  isOpen: boolean
  onClose: () => void
}

export function AssignedCandidateDetails({ candidate, isOpen, onClose }: AssignedCandidateDetailsProps) {
  if (!candidate) return null
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false)
  const [isScreeningDialogOpen, setIsScreeningDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-orange-100 text-orange-800"
      case "unassigned":
        return "bg-blue-100 text-blue-800"
      case "selected":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPhoneNumber = (phone_number: any) => {
    if (!phone_number) return "N/A"
    return String(phone_number).replace(/\+/g, "")
  }

  const StarRating = ({ rating, label }: { rating: number | null; label: string }) => {
    if (rating === null || rating === undefined) {
      return (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">{label}:</span>
          <span className="text-gray-400 text-sm">Not rated</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-base transition-all duration-200 ${
                i < rating 
                  ? "text-yellow-500" 
                  : "text-gray-300"
              }`}
            >
              {i < rating ? "⭐" : "☆"}
            </span>
          ))}
          <span className="ml-2 text-xs text-gray-600 font-medium">({rating}/5)</span>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{candidate.name}</span>
            <Badge className={getStatusColor(candidate.final_status || "assigned")}>
              {candidate.final_status ? candidate.final_status.charAt(0).toUpperCase() + candidate.final_status.slice(1) : "Assigned"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Candidate Details</TabsTrigger>
              <TabsTrigger value="interviews">
                Interview & Feedback
                {candidate.previous_rounds && candidate.previous_rounds.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {candidate.previous_rounds.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidate Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-medium">{candidate.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p>{candidate.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p>{formatPhoneNumber(candidate.phone_number)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applied Position</label>
                      <p>{(candidate as any).applied_position || candidate.applied_position || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Register Number</label>
                      <p>{candidate.register_number || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Interview Type</label>
                      <p>{candidate.interview_type || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <p>{candidate.total_experience ? `${candidate.total_experience} years` : "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Notice Period</label>
                      <p>{candidate.notice_period || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current CTC</label>
                      <p>{candidate.current_ctc ? `₹${candidate.current_ctc} LPA` : "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expected CTC</label>
                      <p>{candidate.expected_ctc ? `₹${candidate.expected_ctc} LPA` : "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Willing to Relocate</label>
                      <p>{candidate.willing_to_relocate === true ? "Yes" : candidate.willing_to_relocate === false ? "No" : "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applied Date</label>
                      <p>{candidate.created_at ? formatDate(candidate.created_at) : "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Offer Released Date</label>
                      <p>{candidate.offer_released_date ? formatDate(candidate.offer_released_date) : "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joined Date</label>
                      <p>{candidate.joined_date ? formatDate(candidate.joined_date) : "-"}</p>
                    </div>
                    {candidate.final_status === "joined" && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Time to Hire</label>
                          <p>
                            {candidate.created_at && candidate.joined_date
                              ? `${Math.ceil(
                                  (new Date(candidate.joined_date).getTime() - new Date(candidate.created_at).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )} days`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Time to Fill</label>
                          <p>
                            {candidate.created_at && candidate.offer_released_date
                              ? `${Math.ceil(
                                  (new Date(candidate.offer_released_date).getTime() - new Date(candidate.created_at).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )} days`
                              : "-"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Array.isArray(candidate.skill_set) && candidate.skill_set.length > 0 ? (
                        candidate.skill_set.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Resume</label>
                    <div className="mt-1">
                      {candidate.resume_link ? (
                        <Button
                          variant="link"
                          onClick={() => setIsResumeDialogOpen(true)}
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                        >
                          View Resume
                        </Button>
                      ) : (
                        <p className="text-gray-400 text-sm">No resume available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screening Result Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={() => setIsScreeningDialogOpen(true)} 
                    variant="outline"
                    className="w-full"
                  >
                    <FileSearch className="h-4 w-4 mr-2" />
                    View Screening Result
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interviews" className="space-y-6">
              {/* Interview Feedback History */}
              {candidate.previous_rounds && candidate.previous_rounds.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      📝 Interview Feedback History
                      <Badge variant="secondary" className="text-xs">
                        {candidate.previous_rounds.length} {candidate.previous_rounds.length === 1 ? 'Round' : 'Rounds'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {candidate.previous_rounds!.slice().reverse().map((round: any, index: number) => (
                        <div 
                          key={index} 
                          className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
                        >
                          {/* Round Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-sm font-bold px-3 py-1">
                                Round: {round.round?.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-600">Panel: <span className="font-semibold">{round.panel_name || "Unknown Panelist"}</span></span>
                            </div>
                            <Badge className={`${getStatusColor(round.status)} font-medium px-3 py-1`}>
                              {round.status?.charAt(0).toUpperCase() + round.status?.slice(1) || "Unknown"}
                            </Badge>
                          </div>

                          {/* Feedback Text */}
                          {round.feedback && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                <p className="text-gray-700 italic">"{round.feedback}"</p>
                              </div>
                            </div>
                          )}

                          {/* View Rating Button */}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500">
                              Feedback Status: {round.feedback_submitted ? "✅ Submitted" : "❌ Pending"}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
                                >
                                  <Star className="h-4 w-4" />
                                  View Rating
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="w-80 p-4">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Technical Skills Assessment</h4>
                                  <StarRating rating={round.communication} label="Communication" />
                                  <StarRating rating={round.problem_solving} label="Problem Solving" />
                                  <StarRating rating={round.logical_thinking} label="Logical Thinking" />
                                  <StarRating rating={round.code_quality} label="Code Quality" />
                                  <StarRating rating={round.technical_knowledge} label="Technical Knowledge" />
                                  {round.rating && (
                                    <div className="pt-2 border-t mt-3">
                                      <span className="text-xs font-medium text-gray-600">Overall Rating: {round.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-gray-400 mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No interview feedback available</h3>
                    <p className="text-gray-500">
                      Interview feedback will appear here once interviews are conducted and feedback is submitted.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      <ResumeDialog
        isOpen={isResumeDialogOpen}
        onClose={() => setIsResumeDialogOpen(false)}
        resumeUrl={candidate.resume_link || null}
        candidateName={candidate.name}
      />

      {/* Screening Result Dialog */}
      <Dialog open={isScreeningDialogOpen} onOpenChange={setIsScreeningDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Screening Result - {candidate.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Job Match Section */}
              {(candidate as any).job_match ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Job Match</h3>
                    
                    {/* Match Percentage */}
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Match Percentage</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={
                            (candidate as any).job_match.match_percentage >= 70
                              ? "bg-green-100 text-green-800"
                              : (candidate as any).job_match.match_percentage >= 40
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {(candidate as any).job_match.match_percentage}%
                        </Badge>
                      </div>
                    </div>

                    {/* Strengths */}
                    {(candidate as any).job_match.strengths && (candidate as any).job_match.strengths.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Strengths</span>
                        <ul className="mt-2 space-y-2">
                          {(candidate as any).job_match.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gaps */}
                    {(candidate as any).job_match.gaps && (candidate as any).job_match.gaps.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Gaps</span>
                        <ul className="mt-2 space-y-2">
                          {(candidate as any).job_match.gaps.map((gap: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Resume Summary */}
                  {(candidate as any).resume_summary && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Resume Summary</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {(candidate as any).resume_summary}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No screening result available for this candidate.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}