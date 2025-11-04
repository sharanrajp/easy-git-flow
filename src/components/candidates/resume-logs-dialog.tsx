import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatToIST } from "@/lib/utils"
import { ResumeProcessingLog } from "@/lib/candidates-api"
import { Loader2 } from "lucide-react"

interface ResumeLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: ResumeProcessingLog[]
  loading: boolean
}

export function ResumeLogsDialog({ open, onOpenChange, logs, loading }: ResumeLogsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Resume Processing Logs</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resume processing logs found
          </div>
        ) : (
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
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">{log.file_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "default"
                            : log.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatToIST(log.started_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatToIST(log.completed_at)}
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
