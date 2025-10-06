// @ts-nocheck

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, Trash2, Grid, List } from "lucide-react"
import { getAllUsers, type User, makeAuthenticatedRequest } from "@/lib/auth"
import { UserForm } from "@/components/users/user-form"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { SkillsDisplay } from "@/components/ui/skills-display"

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showDeleteSelected, setShowDeleteSelected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    setShowDeleteSelected(selectedUsers.length > 0)
  }, [selectedUsers])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = (() => {
      if (roleFilter === "all") return true
      if (roleFilter === "manager") {
        return (user.role === "panelist" && user.panelist_type === "manager")
      }
      if (roleFilter === "panelist") {
        return ((user.role === "panelist" && user.panelist_type !== "manager") && user.role !== "hr")
      }
      return user.role === roleFilter
    })()
    const matchesStatus = statusFilter === "all" || user.current_status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user._id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((_id) => _id !== userId))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0 || deleting) return

    try {
      setDeleting(true)
      
      // Delete each selected user
      const deletePromises = selectedUsers.map(userId =>
        makeAuthenticatedRequest(`http://127.0.0.1:8000/admin/delete-user/${userId}`, {
          method: "DELETE"
        })
      )
      
      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r.ok).length
      const failCount = results.length - successCount
      
      // Remove successfully deleted users from local state
      setUsers(users.filter(user => !selectedUsers.includes(user._id)))
      setSelectedUsers([])
      
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} user(s) deleted successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        })
      }
      
      if (failCount > 0 && successCount === 0) {
        toast({
          title: "Error",
          description: "Failed to delete selected users.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting users:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting users.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const response = await makeAuthenticatedRequest("http://127.0.0.1:8000/admin/add-user", {
        method: "POST",
        body: JSON.stringify({...userData, password : "user123"})
      })

      if (response.ok) {
        const newUser = await response.json()
        // Add the new user to local state directly
        setUsers([...users, newUser])
        setIsCreateOpen(false)
        toast({
          title: "Success",
          description: `User "${newUser.name}" has been added successfully.`,
        })
      } else {
        console.error("Failed to create user:", await response.text())
        toast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the user.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async (userData: Partial<User>) => {
    if (!selectedUser) return

    try {
      const updatedUser: User = { ...selectedUser, ...userData }
      const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/admin/edit-user/${selectedUser._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser)
      })

      if (response.ok) {
        // Update the user in the local state without page refresh
        setUsers(users.map(user => user._id === selectedUser._id ? updatedUser : user))
        setIsEditOpen(false)
        setSelectedUser(null)
      } else {
        console.error("Failed to update user:", await response.text())
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser || deleting) return

    try {
      setDeleting(true)
      const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/admin/delete-user/${deleteUser._id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        // Remove the user from the local state without page refresh
        setUsers(users.filter(user => user._id !== deleteUser._id))
        
        // Also remove from selected users if it was selected
        setSelectedUsers(selectedUsers.filter(id => id !== deleteUser._id))
        
        toast({
          title: "Success",
          description: `User "${deleteUser.name}" has been deleted successfully.`,
        })
        
        setDeleteUser(null)
      } else {
        const errorText = await response.text()
        console.error("Failed to delete user:", errorText)
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the user.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (userId: string, current_status: User["current_status"]) => {
    // TODO: Implement API call to update user current_status
    console.log("Update user current_status:", userId, current_status)
    fetchUsers() // Refresh the list
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "hr":
        return "bg-blue-100 text-blue-800"
      case "panelist":
        return "bg-green-100 text-green-800"
      case "manager":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (current_status?: string) => {
    switch (current_status) {
      case "free":
        return "bg-green-100 text-green-800"
      case "in_interview":
        return "bg-orange-100 text-orange-800"
      case "break":
        return "bg-gray-100 text-gray-800"
      case "unavailable":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatRole = (role: string, panelist_type?: string) => {
    switch (role) {
      case "hr":
        return "HR Admin"
      case "panelist":
        return panelist_type === "manager" ? "Panelist (Manager)" : "Panelist (Panel Member)"
      case "manager":
        return "Manager"
      default:
        return role
    }
  }

  return (
    <DashboardLayout requiredRole="hr">
      <div className="flex flex-col h-full">
        {/* Fixed header section */}
        <div className="flex-shrink-0 space-y-4 pb-4 border-b bg-background">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600">Manage system users and their roles</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <UserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {showDeleteSelected && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : `Delete Selected (${selectedUsers.length})`}
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="hr">HR Admin</SelectItem>
                  <SelectItem value="panelist">Panelist</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="free">Available</SelectItem>
                  <SelectItem value="in_interview">In Interview</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="cursor-pointer"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="cursor-pointer"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content section */}
        <div className="flex-1 overflow-auto pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <>
            {viewMode === "list" ? (
              <>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Interview Rounds</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={(checked) => handleSelectUser(user._id, checked as boolean)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{formatRole(user.role, user.panelist_type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <SkillsDisplay skills={user.skill_set || []} />
                      </TableCell>
                      <TableCell>
                        {user.available_rounds ? (
                          <div className="flex flex-wrap gap-1">
                            {user.available_rounds.map((round) => (
                              <Badge key={round} variant="secondary" className="text-xs">
                                {round}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role === "panelist" && user.current_status ? (
                          user.current_status === "in_interview" ? (
                            <Badge className={getStatusColor(user.current_status)}>in_interview</Badge>
                          ) : (
                            <Badge className={getStatusColor(user.current_status)}>{user.current_status === "free" ? "available" : user.current_status}</Badge>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditOpen(true)
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteUser(user)}
                            className="cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-4"
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <Card key={user._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onCheckedChange={(checked) => handleSelectUser(user._id, checked as boolean)}
                            className="cursor-pointer"
                          />
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteUser(user)} className="text-red-600 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getRoleColor(user.role)} text-xs`}>
                            {formatRole(user.role, user.panelist_type)}
                          </Badge>
                          {user.role === "panelist" &&
                            user.current_status &&
                            (user.current_status === "in_interview" ? (
                              <Badge className={`${getStatusColor(user.current_status)} text-xs`}>in_interview</Badge>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-0 h-auto cursor-pointer">
                                    <Badge className={`${getStatusColor(user.current_status)} text-xs`}>{user.current_status === "free" ? "available" : user.current_status}</Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user._id, "free")}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                      Available
                                    </div>
                                  </DropdownMenuItem>
                                  {user.current_status === "free" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleStatusChange(user._id, "break")}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center">
                                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                                          Break
                                        </div>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
                        </div>

                        {Array.isArray(user.skill_set) && user.skill_set.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {user.skill_set.slice(0, 2).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {user.skill_set.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.skill_set.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first user"}
                  </p>
                  {!searchTerm && roleFilter === "all" && statusFilter === "all" && (
                    <Button
                      onClick={() => setIsCreateOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  )}
                </div>
              )}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-4"
                />
              </>
            )}
          </>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              {selectedUser && (
                <UserForm user={selectedUser} onSubmit={handleEditUser} onCancel={() => setIsEditOpen(false)} />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          open={!!deleteUser && !deleting}
          onOpenChange={(open) => {
            if (!deleting) {
              setDeleteUser(null)
            }
          }}
          onConfirm={handleDeleteUser}
          title="Delete User"
          description={`Are you sure you want to delete the user "${deleteUser?.name}"? This action cannot be undone.`}
        />
      </div>
    </DashboardLayout>
  )
}
