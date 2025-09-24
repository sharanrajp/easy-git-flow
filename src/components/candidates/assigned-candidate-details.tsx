import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export interface BackendCandidate {
  _id: string
  name: string
  email: string
  phone?: string
  phone_number?: string
  appliedPosition?: string
  applied_position?: string
  status?: string
  final_status?: string
  total_experience?: number
  skill_set?: string[]
  source?: string
  appliedDate?: string
  created_at?: string
  recruiter?: string
  assignedPanelist?: string
  panel_name?: string
  currentRound?: string
  last_interview_round?: string
  interviewDateTime?: string
  waitTime?: string | null
  waitTimeStarted?: string | null
  isCheckedIn?: boolean
  register_number?: string
  interview_type?: string
  notice_period?: string
  current_ctc?: number
  expected_ctc?: number
  willing_to_relocate?: boolean
  resume_link?: string
  previous_rounds?: Array<{
    round?: string
    status?: string
    feedback_submitted?: boolean
    rating?: string
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPhoneNumber = (phone: any) => {
    if (!phone) return "N/A"
    return String(phone).replace(/\+/g, "")
  }

  const StarRating = ({ rating }: { rating: number | null }) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={i < rating ? "text-yellow-400" : "text-gray-300"}
          >
            ⭐
          </span>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{candidate.name}</span>
            <Badge className={getStatusColor(candidate.final_status || "assigned")}>
              {candidate.final_status || "assigned"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                  <p>{(candidate as any).applied_position || candidate.appliedPosition || "N/A"}</p>
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

              {candidate.resume_link && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resume</label>
                  <div className="mt-1">
                    <a
                      href={candidate.resume_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Feedback */}
          {candidate.previous_rounds && candidate.previous_rounds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.previous_rounds!.map((round: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">Round {round.round?.toUpperCase()}</h4>
                      <Badge className={getStatusColor(round.status)}>
                        {round.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Panelist</label>
                        <p>{round.panel_name || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Feedback Submitted</label>
                        <p>{round.feedback_submitted ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Overall Rating</label>
                        <p>{round.rating || "N/A"}</p>
                      </div>
                    </div>

                    {round.feedback && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-500">Feedback</label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{round.feedback}</p>
                      </div>
                    )}

                    {/* Technical Scores */}
                    {(round.communication || round.problem_solving || round.logical_thinking || 
                      round.code_quality || round.technical_knowledge) && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Technical Scores</label>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {round.communication && (
                            <div className="flex items-center justify-between">
                              <span>Communication:</span>
                              <StarRating rating={round.communication} />
                            </div>
                          )}
                          {round.problem_solving && (
                            <div className="flex items-center justify-between">
                              <span>Problem Solving:</span>
                              <StarRating rating={round.problem_solving} />
                            </div>
                          )}
                          {round.logical_thinking && (
                            <div className="flex items-center justify-between">
                              <span>Logical Thinking:</span>
                              <StarRating rating={round.logical_thinking} />
                            </div>
                          )}
                          {round.code_quality && (
                            <div className="flex items-center justify-between">
                              <span>Code Quality:</span>
                              <StarRating rating={round.code_quality} />
                            </div>
                          )}
                          {round.technical_knowledge && (
                            <div className="flex items-center justify-between">
                              <span>Technical Knowledge:</span>
                              <StarRating rating={round.technical_knowledge} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {index < candidate.previous_rounds!.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}