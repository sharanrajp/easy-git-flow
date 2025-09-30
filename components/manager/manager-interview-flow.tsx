 

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"

interface ManagerInterviewFlowProps {
  candidate: any
  onComplete: () => void
}

export function ManagerInterviewFlow({ candidate, onComplete }: ManagerInterviewFlowProps) {
  const [feedback, setFeedback] = useState({
    rating: "",
    notes: "",
    decision: "",
    salaryRecommendation: candidate.expected_ctc || "",
    startDate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitDecision = async () => {
    if (!feedback.rating || !feedback.notes || !feedback.decision) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock decision submission
    console.log("r3 Decision submitted:", {
      candidateId: candidate.id,
      rating: feedback.rating,
      notes: feedback.notes,
      decision: feedback.decision,
      salaryRecommendation: feedback.salaryRecommendation,
      startDate: feedback.startDate,
    })

    setIsSubmitting(false)
    onComplete()
  }

  const canSubmit = feedback.rating && feedback.notes && feedback.decision

  return (
    <div className="space-y-6 mt-6">
      {/* Candidate Summary */}
      <Card>
        <CardHeader>
          <CardTitle>r3 Interview - Final Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Candidate:</span>
              <p className="font-medium">{candidate.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Position:</span>
              <p className="font-medium">{candidate.applied_position}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience:</span>
              <p className="font-medium">{candidate.total_experience}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Expected CTC:</span>
              <p className="font-medium">{candidate.expected_ctc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Round Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Previous Interview Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {candidate.feedback?.map((fb: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{fb.round}</Badge>
                    <span className="font-medium">{fb.panelist}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{fb.notes}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{fb.rating}/5</Badge>
                  <Badge
                    className={`ml-2 ${fb.decision === "selected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {fb.decision}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* r3 Decision Form */}
      <Card>
        <CardHeader>
          <CardTitle>Final Interview Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Overall Rating *</Label>
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
            <Label htmlFor="notes">Interview Notes & Assessment *</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Enter detailed assessment including leadership potential, cultural fit, technical depth, and overall recommendation..."
              value={feedback.notes}
              onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision">Final Decision *</Label>
            <Select value={feedback.decision} onValueChange={(value) => setFeedback({ ...feedback, decision: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select final decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Selected - Proceed to Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="on-hold">On Hold - Need More Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {feedback.decision === "selected" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Recommendation</Label>
                <input
                  id="salary"
                  type="text"
                  placeholder="e.g., $120,000"
                  value={feedback.salaryRecommendation}
                  onChange={(e) => setFeedback({ ...feedback, salaryRecommendation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Proposed Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  value={feedback.startDate}
                  onChange={(e) => setFeedback({ ...feedback, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onComplete}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDecision}
              disabled={!canSubmit || isSubmitting}
              className={`${
                feedback.decision === "selected"
                  ? "bg-green-600 hover:bg-green-700"
                  : feedback.decision === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : feedback.decision === "selected" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Select Candidate
                </>
              ) : feedback.decision === "rejected" ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Candidate
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Submit Decision
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
