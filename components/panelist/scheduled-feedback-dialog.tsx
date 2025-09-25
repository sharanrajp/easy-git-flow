import { useState, useCallback } from "react"
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
  problem_solving: number
  logical_thinking: number
  code_quality: number
  technical_knowledge: number
  status: string
  feedback: string
}

export function ScheduledFeedbackDialog({ isOpen, onClose, candidate, onSubmit }: ScheduledFeedbackDialogProps) {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<FeedbackData>({
    communication: 0,
    problem_solving: 0,
    logical_thinking: 0,
    code_quality: 0,
    technical_knowledge: 0,
    status: "",
    feedback: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = useCallback((category: keyof FeedbackData, rating: number) => {
    if (typeof feedback[category] === "number") {
      setFeedback((prev) => ({ ...prev, [category]: rating }))
    }
  }, [feedback])

  const handleSubmit = useCallback(async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    if (isSubmitting) return // Prevent double submission

    try {
      setIsSubmitting(true)
      
      const response = await fetch('http://127.0.0.1:8000/interviews/update-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidate_id: candidate._id,
          panel_id: currentUser._id,
          round: candidate.last_interview_round,
          communication: feedback.communication,
          problem_solving: feedback.problem_solving,
          logical_thinking: feedback.logical_thinking,
          code_quality: feedback.code_quality,
          technical_knowledge: feedback.technical_knowledge,
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

      // Reset form first
      setFeedback({
        communication: 0,
        problem_solving: 0,
        logical_thinking: 0,
        code_quality: 0,
        technical_knowledge: 0,
        status: "",
        feedback: "",
      })

      // Then call callbacks
      onSubmit()
      onClose()
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
  }, [candidate, feedback, isSubmitting, onClose, onSubmit, toast])

  const StarRating = useCallback(({ category, label }: { category: keyof FeedbackData; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(category, star)}
            className="focus:outline-none transition-colors hover:scale-110"
            disabled={isSubmitting}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (feedback[category] as number)
                  ? "text-yellow-400 fill-current" 
                  : "text-muted-foreground hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  ), [feedback, handleStarClick, isSubmitting])

  const isFormValid = 
    feedback.communication > 0 &&
    feedback.problem_solving > 0 &&
    feedback.logical_thinking > 0 &&
    feedback.code_quality > 0 &&
    feedback.technical_knowledge > 0 &&
    feedback.status &&
    feedback.feedback.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border shadow-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Interview Feedback - {candidate.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StarRating category="communication" label="Communication" />
            <StarRating category="problem_solving" label="Problem Solving" />
            <StarRating category="logical_thinking" label="Logical Thinking" />
            <StarRating category="code_quality" label="Code Quality" />
            <StarRating category="technical_knowledge" label="Technical Knowledge" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select
              value={feedback.status}
              onValueChange={(value) => setFeedback((prev) => ({ ...prev, status: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-background border">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
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
              className="bg-background border"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="transition-all hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}