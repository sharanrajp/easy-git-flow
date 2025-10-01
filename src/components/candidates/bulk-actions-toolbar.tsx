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
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} candidate{selectedCount > 1 ? "s" : ""} selected
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
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