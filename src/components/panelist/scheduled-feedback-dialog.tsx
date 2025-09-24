import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { type PanelistCandidate } from "@/lib/candidates-api"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"

interface ScheduledFeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  candidate: PanelistCandidate
  onSubmit: () => void
}

interface FeedbackData {
  communication: number
  problemSolving: number
  logicalThinking: number
  codeQuality: number
  technicalKnowledge: number
  status: string
  feedback: string
}

export function ScheduledFeedbackDialog({ isOpen, onClose, candidate, onSubmit }: ScheduledFeedbackDialogProps) {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<FeedbackData>({
    communication: 0,
    problemSolving: 0,
    logicalThinking: 0,
    codeQuality: 0,
    technicalKnowledge: 0,
    status: "",
    feedback: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (category: keyof FeedbackData, rating: number) => {
    if (typeof feedback[category] === "number") {
      setFeedback((prev) => ({ ...prev, [category]: rating }))
    }
  }

  const handleSubmit = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('http://127.0.0.1:8000/interviews/update-interview', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidate_id: candidate._id,
          panel_id: currentUser._id,
          round: candidate.last_interview_round,
          communication: feedback.communication,
          problem_solving: feedback.problemSolving,
          logical_thinking: feedback.logicalThinking,
          code_quality: feedback.codeQuality,
          technical_knowledge: feedback.technicalKnowledge,
          status: feedback.status,
          feedback: feedback.feedback
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      })

      onSubmit()
      onClose()

      // Reset form
      setFeedback({
        communication: 0,
        problemSolving: 0,
        logicalThinking: 0,
        codeQuality: 0,
        technicalKnowledge: 0,
        status: "",
        feedback: "",
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ category, label }: { category: keyof FeedbackData; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
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
                star <= (feedback[category] as number) ? "text-yellow-400 fill-current" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const isFormValid =
    feedback.communication > 0 &&
    feedback.problemSolving > 0 &&
    feedback.logicalThinking > 0 &&
    feedback.codeQuality > 0 &&
    feedback.technicalKnowledge > 0 &&
    feedback.status &&
    feedback.feedback.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Feedback - {candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StarRating category="communication" label="Communication" />
            <StarRating category="problemSolving" label="Problem Solving" />
            <StarRating category="logicalThinking" label="Logical Thinking" />
            <StarRating category="codeQuality" label="Code Quality" />
            <StarRating category="technicalKnowledge" label="Technical Knowledge" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select
              value={feedback.status}
              onValueChange={(value) => setFeedback((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Feedback</label>
            <Textarea
              value={feedback.feedback}
              onChange={(e) => setFeedback((prev) => ({ ...prev, feedback: e.target.value }))}
              placeholder="Provide detailed feedback about the candidate's performance..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}