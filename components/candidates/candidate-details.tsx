 

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Mail, Phone, MapPin, Calendar, DollarSign, FileText, Star, MessageSquare } from "lucide-react"
import type { Candidate } from "@/lib/mock-data"
import { getInterviewSessionForCandidate } from "@/lib/interview-data"
import { useState, useEffect } from "react"
import { formatDate } from "../../src/lib/utils"

interface CandidateDetailsProps {
  candidate: Candidate
  onClose?: () => void
  onScheduleInterview?: () => void
}

export function CandidateDetails({ candidate, onClose, onScheduleInterview }: CandidateDetailsProps) {
  const [interviewSession, setInterviewSession] = useState<any>(null)

  useEffect(() => {
    const session = getInterviewSessionForCandidate(candidate.id)
    setInterviewSession(session)
  }, [candidate.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-800"
      case "r1-scheduled":
      case "r2-scheduled":
      case "r3-scheduled":
        return "bg-blue-100 text-blue-800"
      case "r1-completed":
      case "r2-completed":
      case "r3-completed":
        return "bg-orange-100 text-orange-800"
      case "selected":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "unassigned":
        return "Unassigned"
      case "r1-scheduled":
        return "R1 Scheduled"
      case "r1-completed":
        return "R1 Completed"
      case "r2-scheduled":
        return "R2 Scheduled"
      case "r2-completed":
        return "R2 Completed"
      case "r3-scheduled":
        return "R3 Scheduled"
      case "r3-completed":
        return "R3 Completed"
      case "selected":
        return "Selected"
      case "rejected":
        return "Rejected"
      default:
        return status
    }
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
        <p className="text-gray-600">{candidate.applied_position}</p>
        <Badge className={getStatusColor(candidate.status)}>
          {formatStatus(candidate.status)}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Candidate Details</TabsTrigger>
          <TabsTrigger value="interviews">
            Interview & Feedback
            {candidate.feedback && candidate.feedback.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {candidate.feedback.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
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
                <span>{candidate.phone_number}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{candidate.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Experience</span>
                  <p className="font-medium">{candidate.total_experience}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Notice Period</span>
                  <p className="font-medium">{candidate.notice_period}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Job Type</span>
                  <p className="font-medium capitalize">{candidate.job_type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Interview Type</span>
                  <p className="font-medium capitalize">{candidate.interview_type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Source</span>
                  <p className="font-medium">{candidate.source}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Applied Date</span>
                  <p className="font-medium">{formatDate(candidate.appliedDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Recruiter</span>
                  <p className="font-medium">{candidate.recruiter || "Not assigned"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Current CTC</span>
                  <p className="font-medium">{candidate.current_ctc || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Expected CTC</span>
                  <p className="font-medium">{candidate.expected_ctc || "Not specified"}</p>
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Negotiable:</span>
                  <Badge variant={candidate.negotiable ? "default" : "secondary"}>
                    {candidate.negotiable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Open to Relocation:</span>
                  <Badge variant={candidate.willing_to_relocate ? "default" : "secondary"}>
                    {candidate.willing_to_relocate ? "Yes" : "No"}
                  </Badge>
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
                {candidate.skill_set && candidate.skill_set.length > 0 ? (
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
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          {/* Current Interview Status */}
          {candidate.currentRound && ["r1-in-progress", "r2-in-progress", "r3-in-progress"]?.includes(candidate.status) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Current Interview Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Current Round</span>
                    <p className="font-medium">{candidate.currentRound}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Assigned Panelist</span>
                    <p className="font-medium">{candidate.assignedPanelist || "Not assigned"}</p>
                  </div>
                </div>
                {candidate.interviewDateTime && (
                  <div>
                    <span className="text-sm text-gray-500">Scheduled Date & Time</span>
                    <p className="font-medium">{formatDate(candidate.interviewDateTime)}</p>
                  </div>
                )}
                {interviewSession && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Interview Status</span>
                      <Badge
                        className={
                          interviewSession.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : interviewSession.status === "in-progress"
                              ? "bg-orange-100 text-orange-800"
                              : interviewSession.status === "paused"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                        }
                      >
                        {interviewSession.status === "paused" ? "Wait Time Paused" : interviewSession.status}
                      </Badge>
                    </div>
                    {interviewSession.elapsedTime && (
                      <div>
                        <span className="text-sm text-gray-500">Interview Duration</span>
                        <p className="font-medium">
                          {Math.floor(interviewSession.elapsedTime / 60)}m {interviewSession.elapsedTime % 60}s
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {candidate.status === "unassigned" && onScheduleInterview && (
                  <div className="pt-4">
                    <Button onClick={onScheduleInterview} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                      Assign Panel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interview Feedback History */}
          {candidate.feedback && candidate.feedback.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Interview Feedback History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {candidate.feedback
                    .sort((a, b) => {
                      const roundOrder = { R3: 3, R2: 2, R1: 1 }
                      return roundOrder[b.round] - roundOrder[a.round]
                    })
                    .map((feedback, index) => (
                      <div key={index} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {feedback.round}
                            </Badge>
                            <div>
                              <p className="font-medium">{feedback.panelist}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(feedback.submittedAt)} at{" "}
                                {new Date(feedback.submittedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-sm text-blue-600 font-medium">
                                Interview Duration:{" "}
                                {feedback.round === "R3"
                                  ? "45m 30s"
                                  : feedback.round === "R2"
                                    ? "35m 15s"
                                    : interviewSession?.elapsedTime
                                      ? `${Math.floor(interviewSession.elapsedTime / 60)}m ${interviewSession.elapsedTime % 60}s`
                                      : "30m 45s"}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              feedback.decision === "selected"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {feedback.decision === "selected" ? "Passed" : "Failed"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Problem Solving</span>
                            <StarRating rating={feedback.rating} />
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Logical Thinking</span>
                            <StarRating rating={feedback.rating} />
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Code Quality</span>
                            <StarRating rating={feedback.rating} />
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Communication</span>
                            <StarRating rating={feedback.rating} />
                          </div>
                        </div>

                        <div>
                          <span className="text-sm text-gray-500">Overall Decision</span>
                          <p className="font-medium mt-1">
                            {feedback.round === "R3" && candidate.status === "selected"
                              ? "Selected"
                              : feedback.decision === "selected"
                                ? "Move to Next Round"
                                : "Rejected"}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-gray-500">Comments</span>
                          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded">{feedback.notes}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interview not yet scheduled.</h3>
                <p className="text-gray-500 mb-6">
                  Schedule an interview to start collecting feedback and track progress.
                </p>
                {candidate.status === "unassigned" && onScheduleInterview && (
                  <Button onClick={onScheduleInterview} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                    Assign Panel
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
