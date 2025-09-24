import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Mail, Phone, MapPin, DollarSign, FileText } from "lucide-react"
import type { BackendCandidate } from "../../lib/candidates-api"

interface UnassignedCandidateDetailsProps {
  candidate: BackendCandidate
  onClose?: () => void
  onScheduleInterview?: () => void
}

export function UnassignedCandidateDetails({ candidate, onClose, onScheduleInterview }: UnassignedCandidateDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
        <p className="text-gray-600">{candidate.applied_position || "N/A"}</p>
        <Badge className={getStatusColor(candidate.status || "unassigned")}>
          {candidate.status || "Unassigned"}
        </Badge>
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
                <p className="font-medium">{candidate.total_experience ? `${candidate.total_experience} years` : "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Source</span>
                <p className="font-medium">{candidate.source || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Applied Date</span>
                <p className="font-medium">{candidate.appliedDate || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Recruiter</span>
                <p className="font-medium">{candidate.recruiter || "N/A"}</p>
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

        {/* Action Buttons */}
        {candidate.status === "unassigned" && onScheduleInterview && (
          <Card>
            <CardContent className="pt-6">
              <Button onClick={onScheduleInterview} className="w-full">
                Assign Panel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}