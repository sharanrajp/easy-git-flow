import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatToIST } from "@/lib/utils"
import { ResumeUploadLog } from "@/lib/candidates-api"
import { Loader2 } from "lucide-react"
import { ResumeUploadLogDetailsDialog } from "./resume-upload-log-details-dialog"

interface ResumeUploadLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: ResumeUploadLog[]
  loading: boolean
  onViewDetails: (logId: string) => void
}

export function ResumeUploadLogsDialog({ 
  open, 
  onOpenChange, 
  logs, 
  loading,
  onViewDetails 
}: ResumeUploadLogsDialogProps) {
  return (
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
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(log._id)}
                      >
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
  )
}
