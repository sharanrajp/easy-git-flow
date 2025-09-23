 

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { type InterviewSession, completeInterview } from "@/lib/interview-data"

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  session: InterviewSession
  onSubmit: () => void
}

interface FeedbackData {
  problemSolving: number
  communication: number
  codeQuality: number
  technicalKnowledge: number
  teamwork: number
  overallDecision: string
  comments: string
}

export function FeedbackDialog({ isOpen, onClose, session, onSubmit }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    problemSolving: 0,
    communication: 0,
    codeQuality: 0,
    technicalKnowledge: 0,
    teamwork: 0,
    overallDecision: "",
    comments: "",
  })

  const handleStarClick = (category: keyof FeedbackData, rating: number) => {
    if (typeof feedback[category] === "number") {
      setFeedback((prev) => ({ ...prev, [category]: rating }))
    }
  }

  const handleSubmit = () => {
    // Complete the interview with feedback
    completeInterview(session.id, {
      rating: Math.round(
        (feedback.problemSolving +
          feedback.communication +
          feedback.codeQuality +
          feedback.technicalKnowledge +
          feedback.teamwork) /
          5,
      ),
      notes: feedback.comments,
      decision: feedback.overallDecision === "Move to R2" ? "selected" : "rejected",
      submittedAt: new Date().toISOString(),
      detailedRatings: {
        problemSolving: feedback.problemSolving,
        communication: feedback.communication,
        codeQuality: feedback.codeQuality,
        technicalKnowledge: feedback.technicalKnowledge,
        teamwork: feedback.teamwork,
      },
    })

    onSubmit()
    onClose()

    // Reset form
    setFeedback({
      problemSolving: 0,
      communication: 0,
      codeQuality: 0,
      technicalKnowledge: 0,
      teamwork: 0,
      overallDecision: "",
      comments: "",
    })
  }

  const StarRating = ({ category, label }: { category: keyof FeedbackData; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(category, star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (feedback[category] as number) ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const isFormValid =
    feedback.problemSolving > 0 &&
    feedback.communication > 0 &&
    feedback.codeQuality > 0 &&
    feedback.technicalKnowledge > 0 &&
    feedback.teamwork > 0 &&
    feedback.overallDecision &&
    feedback.comments.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Feedback - {session.candidateName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StarRating category="problemSolving" label="Problem Solving" />
            <StarRating category="communication" label="Communication" />
            <StarRating category="codeQuality" label="Code Quality" />
            <StarRating category="technicalKnowledge" label="Technical Knowledge" />
            <StarRating category="teamwork" label="Teamwork" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Overall Decision</label>
            <Select
              value={feedback.overallDecision}
              onValueChange={(value) => setFeedback((prev) => ({ ...prev, overallDecision: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                {session.round === "R1" && <SelectItem value="Move to R2">Move to R2</SelectItem>}
                {session.round === "R2" && <SelectItem value="Move to R3">Move to R3</SelectItem>}
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Feedback Comments</label>
            <Textarea
              value={feedback.comments}
              onChange={(e) => setFeedback((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Provide detailed feedback about the candidate's performance..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid} className="bg-blue-600 hover:bg-blue-700">
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
