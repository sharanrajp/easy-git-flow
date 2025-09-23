// @ts-nocheck

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Search, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import { getManagerCandidates } from "@/lib/manager-data"
import { CandidateDetails } from "@/components/candidates/candidate-details"
import { ManagerInterviewFlow } from "@/components/manager/manager-interview-flow"

export default function ManagerCandidatesPage() {
  const [candidates] = useState(getManagerCandidates())
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
      case "pending-decision":
        return "bg-orange-100 text-orange-800"
      case "selected":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "pending-decision":
        return <Clock className="h-4 w-4" />
      case "selected":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "scheduled":
        return "R3 Scheduled"
      case "pending-decision":
        return "Pending Decision"
      case "selected":
        return "Selected"
      case "rejected":
        return "Rejected"
      default:
        return status
    }
  }

  const handleStartInterview = (candidate: any) => {
    setSelectedCandidate(candidate)
    setIsInterviewOpen(true)
  }

  return (
    <DashboardLayout requiredRole="manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">R3 Candidates</h1>
            <p className="text-gray-600">Candidates assigned for final round interviews</p>
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
            <CardTitle>R3 Candidates ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Expected CTC</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Pending</TableHead>
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
                    <TableCell>{candidate.expectedCTC}</TableCell>
                    <TableCell>
                      {candidate.r3InterviewDate
                        ? new Date(candidate.r3InterviewDate).toLocaleDateString()
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(candidate.r3Status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(candidate.r3Status)}
                          {formatStatus(candidate.r3Status)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {candidate.r3Status === "pending-decision" ? (
                        <span className="text-orange-600 font-medium">{candidate.daysPending} days</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
                          View Details
                        </Button>
                        {candidate.r3Status === "scheduled" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStartInterview(candidate)}
                          >
                            Start R3 Interview
                          </Button>
                        )}
                        {candidate.r3Status === "pending-decision" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600 bg-transparent"
                            onClick={() => handleStartInterview(candidate)}
                          >
                            Make Decision
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
              <h3 className="text-lg font-semibold">Candidate Details & History</h3>
              {selectedCandidate && <CandidateDetails candidate={selectedCandidate} />}
            </div>
          </PopoverContent>
        </Popover>

        {/* Manager Interview Flow Popover */}
        <Popover open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
          <PopoverContent className="w-[600px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">R3 Interview & Decision</h3>
              {selectedCandidate && (
                <ManagerInterviewFlow
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
