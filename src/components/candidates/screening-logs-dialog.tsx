import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"
import { formatToIST } from "@/lib/utils"
import type { ScreeningSummaryLog, ScreeningSummaryDetail } from "@/lib/candidates-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ScreeningLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: ScreeningSummaryLog[]
  loading: boolean
}

export function ScreeningLogsDialog({
  open,
  onOpenChange,
  logs,
  loading,
}: ScreeningLogsDialogProps) {
  const [selectedLog, setSelectedLog] = useState<ScreeningSummaryLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleViewDetails = (log: ScreeningSummaryLog) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedLog(null)
  }

  return (
    <>
      <Dialog open={open && !showDetails} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Screening Summary Logs</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-500">No screening logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead className="text-center">Total Candidates</TableHead>
                  <TableHead className="text-center">Success</TableHead>
                  <TableHead className="text-center">Failed</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">{log.position_title}</TableCell>
                    <TableCell className="text-center">{log.total_candidates}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800">
                        {log.success_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-100 text-red-800">
                        {log.failed_count}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatToIST(log.started_at)}</TableCell>
                    <TableCell>{formatToIST(log.completed_at)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Screening Details - {selectedLog?.position_title}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseDetails}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedLog.total_candidates}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Success / Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      <span className="text-green-600">{selectedLog.success_count}</span>
                      {" / "}
                      <span className="text-red-600">{selectedLog.failed_count}</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedLog.details.map((detail: ScreeningSummaryDetail, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{detail.candidate_name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            detail.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {detail.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {detail.error || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
