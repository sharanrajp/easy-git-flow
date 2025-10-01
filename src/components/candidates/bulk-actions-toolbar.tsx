import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, UserCheck } from "lucide-react"
import { getAllUsers, type User } from "@/lib/auth"

interface BulkActionsToolbarProps {
  selectedCount: number
  onBulkAction: (action: string, data?: any) => void
}

export function BulkActionsToolbar({ selectedCount, onBulkAction }: BulkActionsToolbarProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedPanelist, setSelectedPanelist] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [panelists, setPanelists] = useState<User[]>([])

  useEffect(() => {
    const fetchPanelists = async () => {
      try {
        const users = await getAllUsers()
        setPanelists(users.filter((user: User) => user.role === "panelist" && user.current_status === "free"))
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
      setIsAssignDialogOpen(false)
      setSelectedPanelist("")
    }
  }

  const handleBulkStatusUpdate = () => {
    if (selectedStatus) {
      onBulkAction("status", { status: selectedStatus })
      setIsStatusDialogOpen(false)
      setSelectedStatus("")
    }
  }

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {selectedCount} candidate{selectedCount > 1 ? "s" : ""} selected
        </Badge>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Panelist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Panelist to Selected Candidates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Panelist</label>
                  <Select value={selectedPanelist} onValueChange={setSelectedPanelist}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a panelist" />
                    </SelectTrigger>
                    <SelectContent>
                      {panelists.map((panelist: User) => (
                        <SelectItem key={panelist._id} value={panelist.name}>
                          {panelist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleBulkAssign} disabled={!selectedPanelist}>
                    Assign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                <Users className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Status for Selected Candidates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsStatusDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleBulkStatusUpdate} disabled={!selectedStatus}>
                    Update Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}