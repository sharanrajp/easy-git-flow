import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Mail, Phone, MapPin, DollarSign, FileText, FileSearch, CheckCircle, X } from "lucide-react"
import type { BackendCandidate } from "../../lib/candidates-api"
import { ResumeDialog } from "./resume-dialog"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UnassignedCandidateDetailsProps {
  candidate: BackendCandidate
  onClose?: () => void
  onScheduleInterview?: () => void
}

export function UnassignedCandidateDetails({ candidate, onClose, onScheduleInterview }: UnassignedCandidateDetailsProps) {
  // Debug logging to inspect candidate data structure
  console.log("Candidate data in UnassignedCandidateDetails:", candidate)
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false)
  const [isScreeningDialogOpen, setIsScreeningDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-orange-100 text-gray-800"
      case "selected":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPhoneNumber = (phone_number: any) => {
    if (!phone_number) return "N/A"
    return String(phone_number).replace(/\+/g, "")
  }

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A"
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  // Get status with proper fallback
  const candidateStatus = candidate.status || "unassigned"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
          <Badge className={getStatusColor(candidateStatus)}>
            {candidateStatus || "Unassigned"}
          </Badge>
        </div>
        <p className="text-gray-600">{candidate.applied_position || "N/A"}</p>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{formatPhoneNumber(candidate.phone_number)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{candidate.location || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-sm text-gray-500">Experience</span>
                <p className="font-medium">{candidate.total_experience ? `${candidate.total_experience}` : "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Source</span>
                <p className="font-medium">{candidate.source || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Applied Date</span>
                <p className="font-medium">{formatDate(candidate.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Recruiter</span>
                <p className="font-medium">{candidate.recruiter_name || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Current CTC</span>
                <p className="font-medium">{candidate.current_ctc}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Expected CTC</span>
                <p className="font-medium">{candidate.expected_ctc || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(candidate.skill_set) && candidate.skill_set.length > 0 ? (
                candidate.skill_set.map((skill: string, skillIndex: number) => (
                  <Badge key={skillIndex} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Recruiter Notes */}
        {(candidate as any).recruiter_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                {(candidate as any).recruiter_notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Button 
              onClick={() => setIsScreeningDialogOpen(true)} 
              variant="outline"
              className="w-full"
            >
              <FileSearch className="h-4 w-4 mr-2" />
              View Screening Result
            </Button>
            {candidateStatus === "unassigned" && onScheduleInterview && (
              <Button onClick={onScheduleInterview} className="w-full">
                Assign Panel
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}