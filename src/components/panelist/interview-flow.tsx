import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getInterviewSessionForCandidate, completeInterview, pauseInterview } from "@/lib/interview-data"

interface InterviewFlowProps {
  candidate: any
  onComplete: () => void
}

export function InterviewFlow({ candidate, onComplete }: InterviewFlowProps) {
  const [interviewSession, setInterviewSession] = useState<any>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [feedback, setFeedback] = useState({
    rating: "",
    notes: "",
    decision: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const session = getInterviewSessionForCandidate(candidate.id)
    if (session) {
      setInterviewSession(session)
      setIsStarted(session.status === "in-progress")
      if (session.startTime) {
        setStartTime(new Date(session.startTime))
      }
      if (session.elapsedTime) {
        setElapsedTime(session.elapsedTime)
      }
    }
  }, [candidate.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = () => {
    setIsStarted(true)
    setStartTime(new Date())
    if (interviewSession) {
      pauseInterview(interviewSession.id)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.rating || !feedback.notes || !feedback.decision) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    // Complete interview session with feedback
    if (interviewSession) {
      completeInterview(interviewSession.id, {
        rating: Number.parseInt(feedback.rating),
        notes: feedback.notes,
        decision: feedback.decision as "selected" | "rejected",
        submittedAt: new Date().toISOString(),
      })
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    onComplete()
  }

  const canSubmit = feedback.rating && feedback.notes && feedback.decision

  return (
    <div className="space-y-6 mt-6">
      {/* Candidate Info */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Candidate:</span>
              <p className="font-medium">{candidate.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Position:</span>
              <p className="font-medium">{candidate.appliedPosition}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Round:</span>
              <Badge variant="outline">{candidate.round}</Badge>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience:</span>
              <p className="font-medium">{candidate.experience}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Interview Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-mono font-bold text-blue-600">{formatTime(elapsedTime)}</div>
            <div className="flex items-center space-x-3">
              {!isStarted ? (
                <Button onClick={handleStartInterview} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview
                </Button>
              ) : (
                <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Interview in Progress
                </Badge>
              )}
            </div>
          </div>
          {isStarted && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Interview is in progress. You cannot end the interview without submitting feedback.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Required Skills:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {candidate.skills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      {isStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Performance Rating *</Label>
              <Select value={feedback.rating} onValueChange={(value) => setFeedback({ ...feedback, rating: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating (1-5)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Interview Notes *</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Enter detailed feedback about the candidate's performance, technical skills, communication, etc."
                value={feedback.notes}
                onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision">Decision *</Label>
              <Select
                value={feedback.decision}
                onValueChange={(value) => setFeedback({ ...feedback, decision: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">
                    Selected - Move to {candidate.round === "R1" ? "R2" : candidate.round === "R2" ? "R3" : "Final"}
                  </SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onComplete}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!canSubmit || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    End Interview & Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
