import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Plus, X, Users, CheckCircle, Loader2 } from "lucide-react"
import { getAllUsers } from "@/lib/auth"
import { makeAuthenticatedRequest } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface PanelistSelectorProps {
  selectedPanelists: string[]
  onUpdate: (panelistIds: string[]) => void
}

export function PanelistSelector({ selectedPanelists, onUpdate }: PanelistSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const users = await getAllUsers()
        setAllUsers(users)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setAllUsers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Filter users to get potential panelists (only role=panelist and panelist_type !== panel_member)
  const availablePanelists = allUsers.filter(
    (user) => user.current_status === "free" && user.role === "panelist" && user.panelist_type !== "manager" && user.role !== "hr"
  )

  // Filter based on search term
  const filteredPanelists = availablePanelists.filter(
    (user) =>
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(user.skill_set) && user.skill_set.some((skill: string) => skill && skill.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  // Get selected and unselected panelists
  const selectedPanelistsData = availablePanelists.filter((user) => selectedPanelists.includes(user._id))

  const unselectedPanelists = filteredPanelists.filter((user) => !selectedPanelists.includes(user._id))

  const handleAddPanelist = (panelistId: string) => {
    const updatedPanelists = [...selectedPanelists, panelistId]
    onUpdate(updatedPanelists)
  }

  const handleRemovePanelist = (panelistId: string) => {
    const updatedPanelists = selectedPanelists.filter((id) => id !== panelistId)
    onUpdate(updatedPanelists)
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `https://b2ma3tdd2m.us-west-2.awsapprunner.com/privileges/status/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Update local state
      setAllUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, current_status: newStatus } : user
        )
      )

      toast({
        title: "Status updated",
        description: "Panelist status has been updated successfully.",
      })

      setStatusPopoverOpen(null)
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update panelist status.",
        variant: "destructive",
      })
    }
  }

  const PanelistCard = ({
    user,
    isSelected,
    onAdd,
    onRemove,
  }: {
    user: any
    isSelected: boolean
    onAdd?: () => void
    onRemove?: () => void
  }) => (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className="font-medium text-sm">
              {user.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "?"}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{user.name || "Unknown"}</h4>
              {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
            </div>
            <p className="text-sm text-gray-600">{user.email || "No email"}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">{user.role}</p>

            {Array.isArray(user.skill_set) && user.skill_set.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.skill_set.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {user.skill_set.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.skill_set.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {user.current_status && (
              <Popover
                open={statusPopoverOpen === user._id}
                onOpenChange={(open) => setStatusPopoverOpen(open ? user._id : null)}
              >
                <PopoverTrigger asChild>
                  <Badge
                    variant={user.current_status === "free" ? "default" : "secondary"}
                    className="text-xs mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {user.current_status === "free" ? "Available" : user.current_status.replace("_", " ")}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Change Status</p>
                    {[
                      { label: "Available", value: "free" },
                      { label: "In Interview", value: "in_interview" },
                      { label: "Interview Assigned", value: "interview-assigned" },
                      { label: "Break", value: "break" },
                      { label: "Unavailable", value: "unavailable" },
                    ].map((status) => (
                      <Button
                        key={status.value}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8"
                        onClick={() => handleStatusChange(user._id, status.value)}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="ml-3">
          {isSelected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold">Loading Panelists...</h3>
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Select Panelists</h3>
        </div>
        <Badge variant="outline">{selectedPanelists.length} selected</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search panelists by name, email, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Panelists */}
      {selectedPanelistsData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Selected Panelists ({selectedPanelistsData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedPanelistsData.map((user) => (
                <PanelistCard
                  key={user._id}
                  user={user}
                  isSelected={true}
                  onRemove={() => handleRemovePanelist(user._id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Panelists */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Available Panelists ({unselectedPanelists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {unselectedPanelists.length > 0 ? (
                unselectedPanelists.map((user) => (
                  <PanelistCard key={user._id} user={user} isSelected={false} onAdd={() => handleAddPanelist(user._id)} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No panelists found matching your search.</p>
                  {searchTerm && (
                    <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
