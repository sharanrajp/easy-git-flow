import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { formatToIST } from "@/lib/utils"
import { CandidateResumeStatus } from "@/lib/candidates-api"

interface ResumeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidates: CandidateResumeStatus[]
  loading: boolean
}

export function ResumeStatusDialog({ open, onOpenChange, candidates, loading }: ResumeStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Resume Status</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resume status data found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Resume Status</TableHead>
                  <TableHead>Resume Link</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.candidate_id}>
                    <TableCell className="font-medium">{candidate.candidate_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          candidate.resume_status === "available"
                            ? "default"
                            : candidate.resume_status === "missing"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {candidate.resume_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {candidate.resume_link ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(candidate.resume_link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatToIST(candidate.last_updated)}
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
