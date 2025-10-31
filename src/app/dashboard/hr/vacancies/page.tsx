// @ts-nocheck

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  X,
} from "lucide-react";
import { type Position } from "@/lib/schema-data";
import { getAllUsers } from "@/lib/auth";
import { fetchVacancies, addVacancy, transformFrontendToBackend } from "@/lib/vacancy-api";
import { makeAuthenticatedRequest } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api-config";
import { VacancyForm } from "@/components/vacancies/vacancy-form";
import { VacancyDetails } from "@/components/vacancies/vacancy-details";
import { PanelistSelector } from "@/components/vacancies/panelist-selector";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [recruiterFilter, setRecruiterFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedVacancy, setSelectedVacancy] = useState<Position | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPanelistEditOpen, setIsPanelistEditOpen] = useState(false);
  const [candidateCounts, setCandidateCounts] = useState<
    Record<string, { applications: number; shortlisted: number; interviewed: number; joined: number }>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [interviewType, setInterviewType] = useState<"walk-in" | "virtual">("walk-in");

  const getCandidateCountsForVacancy = useCallback((vacancyTitle: string) => {
    return { applications: 0, shortlisted: 0, interviewed: 0, joined: 0 };
    // Note: Candidate counts should now be fetched from API

    return {
      applications: vacancyCandidates.length,
      shortlisted: vacancyCandidates.filter((c: any) => c.status === "shortlisted").length,
      interviewed: vacancyCandidates.filter((c: any) => c.status === "interviewed" || c.status === "in_interview")
        .length,
      joined: vacancyCandidates.filter((c: any) => c.status === "hired" || c.status === "joined").length,
    };
  }, []);

  // Load vacancies from API on component mount
  useEffect(() => {
    const loadVacancies = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedVacancies = await fetchVacancies();
        setVacancies(fetchedVacancies);
      } catch (err) {
        console.error("Failed to load vacancies:", err);
        setError(err instanceof Error ? err.message : "Failed to load vacancies");
      } finally {
        setLoading(false);
      }
    };

    loadVacancies();
  }, []);

  useEffect(() => {
    const updateCandidateCounts = () => {
      if (typeof window === "undefined") return;

      const newCounts: Record<
        string,
        { applications: number; shortlisted: number; interviewed: number; joined: number }
      > = {};

      vacancies.forEach((vacancy) => {
        newCounts[vacancy.position_title] = getCandidateCountsForVacancy(vacancy.position_title);
      });

      setCandidateCounts(newCounts);
    };

    // Initial load
    updateCandidateCounts();

    const handleCandidateUpdate = () => {
      updateCandidateCounts();
    };

    window.addEventListener("candidateUpdated", handleCandidateUpdate);
    window.addEventListener("storage", handleCandidateUpdate);

    return () => {
      window.removeEventListener("candidateUpdated", handleCandidateUpdate);
      window.removeEventListener("storage", handleCandidateUpdate);
    };
  }, [vacancies, getCandidateCountsForVacancy]);

  useEffect(() => {
    const handleCloseDialog = () => {
      setIsCreateOpen(false);
      setIsEditOpen(false);
    };

    window.addEventListener("closeVacancyDialog", handleCloseDialog);
    return () => {
      window.removeEventListener("closeVacancyDialog", handleCloseDialog);
    };
  }, []);

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      (vacancy.position_title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (vacancy.location?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || vacancy.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || vacancy.priority === priorityFilter;
    const matchesRecruiter = recruiterFilter === "all" || vacancy.recruiter_name === recruiterFilter;

    // Filter by interview type
    const matchesInterviewType = 
      interviewType === "walk-in" 
        ? vacancy.walkInDetails?.date 
        : !vacancy.walkInDetails?.date;

    return matchesSearch && matchesStatus && matchesPriority && matchesRecruiter && matchesInterviewType;
  });

  const totalPages = Math.ceil(filteredVacancies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVacancies = filteredVacancies.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, recruiterFilter, interviewType]);

  const handleCreateVacancy = async (vacancyData: Partial<Position>) => {
    try {
      setError(null);
      const newVacancy = await addVacancy(vacancyData);

      // Keep all original form data and only take id and postedOn from backend
      const completeVacancy = {
        ...vacancyData,
        id: newVacancy.id || newVacancy._id,
        postedOn: newVacancy.postedOn || new Date().toISOString(),
      };

      setVacancies([...vacancies, completeVacancy]);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create vacancy:", err);
      setError(err instanceof Error ? err.message : "Failed to create vacancy");
    }
  };

  const handleEditVacancy = async (vacancyData: Partial<Position>) => {
    if (!selectedVacancy) return;

    try {
      const transformedData = transformFrontendToBackend(vacancyData);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/Vacancy/${selectedVacancy.id}`, {
        method: "PUT",
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        // Reload vacancies from API to get updated data
        const updatedVacancies = await fetchVacancies();
        setVacancies(updatedVacancies);
        setIsEditOpen(false);
        setSelectedVacancy(null);
      } else {
        console.error("Failed to update vacancy:", await response.text());
      }
    } catch (error) {
      console.error("Error updating vacancy:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-700";
      case "P1":
        return "bg-orange-100 text-orange-700";
      case "P2":
        return "bg-blue-100 text-blue-700";
      case "P3":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "joined":
        return "bg-blue-100 text-blue-800";
      case "offer Accepted":
        return "bg-emerald-100 text-emerald-800";
      case "offer Declined":
        return "bg-red-100 text-red-800";
      case "on-Hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabels = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "paused":
        return "Paused";
      case "closed":
        return "Closed";
      case "joined":
        return "Joined";
      case "offer Accepted":
        return "Offer Accepted";
      case "offer Declined":
        return "Offer Declined";
      case "on-Hold":
        return "On-Hold";
      default:
        return status;
    }
  }

  const isDeadlineExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handlePanelistUpdate = async (panelistIds: string[]) => {
    if (!selectedVacancy) return;

    try {
      // Update vacancy with proper backend transformation
      const updatedVacancy = { ...selectedVacancy, assignedPanelists: panelistIds };
      const transformedData = transformFrontendToBackend(updatedVacancy);
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/Vacancy/${selectedVacancy.id}`, {
        method: "PUT",
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        // Reload vacancies from API to get updated data
        const updatedVacancies = await fetchVacancies();
        setVacancies(updatedVacancies);
        setSelectedVacancy({ ...selectedVacancy, assignedPanelists: panelistIds });
      } else {
        console.error("Failed to update panelists:", await response.text());
      }
    } catch (error) {
      console.error("Error updating panelists:", error);
    }
  };

  const handleStatusChange = async (vacancyId: string, newStatus: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;

    try {
      // Update status with proper backend transformation
      const updatedVacancy = { ...vacancy, status: newStatus };
      const transformedData = transformFrontendToBackend(updatedVacancy);
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/Vacancy/${vacancyId}`, {
        method: "PUT",
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        // Reload vacancies from API to get updated data
        const updatedVacancies = await fetchVacancies();
        setVacancies(updatedVacancies);
      } else {
        console.error("Failed to update status:", await response.text());
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const [hrUsers, setHrUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        const hrUsersList = users.filter((user: any) => user.role === "hr");
        setHrUsers(hrUsersList);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    loadUsers();
  }, []);

  const uniqueRecruiters = Array.from(
    new Set([...vacancies.map((v) => v.recruiter_name)
      .filter(Boolean)
    ]),
  );  

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setRecruiterFilter("all");
  };

  return (
    <DashboardLayout requiredRole={["admin", "hr", "recruiter"]}>
      <div className="flex flex-col h-full pt-1">
        {/* Fixed header section */}
        <div className="flex-shrink-0 space-y-4 pb-4 border-b bg-background">
          {/* Header */}
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
            <p className="text-gray-600">View and manage all positions created in the system</p>
          </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Position</DialogTitle>
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

          {/* Search and Filter Controls */}
          {!loading && (
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search positions by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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
                    <SelectItem value="joined">Joined</SelectItem>
                    <SelectItem value="offer Accepted">Offer Accepted</SelectItem>
                    <SelectItem value="offer Declined">Offer Declined</SelectItem>
                    <SelectItem value="on-Hold">On-Hold</SelectItem>
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
                <Button variant="outline" onClick={handleClearFilters} className="whitespace-nowrap">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 pt-4">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading positions...</span>
            </div>
          )}

          {/* Positions List/Grid */}
          {!loading && !error && (
            <>
              <Tabs value={interviewType} onValueChange={(value) => setInterviewType(value as "walk-in" | "virtual")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="walk-in">Walk-in</TabsTrigger>
                  <TabsTrigger value="virtual">Virtual</TabsTrigger>
                </TabsList>

                <TabsContent value="walk-in">
                  {viewMode === "list" ? (
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
                                <TableHead>Openings</TableHead>
                                <TableHead>Recruiter</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>No. of Panelists</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedVacancies.map((vacancy) => {
                                const counts = candidateCounts[vacancy.position_title] || {
                                  applications: 0,
                                  shortlisted: 0,
                                  interviewed: 0,
                                  joined: 0,
                                };
                                return (
                                  <TableRow key={vacancy.id}>
                                    <TableCell>
                                      <div className="font-mono text-sm text-gray-600">
                                        {filteredVacancies.indexOf(vacancy) + 1}
                                      </div>
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
                                      <div className="text-sm">{vacancy.experience_range}</div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-sm">
                                        {vacancy.walkInDetails?.date
                                          ? formatDate(vacancy.walkInDetails.date)
                                          : formatDate(vacancy.postedOn)}
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
                                              <Badge className={getStatusColor(vacancy.status)}>{getStatusLabels(vacancy.status)}</Badge>
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
                                            <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "joined")}>
                                            Joined
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "offer Accepted")}>
                                            Offer Accepted
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "offer Declined")}>
                                            Offer Declined
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "on-Hold")}>
                                            On-Hold
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
                                            setSelectedVacancy(vacancy);
                                            setIsPanelistEditOpen(true);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedVacancy(vacancy);
                                            setIsDetailsOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedVacancy(vacancy);
                                            setIsEditOpen(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {!loading && !error && filteredVacancies.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={10} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center w-full">
                                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Plus className="h-8 w-8 text-gray-400" />
                                      </div>
                                      <h3 className="text-lg font-medium text-gray-900 mb-2">No walk-in positions found</h3>
                                      <p className="text-gray-500 mb-4">
                                        {searchTerm ||
                                        statusFilter !== "all" ||
                                        priorityFilter !== "all" ||
                                        recruiterFilter !== "all"
                                          ? "Try adjusting your search criteria"
                                          : "No walk-in positions available"}
                                      </p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TooltipProvider>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedVacancies.map((vacancy) => {
                        const counts = candidateCounts[vacancy.position_title] || {
                          applications: 0,
                          shortlisted: 0,
                          interviewed: 0,
                          joined: 0,
                        };
                        return (
                          <Card key={vacancy.id}>
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
                                        setSelectedVacancy(vacancy);
                                        setIsDetailsOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedVacancy(vacancy);
                                        setIsEditOpen(true);
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
                                {isDeadlineExpired(vacancy.deadline) && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Panelists:</span>
                                    <div className="font-medium">{vacancy.assignedPanelists.length} assigned</div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="virtual">
                  {viewMode === "list" ? (
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
                                <TableHead>Openings</TableHead>
                                <TableHead>Recruiter</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>No. of Panelists</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedVacancies.map((vacancy) => {
                                const counts = candidateCounts[vacancy.position_title] || {
                                  applications: 0,
                                  shortlisted: 0,
                                  interviewed: 0,
                                  joined: 0,
                                };
                                return (
                                  <TableRow key={vacancy.id}>
                                    <TableCell>
                                      <div className="font-mono text-sm text-gray-600">
                                        {filteredVacancies.indexOf(vacancy) + 1}
                                      </div>
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
                                      <div className="text-sm">{vacancy.experience_range}</div>
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
                                            <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "joined")}>
                                            Joined
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "offer Accepted")}>
                                            Offer Accepted
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "offer Declined")}>
                                            Offer Declined
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleStatusChange(vacancy.id, "on-Hold")}>
                                            On-Hold
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
                                            setSelectedVacancy(vacancy);
                                            setIsPanelistEditOpen(true);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedVacancy(vacancy);
                                            setIsDetailsOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedVacancy(vacancy);
                                            setIsEditOpen(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {!loading && !error && filteredVacancies.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={9} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center w-full">
                                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Plus className="h-8 w-8 text-gray-400" />
                                      </div>
                                      <h3 className="text-lg font-medium text-gray-900 mb-2">No virtual positions found</h3>
                                      <p className="text-gray-500 mb-4">
                                        {searchTerm ||
                                        statusFilter !== "all" ||
                                        priorityFilter !== "all" ||
                                        recruiterFilter !== "all"
                                          ? "Try adjusting your search criteria"
                                          : "No virtual positions available"}
                                      </p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TooltipProvider>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedVacancies.map((vacancy) => {
                        const counts = candidateCounts[vacancy.position_title] || {
                          applications: 0,
                          shortlisted: 0,
                          interviewed: 0,
                          joined: 0,
                        };
                        return (
                          <Card key={vacancy.id}>
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
                                        setSelectedVacancy(vacancy);
                                        setIsDetailsOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedVacancy(vacancy);
                                        setIsEditOpen(true);
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
                                {isDeadlineExpired(vacancy.deadline) && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Panelists:</span>
                                    <div className="font-medium">{vacancy.assignedPanelists.length} assigned</div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-4" />

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="w-[80%] max-w-none max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Position Details</DialogTitle>
            </DialogHeader>
            <div className="mt-6">{selectedVacancy && <VacancyDetails vacancy={selectedVacancy} />}</div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
            </DialogHeader>
            {selectedVacancy && <VacancyForm vacancy={selectedVacancy} onSubmit={handleEditVacancy} />}
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
  );
}
