// @ts-nocheck

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Grid,
  List,
  Users,
  ChevronDown,
} from "lucide-react"
import { type Vacancy } from "@/lib/mock-data"
import { getAllUsers } from "@/lib/auth"
import { fetchVacancies, addVacancy } from "@/lib/vacancy-api"
import { makeAuthenticatedRequest } from "@/lib/auth"
import { VacancyForm } from "@/components/vacancies/vacancy-form"
import { VacancyDetails } from "@/components/vacancies/vacancy-details"
import { PanelistSelector } from "@/components/vacancies/panelist-selector"
import { formatDate } from "@/lib/utils"

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [recruiterFilter, setRecruiterFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPanelistEditOpen, setIsPanelistEditOpen] = useState(false)
  const [candidateCounts, setCandidateCounts] = useState<
    Record<string, { applications: number; shortlisted: number; interviewed: number; joined: number }>
  >({})

  const getCandidateCountsForVacancy = useCallback((vacancyTitle: string) => {
    if (typeof window === "undefined") return { applications: 0, shortlisted: 0, interviewed: 0, joined: 0 }

    const storedCandidates = localStorage.getItem("candidates")
    if (!storedCandidates) return { applications: 0, shortlisted: 0, interviewed: 0, joined: 0 }

    const candidates = JSON.parse(storedCandidates)
    const vacancyCandidates = candidates.filter((c: any) => c.applied_position === vacancyTitle)

    return {
      applications: vacancyCandidates.length,
      shortlisted: vacancyCandidates.filter((c: any) => c.status === "shortlisted").length,
      interviewed: vacancyCandidates.filter((c: any) => c.status === "interviewed" || c.status === "in_interview")
        .length,
      joined: vacancyCandidates.filter((c: any) => c.status === "hired" || c.status === "joined").length,
    }
  }, [])

  // Load vacancies from API on component mount
  useEffect(() => {
    const loadVacancies = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedVacancies = await fetchVacancies()
        setVacancies(fetchedVacancies)
      } catch (err) {
        console.error('Failed to load vacancies:', err)
        setError(err instanceof Error ? err.message : 'Failed to load vacancies')
      } finally {
        setLoading(false)
      }
    }

    loadVacancies()
  }, [])

  useEffect(() => {
    const updateCandidateCounts = () => {
      if (typeof window === "undefined") return

      const newCounts: Record<
        string,
        { applications: number; shortlisted: number; interviewed: number; joined: number }
      > = {}

      vacancies.forEach((vacancy) => {
        newCounts[vacancy.position_title] = getCandidateCountsForVacancy(vacancy.position_title)
      })

      setCandidateCounts(newCounts)
    }

    // Initial load
    updateCandidateCounts()

    const handleCandidateUpdate = () => {
      updateCandidateCounts()
    }

    window.addEventListener("candidateUpdated", handleCandidateUpdate)
    window.addEventListener("storage", handleCandidateUpdate)

    return () => {
      window.removeEventListener("candidateUpdated", handleCandidateUpdate)
      window.removeEventListener("storage", handleCandidateUpdate)
    }
  }, [vacancies, getCandidateCountsForVacancy])

  useEffect(() => {
    const handleCloseDialog = () => {
      setIsCreateOpen(false)
      setIsEditOpen(false)
    }

    window.addEventListener("closeVacancyDialog", handleCloseDialog)
    return () => {
      window.removeEventListener("closeVacancyDialog", handleCloseDialog)
    }
  }, [])

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      vacancy.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vacancy.status === statusFilter
    const matchesPriority = priorityFilter === "all" || vacancy.priority === priorityFilter
    const matchesRecruiter = recruiterFilter === "all" || vacancy.recruiter_name === recruiterFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesRecruiter
  })

  const handleCreateVacancy = async (vacancyData: Partial<Vacancy>) => {
    try {
      setError(null)
      const newVacancy = await addVacancy(vacancyData)
      setVacancies([newVacancy, ...vacancies])
      setIsCreateOpen(false)
    } catch (err) {
      console.error('Failed to create vacancy:', err)
      setError(err instanceof Error ? err.message : 'Failed to create vacancy')
    }
  }

  const handleEditVacancy = async (vacancyData: Partial<Vacancy>) => {
    if (!selectedVacancy) return

    try {
      const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/Vacancy/${selectedVacancy.id}`, {
        method: "PUT",
        body: JSON.stringify({...selectedVacancy, ...vacancyData})
      })

      if (response.ok) {
        // Reload vacancies from API to get updated data
        const updatedVacancies = await fetchVacancies()
        setVacancies(updatedVacancies)
        setIsEditOpen(false)
        setSelectedVacancy(null)
      } else {
        console.error("Failed to update vacancy:", await response.text())
      }
    } catch (error) {
      console.error("Error updating vacancy:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-700"
      case "P1":
        return "bg-orange-100 text-orange-700"
      case "P2":
        return "bg-blue-100 text-blue-700"
      case "P3":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isDeadlineExpired = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const handlePanelistUpdate = async (panelistIds: string[]) => {
    if (!selectedVacancy) return

    try {
      // Update vacancy in database
      const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/Vacancy/${selectedVacancy.id}`, {
        method: "PUT",
        body: JSON.stringify({...selectedVacancy, assignedPanelists: panelistIds})
      })

      if (response.ok) {
        // Reload vacancies from API to get updated data  
        const updatedVacancies = await fetchVacancies()
        setVacancies(updatedVacancies)
        setSelectedVacancy({ ...selectedVacancy, assignedPanelists: panelistIds })
        setIsPanelistEditOpen(false)
      } else {
        console.error("Failed to update panelists:", await response.text())
      }
    } catch (error) {
      console.error("Error updating panelists:", error)
    }
  }

  const handleStatusChange = async (vacancyId: string, newStatus: string) => {
    const vacancy = vacancies.find(v => v.id === vacancyId)
    if (!vacancy) return

    try {
      const response = await makeAuthenticatedRequest(`http://127.0.0.1:8000/Vacancy/${vacancyId}`, {
        method: "PUT", 
        body: JSON.stringify({...vacancy, status: newStatus})
      })

      if (response.ok) {
        // Reload vacancies from API to get updated data
        const updatedVacancies = await fetchVacancies()
        setVacancies(updatedVacancies)
      } else {
        console.error("Failed to update status:", await response.text())
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const [hrUsers, setHrUsers] = useState<any[]>([])
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers()
        const hrUsersList = users.filter((user: any) => user.role === 'hr')
        setHrUsers(hrUsersList)
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    }
    loadUsers()
  }, [])

  const uniqueRecruiters = Array.from(
    new Set([...vacancies.map((v) => v.recruiter_name).filter(Boolean), ...hrUsers.map((user) => user.name)]),
  )

  return (
    <DashboardLayout requiredRole="hr">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vacancies</h1>
            <p className="text-gray-600">Manage job openings and track applications</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Vacancy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Vacancy</DialogTitle>
              </DialogHeader>
              <VacancyForm onSubmit={handleCreateVacancy} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading vacancies...</span>
          </div>
        )}

        {/* Search and Filter Controls */}
        {!loading && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vacancies by position_title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="P0">P0</SelectItem>
                  <SelectItem value="P1">P1</SelectItem>
                  <SelectItem value="P2">P2</SelectItem>
                  <SelectItem value="P3">P3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Recruiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {uniqueRecruiters.map((recruiter) => (
                    <SelectItem key={recruiter} value={recruiter}>
                      {recruiter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Vacancies List/Grid */}
        {!loading && !error && (
          viewMode === "list" ? (
          <Card>
            <CardContent className="p-0">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>Position Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Experience Range</TableHead>
                      <TableHead>Drive On</TableHead>
                      <TableHead>No. of Vacancies</TableHead>
                      <TableHead>Recruiter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Panelists</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {filteredVacancies.map((vacancy) => {
                       const counts = candidateCounts[vacancy.position_title] || {
                         applications: 0,
                         shortlisted: 0,
                         interviewed: 0,
                         joined: 0,
                       }
                       return (
                         <TableRow
                           key={vacancy.id}
                         >
                          <TableCell>
                            <div className="font-mono text-sm text-gray-600">#{filteredVacancies.indexOf(vacancy) + 1}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{vacancy.position_title}</div>
                              <div className="text-sm text-gray-500">{vacancy.location}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(vacancy.priority)}>{vacancy.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{vacancy.experienceRange}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {vacancy.walkInDetails?.date 
                                ? formatDate(vacancy.walkInDetails.date)
                                : formatDate(vacancy.postedOn)
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{vacancy.number_of_vacancies}</div>
                          </TableCell>
                          <TableCell>{vacancy.recruiter_name || vacancy.hiring_manager_name}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-auto">
                                  <div className="flex items-center gap-1">
                                    <Badge className={getStatusColor(vacancy.status)}>{vacancy.status}</Badge>
                                    <ChevronDown className="h-3 w-3" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                               <DropdownMenuContent>
                                 <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "active")}>
                                   Active
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "paused")}>
                                   Paused
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "closed")}>
                                   Closed
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{vacancy.assignedPanelists.length}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => {
                                  setSelectedVacancy(vacancy)
                                  setIsPanelistEditOpen(true)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Applied:</span>
                                <span className="font-medium text-blue-600">{counts.applications}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Selected:</span>
                                <span className="font-medium text-orange-600">{counts.shortlisted}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Interviewed:</span>
                                <span className="font-medium text-purple-600">{counts.interviewed}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Joined:</span>
                                <span className="font-medium text-green-600">{counts.joined}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedVacancy(vacancy)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedVacancy(vacancy)
                                  setIsEditOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map((vacancy) => {
              const counts = candidateCounts[vacancy.position_title] || {
                applications: 0,
                shortlisted: 0,
                interviewed: 0,
                joined: 0,
              }
               return (
                 <Card
                   key={vacancy.id}
                 >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div>
                          <CardTitle className="text-lg">{vacancy.position_title}</CardTitle>
                          <p className="text-sm text-gray-600">{vacancy.location}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVacancy(vacancy)
                              setIsDetailsOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVacancy(vacancy)
                              setIsEditOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(vacancy.priority)}>{vacancy.priority}</Badge>
                      <Badge className={getStatusColor(vacancy.status)}>{vacancy.status}</Badge>
                      {isDeadlineExpired(vacancy.deadline) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Applications:</span>
                          <div className="font-medium">{counts.applications}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Panelists:</span>
                          <div className="font-medium">{vacancy.assignedPanelists.length} assigned</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          )
        )}

        {/* Empty State */}
        {!loading && !error && filteredVacancies.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vacancies found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || recruiterFilter !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by creating your first vacancy"}
            </p>
            {!searchTerm && statusFilter === "all" && priorityFilter === "all" && recruiterFilter === "all" && (
              <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Vacancy
              </Button>
            )}
          </div>
        )}

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="w-[80%] max-w-none max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vacancy Details</DialogTitle>
            </DialogHeader>
            <div className="mt-6">{selectedVacancy && <VacancyDetails vacancy={selectedVacancy} />}</div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vacancy</DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              {selectedVacancy && (
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Vacancy Details</TabsTrigger>
                    <TabsTrigger value="panelists">Panelists</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="mt-6">
                    <VacancyForm vacancy={selectedVacancy} onSubmit={handleEditVacancy} />
                  </TabsContent>
                  <TabsContent value="panelists" className="mt-6">
                    <PanelistSelector
                      selectedPanelists={selectedVacancy.assignedPanelists}
                      onUpdate={handlePanelistUpdate}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPanelistEditOpen} onOpenChange={setIsPanelistEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Edit Panelists - {selectedVacancy?.position_title}
              </DialogTitle>
            </DialogHeader>
            {selectedVacancy && (
              <PanelistSelector selectedPanelists={selectedVacancy.assignedPanelists} onUpdate={handlePanelistUpdate} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
