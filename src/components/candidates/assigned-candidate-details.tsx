import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  phone_number?: string
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

  const formatPhoneNumber = (phone_number: any) => {
    if (!phone_number) return "N/A"
    return String(phone_number).replace(/\+/g, "")
  }

  const StarRating = ({ rating }: { rating: number | null }) => {
    if (!rating) return <span className="text-gray-400 text-sm">Not rated</span>
    
    return (
      <div className="flex items-center gap-1 group">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`transition-all duration-200 ${
              i < rating 
                ? "text-yellow-400 group-hover:scale-110" 
                : "text-gray-300"
            }`}
          >
            ⭐
          </span>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{rating}/5</span>
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
                      {candidate.previous_rounds!.map((round: any, index: number) => (
                        <div 
                          key={index} 
                          className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
                        >
                          {/* Round Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-lg font-bold px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                                {round.round?.toUpperCase()}
                              </Badge>
                              <div>
                                <p className="font-semibold text-gray-900">{round.panel_name || "Unknown Panelist"}</p>
                                <p className="text-sm text-gray-500">{round.panel_email || ""}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(round.status)} font-medium px-3 py-1`}>
                              {round.status?.charAt(0).toUpperCase() + round.status?.slice(1) || "Unknown"}
                            </Badge>
                          </div>

                          {/* Technical Skills Ratings */}
                          {(round.communication || round.problem_solving || round.logical_thinking || 
                            round.code_quality || round.technical_knowledge) && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                ⭐ Technical Skills Assessment
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border">
                                {round.communication !== null && round.communication !== undefined && (
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700">Communication</span>
                                    <StarRating rating={round.communication} />
                                  </div>
                                )}
                                {round.problem_solving !== null && round.problem_solving !== undefined && (
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700">Problem Solving</span>
                                    <StarRating rating={round.problem_solving} />
                                  </div>
                                )}
                                {round.logical_thinking !== null && round.logical_thinking !== undefined && (
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700">Logical Thinking</span>
                                    <StarRating rating={round.logical_thinking} />
                                  </div>
                                )}
                                {round.code_quality !== null && round.code_quality !== undefined && (
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700">Code Quality</span>
                                    <StarRating rating={round.code_quality} />
                                  </div>
                                )}
                                {round.technical_knowledge !== null && round.technical_knowledge !== undefined && (
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium text-gray-700">Technical Knowledge</span>
                                    <StarRating rating={round.technical_knowledge} />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Feedback Text */}
                          {round.feedback && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                💭 Interviewer Comments
                              </h4>
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                <p className="text-gray-700 italic leading-relaxed">"{round.feedback}"</p>
                              </div>
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <span>
                              Feedback Status: {round.feedback_submitted ? "✅ Submitted" : "❌ Pending"}
                            </span>
                            {round.rating && (
                              <span>Overall Rating: {round.rating}</span>
                            )}
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
    </Dialog>
  )
}