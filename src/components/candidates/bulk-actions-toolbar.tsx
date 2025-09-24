import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, CheckCircle } from "lucide-react"
import { getAllUsers } from "@/lib/auth"
import type { Candidate } from "@/lib/mock-data"

interface BulkActionsToolbarProps {
  selectedCandidates: Candidate[]
  onBulkAction: (action: string, data?: any) => void
  onClearSelection: () => void
}

export function BulkActionsToolbar({ selectedCandidates, onBulkAction, onClearSelection }: BulkActionsToolbarProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedPanelist, setSelectedPanelist] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [panelists, setPanelists] = useState<any[]>([])

  useEffect(() => {
    const fetchPanelists = async () => {
      try {
        const users = await getAllUsers()
        setPanelists(users.filter((user) => user.role === "panelist" && user.status === "available"))
      } catch (error) {
        console.error("Failed to fetch panelists:", error)
        setPanelists([])
      }
    }
    fetchPanelists()
  }, [])

  const handleBulkAssign = () => {
    if (selectedPanelist) {
      onBulkAction("assign", { panelist: selectedPanelist })
      setSelectedPanelist("")
      setIsAssignDialogOpen(false)
    }
  }

  const handleBulkStatusChange = () => {
    if (selectedStatus) {
      onBulkAction("status", { status: selectedStatus })
      setSelectedStatus("")
      setIsStatusDialogOpen(false)
    }
  }

  if (selectedCandidates.length === 0) {
    return null
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Assign Panelist */}
            <div className="flex items-center space-x-2">
              <Select value={selectedPanelist} onValueChange={setSelectedPanelist}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {panelists.map((panelist) => (
                    <SelectItem key={panelist._id} value={panelist.name}>
                      {panelist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleBulkAssign}
                disabled={!selectedPanelist}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign
              </Button>
            </div>

            {/* Change Status */}
            <div className="flex items-center space-x-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shortlisted">Shortlist</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleBulkStatusChange}
                disabled={!selectedStatus}
                variant="outline"
              >
                Update
              </Button>
            </div>

            {/* Delete */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkAction("delete")}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>

            {/* Clear Selection */}
            <Button size="sm" variant="ghost" onClick={onClearSelection} className="text-gray-600">
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}