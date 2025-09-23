import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, CheckCircle } from "lucide-react"
import { getAllUsers } from "@/lib/auth"
import type { Candidate } from "@/lib/mock-data"

interface BulkActionsToolbarProps {
  selectedCandidates: Candidate[]
  onClearSelection: () => void
  onBulkAction: (action: string, data?: any) => void
}

export function BulkActionsToolbar({ selectedCandidates, onClearSelection, onBulkAction }: BulkActionsToolbarProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedPanelist, setSelectedPanelist] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const panelists = getAllUsers().filter((user) => user.role === "panelist" && user.status === "available")

  const handleBulkAssign = () => {
    if (selectedPanelist) {
      onBulkAction("assign", { panelist: selectedPanelist })
      setIsAssignDialogOpen(false)
      setSelectedPanelist("")
    }
  }

  const handleBulkStatusChange = () => {
    if (selectedStatus) {
      onBulkAction("changeStatus", { status: selectedStatus })
      setIsStatusDialogOpen(false)
      setSelectedStatus("")
    }
  }

  const handleBulkExport = () => {
    const csvContent = [
      "Name,Email,Phone,Position,Experience,Skills,Status,Applied Date",
      ...selectedCandidates.map(
        (candidate) =>
          `"${candidate.name}","${candidate.email}","${candidate.phone}","${candidate.appliedPosition}","${candidate.experience}","${candidate.skills?.join("; ") || "No skills"}","${candidate.status}","${candidate.appliedDate}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `candidates_export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedCandidates.slice(0, 3).map((candidate) => (
                <Badge key={candidate.id} variant="secondary" className="text-xs">
                  {candidate.name}
                </Badge>
              ))}
              {selectedCandidates.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedCandidates.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction("delete")}
              className="bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedCandidates.length})
            </Button>

            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
