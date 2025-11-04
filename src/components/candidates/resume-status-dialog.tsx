import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { PositionResumeStatus } from "@/lib/candidates-api"

interface ResumeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  positions: PositionResumeStatus[]
  loading: boolean
}

export function ResumeStatusDialog({ open, onOpenChange, positions, loading }: ResumeStatusDialogProps) {
  console.log('ResumeStatusDialog render:', { open, loading, positionsCount: positions.length, positions })
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Resume Status</DialogTitle>
          <DialogDescription>
            View position-wise resume status summary
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resume status data found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead className="text-center">Total Candidates</TableHead>
                  <TableHead className="text-center">With Resume</TableHead>
                  <TableHead className="text-center">Without Resume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{position.position_title}</TableCell>
                    <TableCell className="text-center">{position.total_candidates}</TableCell>
                    <TableCell className="text-center text-green-600 font-medium">
                      {position.with_resume}
                    </TableCell>
                    <TableCell className="text-center text-red-600 font-medium">
                      {position.without_resume}
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
