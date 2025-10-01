import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

interface BulkActionsToolbarProps {
  selectedCount: number
  onBulkAction: (action: string, data?: any) => void
}

export function BulkActionsToolbar({ selectedCount, onBulkAction }: BulkActionsToolbarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    onBulkAction("delete")
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-md px-2 py-1 w-auto">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 h-5">
            {selectedCount} candidate{selectedCount > 1 ? "s" : ""} selected
          </Badge>

          <Button 
            variant="outline"
            className="h-5 px-1.5 text-[11px] text-red-700 border-red-300 hover:bg-red-50 leading-none"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3 w-3 mr-0.5" />
            Delete
          </Button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Selected Candidates"
        description={`Are you sure you want to delete ${selectedCount} candidate${selectedCount > 1 ? "s" : ""}? This action cannot be undone.`}
      />
    </>
  )
}