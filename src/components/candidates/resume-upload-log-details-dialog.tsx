import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatToIST } from "@/lib/utils"
import { ResumeUploadLogDetails } from "@/lib/candidates-api"
import { Loader2 } from "lucide-react"

interface ResumeUploadLogDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  details: ResumeUploadLogDetails | null
  loading: boolean
}

export function ResumeUploadLogDetailsDialog({ 
  open, 
  onOpenChange, 
  details, 
  loading 
}: ResumeUploadLogDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Failed Resume Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !details ? (
          <div className="text-center py-8 text-muted-foreground">
            No details available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Uploaded By: </span>
                <span className="font-medium">{details.uploaded_by}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Files: </span>
                <span className="font-medium">{details.total_files}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Started At: </span>
                <span className="font-medium">{formatToIST(details.started_at)}</span>
              </div>
            </div>

            {/* Failed Details Table */}
            {details.failed_details && details.failed_details.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Completed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.failed_details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{detail.file_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              detail.status === "completed"
                                ? "default"
                                : detail.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {detail.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">{detail.message}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatToIST(detail.started_at)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatToIST(detail.completed_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No failed resumes in this upload
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
