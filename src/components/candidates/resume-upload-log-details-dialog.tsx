import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { formatToIST } from "@/lib/utils"
import { fetchResumeUploadLogDetails, type ResumeUploadLogDetails } from "@/lib/candidates-api"
import { useToast } from "@/hooks/use-toast"

interface ResumeUploadLogDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logId: string
}

export function ResumeUploadLogDetailsDialog({ 
  open, 
  onOpenChange, 
  logId 
}: ResumeUploadLogDetailsDialogProps) {
  const { toast } = useToast()
  const [details, setDetails] = useState<ResumeUploadLogDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && logId) {
      loadDetails()
    }
  }, [open, logId])

  const loadDetails = async () => {
    setLoading(true)
    try {
      const data = await fetchResumeUploadLogDetails(logId)
      setDetails(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load log details",
      })
    } finally {
      setLoading(false)
    }
  }

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
        ) : !details || details.failed_details.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No failed resumes found
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
                {details.failed_details.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.file_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatToIST(item.started_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatToIST(item.completed_at)}
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
