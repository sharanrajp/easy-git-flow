import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, CheckCircle } from "lucide-react"
import type { Candidate } from "@/lib/mock-data"

interface BulkActionsToolbarProps {
  selectedCandidates: Candidate[]
  onBulkAction: (action: string, data?: any) => void
}

export function BulkActionsToolbar({ selectedCandidates, onBulkAction }: BulkActionsToolbarProps) {
  if (selectedCandidates.length === 0) {
    return null
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onBulkAction("delete")}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}