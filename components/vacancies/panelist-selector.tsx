import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, X, Users, CheckCircle } from "lucide-react"
import { getAllUsers, type User } from "@/lib/auth"

interface PanelistSelectorProps {
  selectedPanelists: string[]
  onUpdate: (panelistIds: string[]) => void
}

export function PanelistSelector({ selectedPanelists, onUpdate }: PanelistSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers()
        setAllUsers(users)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setAllUsers([])
      }
    }
    fetchUsers()
  }, [])

  // Filter users to get potential panelists (all users are valid panelists)
  const availablePanelists = allUsers

  // Filter based on search term
  const filteredPanelists = availablePanelists.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.skills && user.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  // Get selected and unselected panelists
  const selectedPanelistsData = availablePanelists.filter((user: User) => selectedPanelists.includes(user._id))

  const unselectedPanelists = filteredPanelists.filter((user: User) => !selectedPanelists.includes(user._id))

  const handleAddPanelist = (panelistId: string) => {
    const updatedPanelists = [...selectedPanelists, panelistId]
    onUpdate(updatedPanelists)
  }

  const handleRemovePanelist = (panelistId: string) => {
    const updatedPanelists = selectedPanelists.filter((id) => id !== panelistId)
    onUpdate(updatedPanelists)
  }

  const PanelistCard = ({
    user,
    isSelected,
    onAdd,
    onRemove,
  }: {
    user: User
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
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{user.name}</h4>
              {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
            </div>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">{user.role}</p>

            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.skills.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {user.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {user.status && (
              <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs mt-2">
                {user.status}
              </Badge>
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
              {selectedPanelistsData.map((user: User) => (
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
                unselectedPanelists.map((user: User) => (
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

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{selectedPanelists.length}</span> panelists selected
          {selectedPanelists.length > 0 && <span className="ml-2">• Ready to proceed</span>}
        </div>
        {selectedPanelists.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => onUpdate([])} className="text-red-600">
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}