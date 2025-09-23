// @ts-nocheck

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Search, Eye, Play, Clock, CheckCircle } from "lucide-react"
import { getPanelistCandidates } from "@/lib/panelist-data"
import { CandidateDetails } from "@/components/candidates/candidate-details"
import { InterviewFlow } from "@/components/panelist/interview-flow"

export default function PanelistCandidatesPage() {
  const [candidates] = useState(getPanelistCandidates())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isInterviewOpen, setIsInterviewOpen] = useState(false)

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleStartInterview = (candidate: any) => {
    setSelectedCandidate(candidate)
    setIsInterviewOpen(true)
  }

  return (
    <DashboardLayout requiredRole="panelist">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assigned Candidates</h1>
            <p className="text-gray-600">Candidates assigned to you for interviews</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Candidates ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.appliedPosition}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.round}</Badge>
                    </TableCell>
                    <TableCell>
                      {candidate.scheduledTime ? new Date(candidate.scheduledTime).toLocaleString() : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(candidate.interviewStatus)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(candidate.interviewStatus)}
                          {candidate.interviewStatus}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(candidate)
                            setIsDetailsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {candidate.interviewStatus === "scheduled" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStartInterview(candidate)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Interview
                          </Button>
                        )}
                        {candidate.interviewStatus === "in-progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600 bg-transparent"
                            onClick={() => handleStartInterview(candidate)}
                          >
                            Continue Interview
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Details Popover */}
        <Popover open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <PopoverContent className="w-[600px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Candidate Details</h3>
              {selectedCandidate && <CandidateDetails candidate={selectedCandidate} />}
            </div>
          </PopoverContent>
        </Popover>

        {/* Interview Flow Popover */}
        <Popover open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
          <PopoverContent className="w-[600px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Interview in Progress</h3>
              {selectedCandidate && (
                <InterviewFlow
                  candidate={selectedCandidate}
                  onComplete={() => {
                    setIsInterviewOpen(false)
                    setSelectedCandidate(null)
                  }}
                />
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </DashboardLayout>
  )
}
