import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatToIST } from "@/lib/utils"
import { fetchResumeUploadLogs, type ResumeUploadLog } from "@/lib/candidates-api"
import { useToast } from "@/hooks/use-toast"
import { Eye } from "lucide-react"
import { ResumeUploadLogDetailsDialog } from "./resume-upload-log-details-dialog"

interface ResumeUploadLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResumeUploadLogsDialog({ open, onOpenChange }: ResumeUploadLogsDialogProps) {
  const { toast } = useToast()
  const [logs, setLogs] = useState<ResumeUploadLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    if (open) {
      loadLogs()
    }
  }, [open])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await fetchResumeUploadLogs()
      setLogs(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resume upload logs",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (logId: string) => {
    setSelectedLogId(logId)
    setIsDetailsOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Resume Upload Logs</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No resume upload logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Total Files</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">{log.uploaded_by}</TableCell>
                      <TableCell>{log.total_files}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatToIST(log.started_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log._id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedLogId && (
        <ResumeUploadLogDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          logId={selectedLogId}
        />
      )}
    </>
  )
}
