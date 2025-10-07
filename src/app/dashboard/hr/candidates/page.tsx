// @ts-nocheck

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogDescription } from "@/components/ui/dialog"
import { AssignedCandidateDetails } from "@/components/candidates/assigned-candidate-details"
import { UnassignedCandidateDetails } from "@/components/candidates/unassigned-candidate-details"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Upload,
  Timer,
  UserCheck,
  Award,
  ChevronDown,
  List,
  Download,
  Search,
  X,
} from "lucide-react"
import { fetchVacancies } from "@/lib/vacancy-api"
import { CandidateForm } from "@/components/candidates/candidate-form"
import { CandidateDetails } from "@/components/candidates/candidate-details"
import { BulkActionsToolbar } from "@/components/candidates/bulk-actions-toolbar"
import { BulkUploadDialog } from "@/components/candidates/bulk-upload-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllUsers, getCurrentUser, type User } from "@/lib/auth"
import { saveInterviewSession, type InterviewSession } from "@/lib/interview-data"
import { getInterviewSessions } from "@/lib/interview-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchUnassignedCandidates, fetchAssignedCandidates, addCandidate, updateCandidate, updateCandidateCheckIn, fetchAvailablePanels, fetchPanelistsForCandidate, assignCandidateToPanel, undoAssignment, fetchOngoingInterviews, exportCandidatesExcel, deleteCandidates, type BackendCandidate, type OngoingInterview } from "@/lib/candidates-api"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { SkillsDisplay } from "@/components/ui/skills-display"
import { Pagination } from "@/components/ui/pagination"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

export default function CandidatesPage() {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [recruiterFilter, setRecruiterFilter] = useState("all")
  const [roundFilter, setRoundFilter] = useState("all")
  const [interviewTypeFilter, setInterviewTypeFilter] = useState("all")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showEditCancelConfirm, setShowEditCancelConfirm] = useState(false)
  const [formHasChanges, setFormHasChanges] = useState(false)
  const [editFormHasChanges, setEditFormHasChanges] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [candidateToReschedule, setCandidateToReschedule] = useState<Candidate | null>(null)
  const [candidateToSchedule, setCandidateToSchedule] = useState<Candidate | null>(null)
  const [panelistSearch, setPanelistSearch] = useState("")
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [activeTab, setActiveTab] = useState("unassigned")
  const [unassignedCandidates, setUnassignedCandidates] = useState<BackendCandidate[]>([])
  const [assignedCandidates, setAssignedCandidates] = useState<BackendCandidate[]>([])
  const [loadingUnassigned, setLoadingUnassigned] = useState(false)
  const [loadingAssigned, setLoadingAssigned] = useState(false)
  const [selectedAssignedCandidate, setSelectedAssignedCandidate] = useState<BackendCandidate | null>(null)
  const [isAssignedDetailsOpen, setIsAssignedDetailsOpen] = useState(false)
  const [selectedUnassignedCandidate, setSelectedUnassignedCandidate] = useState<BackendCandidate | null>(null)
  const [isUnassignedDetailsOpen, setIsUnassignedDetailsOpen] = useState(false)
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loadingVacancies, setLoadingVacancies] = useState(false)
  const [vacancyError, setVacancyError] = useState<string | null>(null)
  
  // Panel assignment states
  const [availablePanels, setAvailablePanels] = useState<any[]>([])
  const [loadingPanels, setLoadingPanels] = useState(false)
  const [selectedCandidateForPanel, setSelectedCandidateForPanel] = useState<BackendCandidate | null>(null)
  const [isPanelDialogOpen, setIsPanelDialogOpen] = useState(false)
  const [checkingInCandidate, setCheckingInCandidate] = useState<string | null>(null)
  const [assigningCandidate, setAssigningCandidate] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [assignmentRound, setAssignmentRound] = useState<string>("")
  
  // Ongoing interviews states
  const [ongoingInterviews, setOngoingInterviews] = useState<OngoingInterview[]>([])
  const [isInterviewsDialogOpen, setIsInterviewsDialogOpen] = useState(false)
  const [loadingInterviews, setLoadingInterviews] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Search states for dialogs
  const [panelSearchTerm, setPanelSearchTerm] = useState("")
  const [interviewSearchTerm, setInterviewSearchTerm] = useState("")

  // Pagination states
  const [unassignedCurrentPage, setUnassignedCurrentPage] = useState(1)
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Helper function to get next round
  const getNextRound = (currentRound: string): string => {
    switch (currentRound?.toLowerCase()) {
      case 'r1': return 'r2';
      case 'r2': return 'r3';  
      case 'r3': return 'final';
      default: return 'r1';
    }
  }

  useEffect(() => {
    // Get current user on component mount
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
      setCandidates((prevCandidates) =>
        prevCandidates.map((candidate) => ({
          ...candidate,
          // Force re-render to update wait time display
          lastUpdated: Date.now(),
        })),
      )
    }, 1000) // Update every second for dynamic timer

    return () => clearInterval(interval)
  }, [])

  // Load vacancies when page loads
  useEffect(() => {
    const loadVacancies = async () => {
      setLoadingVacancies(true)
      setVacancyError(null)
      
      try {
        const vacancyData = await fetchVacancies()
        // Filter only active vacancies
        const activeVacancies = vacancyData.filter(vacancy => vacancy.status === "active")
        setVacancies(activeVacancies)
      } catch (error) {
        console.error('Failed to load vacancies:', error)
        setVacancyError('Failed to load vacancies')
        setVacancies([])
      } finally {
        setLoadingVacancies(false)
      }
    }

    loadVacancies()
  }, [])

  // Load all candidates in parallel when page loads
  useEffect(() => {
    const loadAllCandidates = async () => {
      setLoadingUnassigned(true)
      setLoadingAssigned(true)
      
      try {
        // Load all datasets in parallel
        const [unassignedData, assignedData] = await Promise.all([
          fetchUnassignedCandidates(),
          fetchAssignedCandidates()
        ])
        
        setUnassignedCandidates(unassignedData)
        setAssignedCandidates(assignedData)
      } catch (error) {
        console.error('Failed to load candidates:', error)
        setUnassignedCandidates([])
        setAssignedCandidates([])
      } finally {
        setLoadingUnassigned(false)
        setLoadingAssigned(false)
      }
    }

    loadAllCandidates()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("candidates", JSON.stringify(candidates))
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("candidateUpdated"))
    }
  }, [candidates])

  // Reset pagination when filters change
  useEffect(() => {
    setUnassignedCurrentPage(1)
    setAssignedCurrentPage(1)
    setCompletedCurrentPage(1)
  }, [searchTerm, jobFilter, statusFilter, experienceFilter, recruiterFilter, roundFilter, dateFilter, interviewTypeFilter])

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("")
    setDateFilter("all")
    setJobFilter("all")
    setStatusFilter("all")
    setExperienceFilter("all")
    setRecruiterFilter("all")
    setRoundFilter("all")
    setInterviewTypeFilter("all")
  }

  // Filter function for backend candidates
  const filterBackendCandidates = (candidatesList: BackendCandidate[]) => {
    return candidatesList.filter((candidate) => {
      const matchesSearch =
        (candidate.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.applied_position || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesJob = jobFilter === "all" || candidate.applied_position === jobFilter
      const matchesStatus = statusFilter === "all" || (candidate.final_status || "").toLowerCase() === statusFilter.toLowerCase()
      const matchesExperience = (() => {
        if (experienceFilter === "all") return true
        const experience = Number(candidate.total_experience) || 0
        
        switch (experienceFilter) {
          case "0-2":
            return experience >= 0 && experience <= 2
          case "3-5":
            return experience >= 3 && experience <= 5
          case "6-10":
            return experience >= 6 && experience <= 10
          case "10+":
            return experience > 10
          default:
            return true
        }
      })()
      const matchesRecruiter = recruiterFilter === "all" ? true
          : recruiterFilter === "others" ? !["linkedin", "naukri", "website", "referral"].includes((candidate.source || "").toLowerCase())
          : (candidate.source || "").toLowerCase().includes(recruiterFilter.toLowerCase())
      const matchesRound = roundFilter === "all" || (candidate.last_interview_round || "").toLowerCase() === roundFilter.toLowerCase()
      
      const matchesDate = (() => {
        if (dateFilter === "all") return true
        if (!candidate.created_at) return false
        const created_at = new Date(candidate.created_at)
        const now = new Date()

        switch (dateFilter) {
          case "today":
            // Compare calendar dates only (ignore time)
            return created_at.toDateString() === now.toDateString()
          case "week":
            const daysDiff = Math.floor((now.getTime() - created_at.getTime()) / (1000 * 60 * 60 * 24))
            return daysDiff <= 7
          case "month":
            const monthsDiff = Math.floor((now.getTime() - created_at.getTime()) / (1000 * 60 * 60 * 24))
            return monthsDiff <= 30
          default:
            return true
        }
      })()

      return (
        matchesSearch &&
        matchesJob &&
        matchesStatus &&
        matchesExperience &&
        matchesRecruiter &&
        matchesRound &&
        matchesDate
      )
    })
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      (candidate.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.applied_position || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesJob = jobFilter === "all" || candidate.applied_position === jobFilter
    const matchesStatus = statusFilter === "all" || 
      (candidate.final_status || candidate.status || "").toLowerCase() === statusFilter.toLowerCase()
    const matchesExperience = (() => {
      if (experienceFilter === "all") return true
      const experience = Number(candidate.total_experience) || 0
      
      switch (experienceFilter) {
        case "0-2":
          return experience >= 0 && experience <= 2
        case "3-5":
          return experience >= 3 && experience <= 5
        case "6-10":
          return experience >= 6 && experience <= 10
        case "10+":
          return experience > 10
        default:
          return true
      }
    })()
   const matchesRecruiter = recruiterFilter === "all" ? true
          : recruiterFilter === "others" ? !["linkedin", "naukri", "website", "referral"].includes((candidate.source || "").toLowerCase())
          : (candidate.source || "").toLowerCase().includes(recruiterFilter.toLowerCase())
    const matchesRound = roundFilter === "all" || 
      (candidate.last_interview_round || candidate.currentRound || "").toLowerCase() === roundFilter.toLowerCase()
    const matchesInterviewType = interviewTypeFilter === "all" || candidate.interview_type === interviewTypeFilter

    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const created_at = new Date(candidate.created_at)
      const now = new Date()

      switch (dateFilter) {
        case "today":
          // Compare calendar dates only (ignore time)
          return created_at.toDateString() === now.toDateString()
        case "week":
          const daysDiff = Math.floor((now.getTime() - created_at.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff <= 7
        case "month":
          const monthsDiff = Math.floor((now.getTime() - created_at.getTime()) / (1000 * 60 * 60 * 24))
          return monthsDiff <= 30
        default:
          return true
      }
    })()

    return (
      matchesSearch &&
      matchesJob &&
      matchesStatus &&
      matchesExperience &&
      matchesRecruiter &&
      matchesRound &&
      matchesInterviewType &&
      matchesDate
    )
  })

  // Apply filters to backend candidates with memoization
  const filteredUnassignedCandidates = useMemo(() => {
    return filterBackendCandidates(unassignedCandidates)
  }, [unassignedCandidates, searchTerm, jobFilter, statusFilter, experienceFilter, recruiterFilter, roundFilter, dateFilter])
  
  // Separate completed candidates from assigned candidates
  const filteredCompletedCandidates = useMemo(() => {
    const completedList = assignedCandidates.filter(
      (c) => (c.last_interview_round === "r3" && ["selected", "rejected", "on-hold", "hired", "offerReleased", "candidateDeclined", "joined"].includes(c.final_status || "") || c.final_status === "rejected")
    )
    return filterBackendCandidates(completedList)
  }, [assignedCandidates, searchTerm, jobFilter, statusFilter, experienceFilter, recruiterFilter, roundFilter, dateFilter])

  // Filter assigned candidates to exclude completed ones
  const filteredAssignedCandidates = useMemo(() => {
    const nonCompletedAssigned = assignedCandidates.filter(
      (c) => !(c.last_interview_round === "r3" && ["selected", "rejected", "on-hold", "hired", "offerReleased", "candidateDeclined", "joined"].includes(c.final_status || "") || c.final_status === "rejected")
    )
    return filterBackendCandidates(nonCompletedAssigned)
  }, [assignedCandidates, searchTerm, jobFilter, statusFilter, experienceFilter, recruiterFilter, roundFilter, dateFilter])

  // Paginated data
  const paginatedUnassignedCandidates = useMemo(() => {
    const startIndex = (unassignedCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUnassignedCandidates.slice(startIndex, endIndex)
  }, [filteredUnassignedCandidates, unassignedCurrentPage, itemsPerPage])

  const paginatedAssignedCandidates = useMemo(() => {
    const startIndex = (assignedCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAssignedCandidates.slice(startIndex, endIndex)
  }, [filteredAssignedCandidates, assignedCurrentPage, itemsPerPage])

  const [completedCurrentPage, setCompletedCurrentPage] = useState(1)
  const paginatedCompletedCandidates = useMemo(() => {
    const startIndex = (completedCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCompletedCandidates.slice(startIndex, endIndex)
  }, [filteredCompletedCandidates, completedCurrentPage, itemsPerPage])

  const unassignedTotalPages = Math.ceil(filteredUnassignedCandidates.length / itemsPerPage)
  const assignedTotalPages = Math.ceil(filteredAssignedCandidates.length / itemsPerPage)
  const completedTotalPages = Math.ceil(filteredCompletedCandidates.length / itemsPerPage)

  const statusOptions = {
    "assigned": [
      { value: "selected", label: "Selected" },
      { value: "rejected", label: "Rejected" },
      { value: "on-hold", label: "On Hold" },
      { value: "assigned", label: "Assigned" },
    ],
    "completed": [
      { value: "selected", label: "Selected" },
      { value: "hired", label: "Hired" },
      { value: "offerReleased", label: "Offer Released" },
      { value: "joined", label: "Joined" },
      { value: "on-hold", label: "On Hold" },
      { value: "candidateDeclined", label: "Candidate Declined" },
      { value: "rejected", label: "Rejected" },
    ]
  }

  const roundOptions = [
    { value: "r1", label: "r1" },
    { value: "r2", label: "r2" },
    { value: "r3", label: "r3" },
  ]

  const handleExportCandidates = async () => {
    try {
      setIsExporting(true)
      const blob = await exportCandidatesExcel()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'candidates.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({
        title: "Success",
        description: "Candidates exported successfully",
      })
    } catch (error) {
      console.error('Failed to export candidates:', error)
      toast({
        title: "Error",
        description: "Failed to export candidates",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCreateCandidate = async (candidateData: Partial<Candidate>) => {
    try {
      // Prepare data for backend API
      const backendCandidateData = {
        name: candidateData.name,
        email: candidateData.email,
        phone_number: candidateData.phone_number,
        location: candidateData.location || "",
        applied_position: candidateData.applied_position,
        total_experience: candidateData.total_experience,
        notice_period: candidateData.notice_period,
        interview_type: candidateData.interview_type,
        skill_set: candidateData.skill_set,
        current_ctc: candidateData.current_ctc || "",
        expected_ctc: candidateData.expected_ctc || "",
        willing_to_relocate: candidateData.willing_to_relocate || false,
        negotiable_ctc: candidateData.negotiable_ctc || false,
        source: candidateData.source,
        created_at: new Date().toISOString().split("T")[0],
        status: "unassigned",
        recruiter_name: candidateData?.recruiter_name || "Unknown",
        other_source: candidateData?.other_source || "",
      };

      // Call the API to add candidate
      const newBackendCandidate = await addCandidate(backendCandidateData);

      // Convert backend candidate to local candidate format
      const newCandidate: Candidate = {
        id: newBackendCandidate._id,
        name: newBackendCandidate.name,
        email: newBackendCandidate.email,
        phone_number: newBackendCandidate.phone_number || "",
        applied_position: newBackendCandidate.applied_position,
        status: newBackendCandidate.status as any,
        total_experience: newBackendCandidate.total_experience || "",
        skill_set: newBackendCandidate.skill_set || [],
        source: newBackendCandidate.source || "",
        created_at: newBackendCandidate.created_at,
        recruiter_name: newBackendCandidate.recruiter_name || "",
        assignedPanelist: newBackendCandidate.assignedPanelist,
        currentRound: newBackendCandidate.currentRound,
        interviewDateTime: newBackendCandidate.interviewDateTime,
        waitTime: newBackendCandidate.waitTime,
        waitTimeStarted: newBackendCandidate.waitTimeStarted,
        isCheckedIn: newBackendCandidate.isCheckedIn || false,
        location: newBackendCandidate.location || "",
        notice_period: newBackendCandidate.notice_period || "",
        interview_type: newBackendCandidate.interview_type || "",
        current_ctc: newBackendCandidate.current_ctc || "",
        expected_ctc: newBackendCandidate.expected_ctc || "",
        willing_to_relocate: newBackendCandidate.willing_to_relocate || false,
        negotiable_ctc: newBackendCandidate.negotiable_ctc || false,
        other_source: newBackendCandidate.other_source || "",
      };

      // Update local state with new candidate
      setCandidates([newCandidate, ...candidates]);
      setIsCreateOpen(false);
      setFormHasChanges(false);
      
      // Show success message
      toast({
        title: "Candidate added successfully",
        description: `${candidateData.name} has been added to the candidates list.`,
      });

      // Refresh unassigned candidates list immediately
      try {
        const updatedUnassigned = await fetchUnassignedCandidates();
        setUnassignedCandidates(updatedUnassigned);
      } catch (refreshError) {
        console.error("Error refreshing candidates list:", refreshError);
      }
      
      // Notify dashboards to refresh
      window.dispatchEvent(new Event('dashboardUpdate'))

    } catch (error) {
      console.error("Error creating candidate:", error);
      toast({
        variant: "destructive",
        title: "Error adding candidate",
        description: "Failed to add the candidate. Please try again.",
      });
    }
  }

  const handleEditCandidate = async (candidateData: Partial<Candidate>) => {
    if (!selectedCandidate) return

    try {
      // Get the candidate ID (_id for backend candidates)
      const candidateId = (selectedCandidate as any)._id || selectedCandidate.id
      
      // Update in backend using PUT method
      await updateCandidate(candidateId, candidateData as Partial<BackendCandidate>)
      
      setIsEditOpen(false)
      setSelectedCandidate(null)
      setEditFormHasChanges(false)

      toast({
        title: "Candidate updated",
        description: "Candidate information has been updated successfully.",
      })

      // Update local state optimistically
      setUnassignedCandidates(prev => 
        prev.map(c => c._id === candidateId ? { ...c, ...candidateData } as BackendCandidate : c)
      )
      setAssignedCandidates(prev => 
        prev.map(c => c._id === candidateId ? { ...c, ...candidateData } as BackendCandidate : c)
      )
      
      // Notify dashboards to refresh
      window.dispatchEvent(new Event('dashboardUpdate'))
    } catch (error) {
      console.error("Error updating candidate:", error)
      toast({
        variant: "destructive",
        title: "Error updating candidate",
        description: "Failed to update the candidate. Please try again.",
      })
    }
  }

  const handleDeleteCandidate = async () => {
    if (!deleteCandidate) return

    try {
      // Delete from backend using the API
      const candidateId = (deleteCandidate as any)._id || deleteCandidate.id
      await deleteCandidates([candidateId])

      // Remove from local state optimistically
      setUnassignedCandidates(prev => prev.filter(c => c._id !== candidateId))
      setAssignedCandidates(prev => prev.filter(c => c._id !== candidateId))
      setCandidates(candidates.filter((c) => c.id !== deleteCandidate.id))
      
      toast({
        title: "Candidate deleted",
        description: "Candidate has been removed successfully.",
      })
      
      // Notify dashboards to refresh
      window.dispatchEvent(new Event('dashboardUpdate'))

      setDeleteCandidate(null)
    } catch (error) {
      console.error("Error deleting candidate:", error)
      toast({
        variant: "destructive",
        title: "Error deleting candidate",
        description: "Failed to delete the candidate. Please try again.",
      })
    }
  }

  const handleBulkUpload = async (uploadedCandidates: Partial<Candidate>[]) => {
    const newCandidates = uploadedCandidates.map((candidateData, index) => ({
      id: (Date.now() + index).toString(),
      ...candidateData,
      created_at: new Date().toISOString().split("T")[0],
      status: "unassigned" as const,
      waitTime: null,
      waitTimeStarted: null,
      isCheckedIn: false,
    })) as Candidate[]

    setCandidates([...newCandidates, ...candidates])
    setIsBulkUploadOpen(false)
    
    // Refresh unassigned candidates list immediately after bulk upload
    try {
      const updatedUnassigned = await fetchUnassignedCandidates();
      setUnassignedCandidates(updatedUnassigned);
    } catch (error) {
      console.error("Error refreshing candidates list after bulk upload:", error);
    }
  }

  const handleCheckIn = (candidateId: string) => {
    const updatedCandidates = candidates.map((c) =>
      c.id === candidateId
        ? {
            ...c,
            waitTimeStarted: new Date().toISOString(),
            isCheckedIn: true,
          }
        : c,
    )
    setCandidates(updatedCandidates)
    
    // Move checked-in candidate to top of unassigned list
    setUnassignedCandidates(prev => {
      const checkedInCandidate = prev.find(c => c._id === candidateId)
      if (!checkedInCandidate) return prev
      
      const updatedCandidate = {
        ...checkedInCandidate,
        waitTimeStarted: new Date().toISOString(),
        isCheckedIn: true,
      }
      
      const otherCandidates = prev.filter(c => c._id !== candidateId)
      return [updatedCandidate, ...otherCandidates]
    })
  }

  const handleScheduleInterview = (candidate: Candidate) => {
    setCandidateToSchedule(candidate)
    setShowScheduleDialog(true)
  }

  const handleScheduleConfirm = (panelistId: string, panelistName: string) => {
    if (!candidateToSchedule) return

    const interviewSession: InterviewSession = {
      id: `interview_${candidateToSchedule.id}_${Date.now()}`,
      candidateId: candidateToSchedule.id,
      candidateName: candidateToSchedule.name,
      panelistId,
      panelistName,
      position: candidateToSchedule.applied_position,
      round: candidateToSchedule.currentRound || "r1",
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    }

    // Save interview session
    saveInterviewSession(interviewSession)

    const updatedCandidates = candidates.map((c) =>
      c.id === candidateToSchedule.id
        ? {
            ...c,
            status: "r1-scheduled" as const,
            assignedPanelist: panelistName,
            currentRound: "r1" as const,
            interviewDateTime: interviewSession.scheduledTime,
          }
        : c,
    )
    setCandidates(updatedCandidates)
    setShowScheduleDialog(false)
    setCandidateToSchedule(null)
  }

  const handleRescheduleInterview = (candidate: Candidate) => {
    setCandidateToReschedule(candidate)
    setShowRescheduleDialog(true)
  }

  const handleRescheduleConfirm = (panelistId: string, panelistName: string) => {
    if (!candidateToReschedule) return

    // Update the interview session with new panelist
    const updatedCandidate = {
      ...candidateToReschedule,
      assignedPanelist: panelistName,
      assignedPanelistId: panelistId,
    }

    // Update candidates list
    setCandidates((prev) => prev.map((c) => (c.id === candidateToReschedule.id ? updatedCandidate : c)))

    // Update interview sessions
    const sessions = getInterviewSessions()
    const updatedSessions = sessions.map((session) => {
      if (session.candidateId === candidateToReschedule.id && session.status === "scheduled") {
        return {
          ...session,
          panelistId,
          panelistName,
        }
      }
      return session
    })

    // Save updated sessions (assuming there's a function to save)
    localStorage.setItem("interviewSessions", JSON.stringify(updatedSessions))

    setShowRescheduleDialog(false)
    setCandidateToReschedule(null)
    setPanelistSearch("")
  }

  const handleCancelForm = () => {
    if (formHasChanges) {
      setShowCancelConfirm(true)
    } else {
      setIsCreateOpen(false)
      setFormHasChanges(false)
    }
  }

  const handleEditCancelForm = () => {
    if (editFormHasChanges) {
      setShowEditCancelConfirm(true)
    } else {
      setIsEditOpen(false)
      setSelectedCandidate(null)
      setEditFormHasChanges(false)
    }
  }

  const confirmCancelForm = () => {
    setIsCreateOpen(false)
    setFormHasChanges(false)
    setShowCancelConfirm(false)
  }

  const confirmEditCancelForm = () => {
    setIsEditOpen(false)
    setSelectedCandidate(null)
    setEditFormHasChanges(false)
    setShowEditCancelConfirm(false)
  }

  const formatWaitTime = (candidate: Candidate) => {
    if (!candidate.waitTimeStarted) return "0:00:00"

    const startTime = new Date(candidate.waitTimeStarted)
    const now = new Date(currentTime)
    const diffMs = Math.max(0, now.getTime() - startTime.getTime()) // Ensure non-negative values
    const totalSeconds = Math.floor(diffMs / 1000)

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Format wait time for backend candidates
  const formatBackendWaitTime = (waitMinutes?: number) => {
    if (!waitMinutes || waitMinutes === 0) return "0m"
    if (waitMinutes < 60) return `${waitMinutes}m`
    const hours = Math.floor(waitMinutes / 60)
    const minutes = waitMinutes % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  // Handle backend candidate check-in/check-out
  const handleBackendCheckIn = async (candidate: BackendCandidate, checked: boolean) => {
    setCheckingInCandidate(candidate._id)
    try {
      await updateCandidateCheckIn(candidate._id, checked)
      
      // Update local state and reorder if checking in
      setUnassignedCandidates(prev => {
        if (checked) {
          // Move checked-in candidate to the top
          const updatedCandidate = { ...candidate, checked_in: true }
          const otherCandidates = prev.filter(c => c._id !== candidate._id)
          return [updatedCandidate, ...otherCandidates]
        } else {
          // Just update the checked_in status for check-out
          return prev.map(c => 
            c._id === candidate._id 
              ? { ...c, checked_in: false }
              : c
          )
        }
      })
      
      // Notify dashboards to refresh
      window.dispatchEvent(new Event('dashboardUpdate'))
      
      toast({
        title: "Success",
        description: `${candidate.name} has been ${checked ? 'checked in' : 'checked out'} successfully.`,
      })
    } catch (error) {
      console.error('Error updating candidate check-in status:', error)
      toast({
        title: "Error",
        description: `Failed to ${checked ? 'check in' : 'check out'} candidate. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setCheckingInCandidate(null)
    }
  }

  // Handle assign panel button click
  const handleAssignPanel = async (candidate: BackendCandidate) => {
    console.log('handleAssignPanel called for candidate:', candidate) // Debug log
    setSelectedCandidateForPanel(candidate)
    setLoadingPanels(true)
    
    try {
      // Check if candidate has vacancyId
      if (!candidate.vacancyId) {
        toast({
          title: "Error",
          description: "Candidate has no vacancy ID. Cannot fetch panelists.",
          variant: "destructive",
        })
        setLoadingPanels(false)
        return
      }

      // Use the new API endpoint with candidateId and vacancyId from the candidate object
      const panelists = await fetchPanelistsForCandidate(candidate._id, candidate.vacancyId)
      console.log('Fetched panelists in handleAssignPanel:', panelists) // Debug log
      setAvailablePanels(panelists)
      setIsPanelDialogOpen(true)
    } catch (error) {
      console.error('Error fetching available panelists:', error)
      toast({
        title: "Error",
        description: "Failed to load available panelists. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingPanels(false)
    }
  }

  // Handle panel assignment
  const handlePanelAssignment = async (panelId: string) => {
    console.log('handlePanelAssignment called with panelId:', panelId) // Debug log
    console.log('selectedCandidateForPanel:', selectedCandidateForPanel) // Debug log
    console.log('currentUser:', currentUser) // Debug log
    
    if (!selectedCandidateForPanel) return
    
    if (!currentUser?._id) {
      toast({
        title: "Error",
        description: "Unable to identify current user. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }
    
    setAssigningCandidate(selectedCandidateForPanel._id)
    try {
      console.log('About to call assignCandidateToPanel with:', {
        candidateId: selectedCandidateForPanel._id,
        panelId,
        round: 'r1',
        assignedBy: currentUser._id
      }) // Debug log
      
      await assignCandidateToPanel(selectedCandidateForPanel._id, panelId, 'r1', currentUser._id)
      
      // Refresh panels to show updated status
      const updatedPanels = await fetchAvailablePanels()
      setAvailablePanels(updatedPanels)
      
      // Refresh candidate lists to move candidate from unassigned to assigned
      const [updatedUnassigned, updatedAssigned] = await Promise.all([
        fetchUnassignedCandidates(),
        fetchAssignedCandidates()
      ])
      setUnassignedCandidates(updatedUnassigned)
      setAssignedCandidates(updatedAssigned)
      
      // Notify dashboards to refresh
      window.dispatchEvent(new Event('dashboardUpdate'))
      
      toast({
        title: "Success",
        description: `${selectedCandidateForPanel.name} has been assigned to the panel successfully.`,
      })
    } catch (error) {
      console.error('Error assigning candidate to panel:', error)
      toast({
        title: "Error",
        description: "Failed to assign candidate to panel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigningCandidate(null)
    }
  }

  // Handler for Map Assign button
  const handleMapAssign = async (candidate: BackendCandidate) => {
    const nextRound = getNextRound(candidate.last_interview_round || "")
    setAssignmentRound(nextRound)
    
    // Check if candidate has vacancyId
    if (!candidate.vacancyId) {
      toast({
        title: "Error",
        description: "Candidate has no vacancy ID. Cannot fetch panelists.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setLoadingPanels(true)
      let panels = []
      if(candidate.final_status === "selected" && candidate.last_interview_round === "r2"){
        panels = (await getAllUsers() || []).filter((user) => user.role === "panelist" && user.panelist_type === "manager" && user.current_status === "free")
      } else {
        // Use the new API endpoint with candidateId and vacancyId from the candidate object
        panels = await fetchPanelistsForCandidate(candidate._id, candidate.vacancyId)
      }
      setAvailablePanels(panels)
      setSelectedCandidateForPanel(candidate)
      setIsPanelDialogOpen(true)
    } catch (error) {
      console.error('Error fetching panels for next round:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch available panels for ${nextRound}. Please try again.`,
      })
    } finally {
      setLoadingPanels(false)
    }
  }

  // Updated panel assignment handler to support both initial and next-round assignments
  const handlePanelAssignmentUpdated = async (panelId: string) => {
    if (!selectedCandidateForPanel || !currentUser || assigningCandidate) return

    setAssigningCandidate(panelId)
    
    try {
      const round = assignmentRound || "r1"
      await assignCandidateToPanel(
        selectedCandidateForPanel._id, 
        panelId, 
        round, 
        currentUser.name
      )
      
      // Refresh both candidate lists and ongoing interviews
      const [unassignedData, assignedData, interviewsData] = await Promise.all([
        fetchUnassignedCandidates(),
        fetchAssignedCandidates(),
        fetchOngoingInterviews()
      ])
      
      setUnassignedCandidates(unassignedData)
      setAssignedCandidates(assignedData)
      setOngoingInterviews(interviewsData)
      
      // Notify dashboards to refresh
      window.dispatchEvent(new Event('dashboardUpdate'))
      
      // Close the dialog and reset states
      setIsPanelDialogOpen(false)
      setSelectedCandidateForPanel(null)
      setAvailablePanels([])
      setAssignmentRound("")
      
      const roundText = assignmentRound ? ` for ${round}` : ""
      toast({
        title: "Candidate Mapped Successfully",
        description: `${selectedCandidateForPanel.name} has been mapped${roundText}.`,
      })
      
    } catch (error) {
      console.error('Error assigning candidate to panel:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to map candidate to panel. Please try again.",
      })
    } finally {
      setAssigningCandidate(null)
    }
  }

  // Handle undo assignment
  const handleUndoAssignment = async (candidateId: string, panelId: string) => {
    setAssigningCandidate(candidateId)
    
    try {
      await undoAssignment(candidateId, panelId)
      
      // Refresh both candidate lists and ongoing interviews
      const [unassignedData, assignedData, interviewsData] = await Promise.all([
        fetchUnassignedCandidates(),
        fetchAssignedCandidates(), 
        loadingInterviews ? Promise.resolve(ongoingInterviews) : fetchOngoingInterviews()
      ])
      
      setUnassignedCandidates(unassignedData)
      setAssignedCandidates(assignedData)
      if (!loadingInterviews) {
        setOngoingInterviews(interviewsData)
      }

      toast({
        title: "Success",
        description: "Assignment has been undone successfully.",
      })
    } catch (error) {
      console.error('Error undoing assignment:', error)
      toast({
        title: "Error",
        description: "Failed to undo assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigningCandidate(null)
    }
  }
  
  const handleViewInterviews = async () => {
    setIsInterviewsDialogOpen(true)
    setLoadingInterviews(true)
    
    try {
      const interviewsData = await fetchOngoingInterviews()
      setOngoingInterviews(interviewsData)
    } catch (error) {
      console.error('Error fetching ongoing interviews:', error)
      toast({
        title: "Error",
        description: "Failed to load ongoing interviews. Please try again.",
        variant: "destructive",
      })
      setOngoingInterviews([])
    } finally {
      setLoadingInterviews(false)
    }
  }
  
  const handleUnassignInterview = async (candidateId: string, panelId: string) => {
    try {
      await undoAssignment(candidateId, panelId)
      
      // Refresh ongoing interviews list
      const interviewsData = await fetchOngoingInterviews()
      setOngoingInterviews(interviewsData)
      const [updatedUnassigned, updatedAssigned] = await Promise.all([
        fetchUnassignedCandidates(),
        fetchAssignedCandidates()
      ])
      setUnassignedCandidates(updatedUnassigned)
      setAssignedCandidates(updatedAssigned)
      
      toast({
        title: "Success", 
        description: "Interview assignment has been removed successfully.",
      })
    } catch (error) {
      console.error('Error unassigning interview:', error)
      toast({
        title: "Error",
        description: "Failed to unassign interview. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUndoAssignmentOld = async (candidateId: string, panelId: string) => {
    setAssigningCandidate(candidateId)
    try {
      await undoAssignment(candidateId, panelId)
      
      // Refresh panels to show updated status
      const updatedPanels = await fetchAvailablePanels()
      setAvailablePanels(updatedPanels)
      
      // Refresh candidate lists to move candidate from assigned back to unassigned
      const [updatedUnassigned, updatedAssigned] = await Promise.all([
        fetchUnassignedCandidates(),
        fetchAssignedCandidates()
      ])
      setUnassignedCandidates(updatedUnassigned)
      setAssignedCandidates(updatedAssigned)
      
      toast({
        title: "Success",
        description: "Assignment has been undone successfully.",
      })
    } catch (error) {
      console.error('Error undoing assignment:', error)
      toast({
        title: "Error",
        description: "Failed to undo assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigningCandidate(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-800"
      case "assigned":
      case "r1-scheduled":
        return "bg-blue-100 text-blue-800"
      case "r1-in-progress":
        return "bg-orange-100 text-orange-800"
      case "r2-scheduled":
        return "bg-purple-100 text-purple-800"
      case "r2-in-progress":
        return "bg-orange-100 text-orange-800"
      case "r3-scheduled":
        return "bg-indigo-100 text-indigo-800"
      case "r3-in-progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "hired":
        return "bg-emerald-100 text-emerald-800"
      case "candidateDeclined":
      case "rejected":
        return "bg-red-100 text-red-800"
      case "offerReleased":
      case "joined":
      case "selected":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unassigned":
        return <Clock className="h-3 w-3" />
      case "assigned":
      case "r1-scheduled":
        return <Calendar className="h-3 w-3" />
      case "r1-in-progress":
      case "r2-in-progress":
      case "r3-in-progress":
        return <Timer className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "hired":
        return <Award className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "unassigned":
        return "Unassigned"
      case "assigned":
        return "Assigned"
      case "r1-scheduled":
        return "r1 Scheduled"
      case "r1-in-progress":
        return "r1 In Progress"
      case "r2-scheduled":
        return "Schedule r2"
      case "r2-in-progress":
        return "r2 In Progress"
      case "r3-scheduled":
        return "Schedule r3"
      case "r3-in-progress":
        return "r3 In Progress"
      case "completed":
        return "Completed"
      case "hired":
        return "Hired"
      case "rejected":
        return "Rejected"
      case "selected":
        return "Selected"
      default:
        return status
    }
  }

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId])
    } else {
      setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId))
    }
  }

  const handleSelectAll = (candidateList: any[], checked: boolean) => {
    if (checked) {
      const newSelected = candidateList.map((c) => c._id || c.id)
      setSelectedCandidates([...new Set([...selectedCandidates, ...newSelected])])
    } else {
      const candidateIds = candidateList.map((c) => c._id || c.id)
      setSelectedCandidates(selectedCandidates.filter((id) => !candidateIds.includes(id)))
    }
  }

  const handleBulkAction = async (action: string, data?: any) => {
    // Get the correct candidate objects based on current tab
    let selectedCandidateObjects: any[] = []
    
    switch (activeTab) {
      case "unassigned":
        selectedCandidateObjects = unassignedCandidates.filter((c) => selectedCandidates.includes(c._id))
        break
      case "assigned":
        selectedCandidateObjects = assignedCandidates.filter((c) => selectedCandidates.includes(c._id))
        break
      case "completed":
        selectedCandidateObjects = assignedCandidates.filter((c) => 
          selectedCandidates.includes(c._id) && 
          (c.last_interview_round === "r3" && 
          ["selected", "rejected", "on-hold", "hired", "offerReleased", "candidateDeclined", "joined"].includes(c.final_status || "") || c.final_status === "rejected")
        )
        break
      default:
        selectedCandidateObjects = candidates.filter((c) => selectedCandidates.includes(c._id))
    }

    switch (action) {
      case "assign":
        setCandidates(
          candidates.map((c) =>
            selectedCandidates.includes(c.id)
              ? { ...c, assignedPanelist: data.panelist, status: "assigned" as const }
              : c,
          ),
        )
        break
      case "changeStatus":
        setCandidates(
          candidates.map((c) =>
            selectedCandidates.includes(c.id) ? { ...c, status: data.status as Candidate["status"] } : c,
          ),
        )
        break
      case "unassign":
        setCandidates(
          candidates.map((c) =>
            selectedCandidates.includes(c.id)
              ? {
                  ...c,
                  status: "unassigned" as const,
                  assignedPanelist: undefined,
                  currentRound: undefined,
                  interviewDateTime: undefined,
                }
              : c,
          ),
        )
        break
      case "archive":
        // In a real app, you'd move these to an archived state
        console.log(
          "Archiving candidates:",
          selectedCandidateObjects.map((c) => c.name),
        )
        break
      case "delete":
        try {
          // Call backend API to delete candidates using the correct ID field
          const candidateIdsToDelete = selectedCandidateObjects.map((c) => c._id || c.id)
          const deleteResult = await deleteCandidates(candidateIdsToDelete);
          
          // Update local state to remove deleted candidates
          setCandidates(candidates.filter((c) => !selectedCandidates.includes(c.id)));
          
          // Refresh backend data
          const [unassignedData, assignedData] = await Promise.all([
            fetchUnassignedCandidates(),
            fetchAssignedCandidates()
          ]);
          setUnassignedCandidates(unassignedData);
          setAssignedCandidates(assignedData);
          
          // Clear selection
          setSelectedCandidates([]);
          
          // Notify dashboards to refresh
          window.dispatchEvent(new Event('dashboardUpdate'))
          
          // Show success message
          toast({
            title: "Success",
            description: `${deleteResult.deleted_count} candidate(s) deleted successfully`,
          });
        } catch (error) {
          console.error('Failed to delete candidates:', error);
          toast({
            title: "Error",
            description: "Failed to delete candidates",
            variant: "destructive",
          });
        }
        break
      case "sendEmail":
        // In a real app, you'd open an email composer or send bulk emails
        console.log(
          "Sending emails to:",
          selectedCandidateObjects.map((c) => c.email),
        )
        break
    }

    setSelectedCandidates([])
  }

  const clearSelection = () => {
    setSelectedCandidates([])
  }

  const getSelectedCandidateObjects = () => {
    let currentCandidates: any[] = []
    
    switch (activeTab) {
      case "unassigned":
        currentCandidates = unassignedCandidates
        break
      case "assigned":
        currentCandidates = assignedCandidates
        break
      case "completed":
        currentCandidates = assignedCandidates.filter((c) => 
          (c.last_interview_round === "r3" && ["selected", "rejected", "on-hold", "hired", "offerReleased", "candidateDeclined", "joined"].includes(c.final_status || "") || c.final_status === "rejected")
        )
        break
      default:
        currentCandidates = candidates
    }
    
    return currentCandidates.filter((c) => selectedCandidates.includes(c._id || c.id))
  }

  const handleChangeStatus = async (candidateId: string, newStatus: string) => {
    // Store previous state for rollback
    const previousUnassigned = [...unassignedCandidates]
    const previousAssigned = [...assignedCandidates]
    const previousCandidates = [...candidates]
    
    // Optimistically update UI immediately
    setUnassignedCandidates((prev) =>
      prev.map((c) =>
        c._id === candidateId ? { ...c, final_status: newStatus } : c
      )
    )
    setAssignedCandidates((prev) =>
      prev.map((c) =>
        c._id === candidateId ? { ...c, final_status: newStatus } : c
      )
    )
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId || c._id === candidateId ? { ...c, final_status: newStatus, status: newStatus } : c
      )
    )
    
    // Process backend update asynchronously
    try {
      await updateCandidate(candidateId, { final_status: newStatus })
      
      // Silently refresh data in background to ensure sync
      Promise.all([
        fetchUnassignedCandidates(),
        fetchAssignedCandidates()
      ]).then(([unassignedData, assignedData]) => {
        setUnassignedCandidates(unassignedData)
        setAssignedCandidates(assignedData)
      }).catch(err => console.error('Background refresh failed:', err))
      
      toast({
        title: "Success",
        description: "Candidate status updated successfully",
      })
    } catch (error) {
      // Rollback optimistic update on failure
      setUnassignedCandidates(previousUnassigned)
      setAssignedCandidates(previousAssigned)
      setCandidates(previousCandidates)
      
      console.error('Failed to update candidate status:', error)
      toast({
        title: "Error",
        description: "Failed to update candidate status. Changes reverted.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout requiredRole="hr">
      <div className="flex-col h-full pt-1">
        {/* Fixed header section */}
        <div className="flex-shrink-0 space-y-4 pb-2 border-b bg-background z-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-0 pb-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            </div>          
            {selectedCandidates.length > 0 && (
              <BulkActionsToolbar
                selectedCount={selectedCandidates.length}
                onBulkAction={handleBulkAction}
              />
            )}
            <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="cursor-pointer bg-transparent"
              onClick={handleViewInterviews}
            >
              <List className="h-4 w-4 mr-2" />
              View List of Interviews
            </Button>
            <Button 
              variant="outline" 
              className="cursor-pointer bg-transparent"
              onClick={() => setIsBulkUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button 
              variant="outline" 
              className="cursor-pointer bg-transparent"
              onClick={handleExportCandidates}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <Button 
                className="bg-blue-600 text-white hover:scale-105 smooth-transition shadow-elegant hover:shadow-glow cursor-pointer" 
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-0 gap-0 animate-scale-in">
                <div className="gradient-card border-0 rounded-lg overflow-hidden">
                  <DialogHeader className="px-6 py-4 bg-gradient-primary text-white">
                    <DialogTitle className="text-xl font-bold flex items-center">
                      Add New Candidate
                    </DialogTitle>
                  </DialogHeader>
                  <div className="px-6 pb-6">
                    <CandidateForm
                      onSubmit={handleCreateCandidate}
                      onCancel={handleCancelForm}
                      onFormChange={setFormHasChanges}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm pr-8"
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions?.[activeTab]?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roundFilter} onValueChange={setRoundFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rounds</SelectItem>
                  {activeTab !== "unassigned" && (
                    <>
                      {roundOptions?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {vacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.position_title}>
                    {vacancy.position_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="naukri">Naukri</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="unassigned" onValueChange={(val) => setActiveTab(val)} className="flex-1 flex flex-col overflow-hidden">
          <div>
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="unassigned">
              Unassigned ({loadingUnassigned ? "..." : filteredUnassignedCandidates.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({loadingAssigned ? "..." : filteredAssignedCandidates.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({loadingAssigned ? "..." : filteredCompletedCandidates.length})
            </TabsTrigger>
          </TabsList>
          </div>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="unassigned" className="mt-0 h-full overflow-auto">
            {loadingUnassigned ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading unassigned candidates...</span>
                </CardContent>
              </Card>
            ) : unassignedCandidates.length > 0 ? (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredUnassignedCandidates.length > 0 &&
                              filteredUnassignedCandidates.every((c) => selectedCandidates.includes(c._id))
                            }
                            onCheckedChange={(checked) => {
                              const candidateIds = filteredUnassignedCandidates.map((c) => c._id)
                              if (checked) {
                                setSelectedCandidates([...new Set([...selectedCandidates, ...candidateIds])])
                              } else {
                                setSelectedCandidates(selectedCandidates.filter((id) => !candidateIds.includes(id)))
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUnassignedCandidates.map((candidate) => (
                        <TableRow key={candidate._id}>
                          <TableCell> 
                            <Checkbox 
                              checked={selectedCandidates.includes(candidate._id)}
                              onCheckedChange={(checked) => { if (checked) { setSelectedCandidates([...selectedCandidates, candidate._id]) } else { setSelectedCandidates(selectedCandidates.filter((id) => id !== candidate._id)) } }} 
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                              <div className="text-sm text-gray-500">{candidate.phone_number || "No phone_number"}</div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.applied_position}</TableCell>
                          <TableCell>{candidate.total_experience || "N/A"}</TableCell>
                          <TableCell>
                            <SkillsDisplay skills={candidate.skill_set || []} />
                          </TableCell>
                          <TableCell>{candidate.source || "Not specified"}</TableCell>
                          <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={candidate.checked_in ? "font-medium text-orange-600" : "text-gray-500"}>
                              {formatBackendWaitTime(candidate.wait_duration_minutes)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-800">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {candidate.status || "Unassigned"}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={candidate.checked_in || false}
                              disabled={checkingInCandidate === candidate._id}
                              onCheckedChange={(checked) => handleBackendCheckIn(candidate, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUnassignedCandidate(candidate)
                                  setIsUnassignedDetailsOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedCandidate(candidate as any)
                                  setIsEditOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteCandidate(candidate as any)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                              {candidate.checked_in && (
                                <Button
                                  size="sm"
                                  className="
                                    bg-blue-600
                                    hover:bg-blue-600
                                    active:bg-blue-600
                                    focus:bg-blue-600
                                    focus:ring-0
                                    disabled:bg-blue-600
                                    disabled:opacity-100
                                    text-white"
                                  onClick={() => handleAssignPanel(candidate)}
                                  disabled={loadingPanels}
                                >
                                Assign Panel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No unassigned candidates</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    There are currently no unassigned candidates from the backend.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="mt-0 h-full overflow-auto">
            {loadingAssigned ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading assigned candidates...</span>
                </CardContent>
              </Card>
            ) : assignedCandidates.length > 0 ? (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredAssignedCandidates.length > 0 &&
                              filteredAssignedCandidates.every((c) => selectedCandidates.includes(c._id))
                            }
                            onCheckedChange={(checked) => {
                              const candidateIds = filteredAssignedCandidates.map((c) => c._id)
                              if (checked) {
                                setSelectedCandidates([...new Set([...selectedCandidates, ...candidateIds])])
                              } else {
                                setSelectedCandidates(selectedCandidates.filter((id) => !candidateIds.includes(id)))
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Skillset</TableHead>
                        <TableHead>Total Experience</TableHead>
                        <TableHead>Interview Round</TableHead>
                        <TableHead>Panelist</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAssignedCandidates.map((candidate) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "selected":
                              return "bg-green-100 text-green-800"
                            case "rejected":
                              return "bg-red-100 text-red-800"
                            case "offerReleased":
                              return "bg-blue-100 text-blue-800"
                            case "candidateDeclined":
                              return "bg-orange-100 text-orange-800"
                            case "on-hold":
                              return "bg-yellow-100 text-yellow-800"
                            case "hired":
                              return "bg-purple-100 text-purple-800"
                            case "joined":
                              return "bg-teal-100 text-teal-800"
                            default:
                              return "bg-gray-100 text-gray-800"
                          }
                        }

                        const formatStatusLabel = (status: string) => {
                          switch (status) {
                            case "offerReleased":
                              return "Offer Released"
                            case "candidateDeclined":
                              return "Candidate Declined"
                            case "on-hold":
                              return "On Hold"
                            case "hired":
                              return "Hired"
                            case "joined":
                              return "Joined"
                            case "selected":
                              return "Selected"
                            case "rejected":
                              return "Rejected"
                            default:
                              return status.charAt(0).toUpperCase() + status.slice(1)
                          }
                        }

                        const formatPhoneNumber = (phone_number: any) => {
                          if (!phone_number) return "No phone_number"
                          return String(phone_number).replace(/\+/g, "")
                        }

                        return (
                          <TableRow key={candidate._id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCandidates.includes(candidate._id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCandidates([...selectedCandidates, candidate._id])
                                  } else {
                                    setSelectedCandidates(selectedCandidates.filter((id) => id !== candidate._id))
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-gray-500">{candidate.email}</div>
                                <div className="text-sm text-gray-500">{formatPhoneNumber(candidate.phone_number)}</div>
                              </div>
                            </TableCell>
                            <TableCell>{(candidate as any).applied_position || candidate.applied_position || "N/A"}</TableCell>
                            <TableCell>
                              <SkillsDisplay skills={candidate.skill_set || []} />
                            </TableCell>
                            <TableCell>{candidate.total_experience || "N/A"}</TableCell>
                            <TableCell>{candidate.last_interview_round}</TableCell>
                            <TableCell>{candidate.panel_name}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(candidate.final_status || "assigned")}>
                                <div className="flex items-center gap-1">
                                  {formatStatusLabel(candidate.final_status || "assigned")}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAssignedCandidate(candidate)
                                    setIsAssignedDetailsOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedCandidate(candidate as any)
                                    setIsEditOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteCandidate(candidate as any)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                                {["selected", "on-hold"].includes(candidate.final_status) && (candidate.last_interview_round === "r1" || candidate.last_interview_round === "r2") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                    onClick={() => handleMapAssign(candidate)}
                                  >
                                    Map Assign
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                     </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <UserCheck className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned candidates</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    No candidates are currently assigned from the backend.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0 h-full overflow-auto">
            {loadingAssigned ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading completed candidates...</span>
                </CardContent>
              </Card>
            ) : filteredCompletedCandidates.length > 0 ? (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredCompletedCandidates.length > 0 &&
                              filteredCompletedCandidates.every((c) => selectedCandidates.includes(c._id))
                            }
                            onCheckedChange={(checked) => {
                              const candidateIds = filteredCompletedCandidates.map((c) => c._id)
                              if (checked) {
                                setSelectedCandidates([...new Set([...selectedCandidates, ...candidateIds])])
                              } else {
                                setSelectedCandidates(selectedCandidates.filter((id) => !candidateIds.includes(id)))
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Skillset</TableHead>
                        <TableHead>Total Experience</TableHead>
                        <TableHead>Interview Round</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCompletedCandidates.map((candidate) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "selected":
                              return "bg-green-100 text-green-800"
                            case "rejected":
                              return "bg-red-100 text-red-800"
                            case "offerReleased":
                              return "bg-blue-100 text-blue-800"
                            case "candidateDeclined":
                              return "bg-orange-100 text-orange-800"
                            case "on-hold":
                              return "bg-yellow-100 text-yellow-800"
                            case "hired":
                              return "bg-purple-100 text-purple-800"
                            case "joined":
                              return "bg-teal-100 text-teal-800"
                            default:
                              return "bg-gray-100 text-gray-800"
                          }
                        }

                        const formatPhoneNumber = (phone_number: any) => {
                          if (!phone_number) return "No phone number"
                          return String(phone_number).replace(/\+/g, "")
                        }

                        const formatStatusLabel = (status: string) => {
                          switch (status) {
                            case "offerReleased":
                              return "Offer Released"
                            case "candidateDeclined":
                              return "Candidate Declined"
                            case "on-hold":
                              return "On Hold"
                            case "hired":
                              return "Hired"
                            case "joined":
                              return "Joined"
                            case "selected":
                              return "Selected"
                            case "rejected":
                              return "Rejected"
                            default:
                              return status.charAt(0).toUpperCase() + status.slice(1)
                          }
                        }

                        return (
                          <TableRow key={candidate._id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCandidates.includes(candidate._id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCandidates([...selectedCandidates, candidate._id])
                                  } else {
                                    setSelectedCandidates(selectedCandidates.filter((id) => id !== candidate._id))
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-gray-500">{candidate.email}</div>
                                <div className="text-sm text-gray-500">{formatPhoneNumber(candidate.phone_number)}</div>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.applied_position || "N/A"}</TableCell>
                            <TableCell>
                              <SkillsDisplay skills={candidate.skill_set || []} />
                            </TableCell>
                            <TableCell>{candidate.total_experience || "N/A"}</TableCell>
                            <TableCell>{candidate.last_interview_round}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="p-0 h-auto">
                                    <Badge className={getStatusColor(candidate.final_status || "selected")}>
                                      <div className="flex items-center gap-1">
                                        {formatStatusLabel(candidate.final_status || "selected")}
                                        {candidate.final_status !== "rejected" && <ChevronDown className="h-3 w-3" />}
                                      </div>
                                    </Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                {candidate.final_status !== "rejected" &&
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "selected")}>Selected</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "hired")}>Hired</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "offerReleased")}>Offer Released</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "joined")}>Joined</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "on-hold")}>On Hold</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "candidateDeclined")}>Candidate Declined</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate._id, "rejected")}>Rejected</DropdownMenuItem>
                                </DropdownMenuContent>
                                }
                              </DropdownMenu>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAssignedCandidate(candidate)
                                    setIsAssignedDetailsOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedCandidate(candidate as any)
                                    setIsEditOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteCandidate(candidate as any)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed candidates</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    No candidates have completed all interview rounds yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="p-2 pb-0 border-t flex-shrink-0">
        <Pagination
          currentPage={activeTab === "unassigned" ? unassignedCurrentPage : activeTab === "completed" ? completedCurrentPage : assignedCurrentPage}
          totalPages={activeTab === "unassigned" ? unassignedTotalPages : activeTab === "completed" ? completedTotalPages : assignedTotalPages}
          onPageChange={activeTab === "unassigned" ? setUnassignedCurrentPage : activeTab === "completed" ? setCompletedCurrentPage : setAssignedCurrentPage}
        />
      </div>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Panel</DialogTitle>
              <DialogDescription>
                Select a panelist for {candidateToSchedule?.name}'s interview
                {candidateToSchedule && (
                  <span className="block mt-1 font-medium text-blue-600">
                    Position:{" "}
                    {vacancies.find((v) => v.id === candidateToSchedule.jobId)?.position_title ||
                      candidateToSchedule.position ||
                      "Not specified"}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {candidateToSchedule &&
                (() => {
                  const allPanelists = getAllUsers().filter((user) => user.role === "panelist")
                  const jobPanelists = allPanelists

                  const filteredPanelists = jobPanelists.filter(
                    (panelist) =>
                      (panelist.name || "").toLowerCase().includes(panelistSearch.toLowerCase()) ||
                      panelist.skill_set?.some((skill) => (skill || "").toLowerCase().includes(panelistSearch.toLowerCase())),
                  )

                  const availablePanelists = filteredPanelists.filter((p) => p.current_status === "free")
                  const interviewingPanelists = filteredPanelists.filter((p) => p.current_status === "in_interview")
                  const breakPanelists = filteredPanelists.filter((p) => p.current_status === "break")
                  const unavailablePanelists = filteredPanelists.filter((p) => p.current_status === "unavailable" || !p.current_status)

                  return (
                    <>
                      <div className="mb-4 relative">
                        <Input
                          placeholder="Search panelists by name or skills..."
                          value={panelistSearch}
                          onChange={(e) => setPanelistSearch(e.target.value)}
                          className="w-full pr-8"
                        />
                        {panelistSearch && (
                          <button
                            onClick={() => setPanelistSearch("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Available Panelists */}
                      {availablePanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Available Panelists ({availablePanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {availablePanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50"
                              >
                                <div>
                                  <p className="font-medium">{panelist.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-green-600 font-medium">Ready to interview</p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                                  onClick={() => handleScheduleConfirm(panelist.id, panelist.name)}
                                >
                                  Map
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Panelists in Interview */}
                      {interviewingPanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-orange-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                            In Interview ({interviewingPanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {interviewingPanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50"
                              >
                                <div>
                                  <p className="font-medium">{panelist.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-orange-600 font-medium">Currently interviewing</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed bg-transparent"
                                >
                                  Busy
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Panelists on Break */}
                      {breakPanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            On Break ({breakPanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {breakPanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50"
                              >
                                <div>
                                  <p className="font-medium">{panelist.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-blue-600 font-medium">On break</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed bg-transparent"
                                >
                                  On Break
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unavailable Panelists */}
                      {unavailablePanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                            Unavailable ({unavailablePanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {unavailablePanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                              >
                                <div>
                                  <p className="font-medium text-gray-700">{panelist.name}</p>
                                  <p className="text-sm text-gray-500">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium">Not available</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed bg-transparent"
                                >
                                  Unavailable
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredPanelists.length === 0 && panelistSearch && (
                        <p className="text-center text-gray-500 py-8">No panelists found matching "{panelistSearch}"</p>
                      )}
                      {jobPanelists.length === 0 && !panelistSearch && (
                        <p className="text-center text-gray-500 py-8">No panelists found for this position</p>
                      )}
                    </>
                  )
                })()}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Re-Assign Panel</DialogTitle>
              <DialogDescription>
                Reschedule {candidateToReschedule?.name}'s interview
                {candidateToReschedule && (
                  <span className="block mt-1 font-medium text-blue-600">
                    Position: {candidateToReschedule?.applied_position}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader> 
            <div className="space-y-6">
              {/* Current Panelist Section */}
              {candidateToReschedule && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Currently Scheduled With</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">
                        {candidateToReschedule.assignedPanelist || "Unknown Panelist"}
                      </p>
                      <p className="text-sm text-blue-700">Current assignment</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      Current
                    </Badge>
                  </div>
                </div>
              )}

              {/* Available Panelists Section */}
              {candidateToReschedule &&
                (() => {
                  const allPanelists = getAllUsers().filter((user) => user.role === "panelist")
                  const jobPanelists = allPanelists

                  const currentPanelistId = candidateToReschedule.assignedPanelistId
                  console.log("[v0] Current panelist ID:", currentPanelistId)
                  console.log("[v0] Candidate to reschedule:", candidateToReschedule)
                  console.log(
                    "[v0] All panelists:",
                    jobPanelists.map((p) => ({ id: p.id, name: p.name })),
                  )

                  const availablePanelistsExcludingCurrent = jobPanelists.filter(
                    (panelist) => panelist.id !== currentPanelistId,
                  )

                  console.log(
                    "[v0] Available panelists excluding current:",
                    availablePanelistsExcludingCurrent.map((p) => ({ id: p.id, name: p.name })),
                  )

                  const filteredPanelists = availablePanelistsExcludingCurrent.filter(
                    (panelist) =>
                      (panelist.name || "").toLowerCase().includes(panelistSearch.toLowerCase()) ||
                      panelist.skill_set?.some((skill) => (skill || "").toLowerCase().includes(panelistSearch.toLowerCase())),
                  )

                  const availablePanelists = filteredPanelists.filter((p) => p.current_status === "free")
                  const interviewingPanelists = filteredPanelists.filter((p) => p.current_status === "in_interview")
                  const breakPanelists = filteredPanelists.filter((p) => p.current_status === "break")
                  const unavailablePanelists = filteredPanelists.filter((p) => p.current_status === "unavailable" || !p.current_status)

                  return (
                    <>
                      <div className="mb-4 relative">
                        <Input
                          placeholder="Search panelists by name or skills..."
                          value={panelistSearch}
                          onChange={(e) => setPanelistSearch(e.target.value)}
                          className="w-full pr-8"
                        />
                        {panelistSearch && (
                          <button
                            onClick={() => setPanelistSearch("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Available Panelists */}
                      {availablePanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Available Panelists ({availablePanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {availablePanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50"
                              >
                                <div>
                                  <p className="font-medium">{panelist.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-green-600 font-medium">Ready to interview</p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                                  onClick={() => handleRescheduleConfirm(panelist.id, panelist.name)}
                                >
                                  Re-Assign Panel
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Panelists in Interview */}
                      {interviewingPanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-orange-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                            In Interview ({interviewingPanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {interviewingPanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50"
                              >
                                <div>
                                  <p className="font-medium">{panelist.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-orange-600 font-medium">Currently interviewing</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed bg-transparent"
                                >
                                  Busy
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Panelists on Break */}
                      {breakPanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            On Break ({breakPanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {breakPanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50"
                              >
                                <div>
                                  <p className="font-medium">{panelist.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-blue-600 font-medium">On break</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed bg-transparent"
                                >
                                  On Break
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unavailable Panelists */}
                      {unavailablePanelists.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                            Unavailable ({unavailablePanelists.length})
                          </h3>
                          <div className="space-y-3">
                            {unavailablePanelists.map((panelist) => (
                              <div
                                key={panelist.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                              >
                                <div>
                                  <p className="font-medium text-gray-700">{panelist.name}</p>
                                  <p className="text-sm text-gray-500">
                                    Skills: {panelist.skill_set?.join(", ") || "Not specified"}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium">Not available</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="cursor-not-allowed bg-transparent"
                                >
                                  Unavailable
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredPanelists.length === 0 && panelistSearch && (
                        <p className="text-center text-gray-500 py-8">No panelists found matching "{panelistSearch}"</p>
                      )}
                      {jobPanelists.length === 0 && !panelistSearch && (
                        <p className="text-center text-gray-500 py-8">No panelists available</p>
                      )}
                    </>
                  )
                })()}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedCandidate && (
              <CandidateDetails
                candidate={selectedCandidate}
                onClose={() => setIsDetailsOpen(false)}
                onScheduleInterview={
                  selectedCandidate.status === "unassigned"
                    ? () => {
                        setIsDetailsOpen(false)
                        handleScheduleInterview(selectedCandidate)
                      }
                    : undefined
                }
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
              <DialogDescription>Update candidate information and save changes.</DialogDescription>
            </DialogHeader>
            {selectedCandidate && (
              <CandidateForm
                candidate={selectedCandidate}
                onSubmit={handleEditCandidate}
                onCancel={handleEditCancelForm}
                onFormChange={setEditFormHasChanges}
                submitButtonText="Update Changes"
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancelForm}>Discard Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showEditCancelConfirm} onOpenChange={setShowEditCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction onClick={confirmEditCancelForm}>Discard Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
          <DialogContent className="max-w-4xl w-full mx-auto gradient-subtle border border-border/50 shadow-elegant animate-scale-in">
            <DialogHeader className="border-b border-border/10 pb-4">
              <DialogTitle className="text-xl font-semibold gradient-text">Upload Candidates</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Upload multiple candidates from CSV or Excel files
              </DialogDescription>
            </DialogHeader>
            <div>
              <BulkUploadDialog onSubmit={handleBulkUpload} onCancel={() => setIsBulkUploadOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>


        <DeleteConfirmDialog
          open={!!deleteCandidate}
          onOpenChange={() => setDeleteCandidate(null)}
          onConfirm={handleDeleteCandidate}
          title="Delete Candidate"
          description={`Are you sure you want to delete ${deleteCandidate?.name}? This action cannot be undone.`}
        />
        {/* Assigned Candidate Details Modal */}
        <AssignedCandidateDetails
          candidate={selectedAssignedCandidate}
          isOpen={isAssignedDetailsOpen}
          onClose={() => {
            setIsAssignedDetailsOpen(false)
            setSelectedAssignedCandidate(null)
          }}
        />
        
        {/* Panel Assignment Dialog */}
        <Dialog open={isPanelDialogOpen} onOpenChange={(open) => {
          setIsPanelDialogOpen(open)
          if (open) {
            setPanelSearchTerm("")
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {assignmentRound ? `Assign Panel for ${assignmentRound.toUpperCase()} - ${selectedCandidateForPanel?.name}` : `Assign Panel - ${selectedCandidateForPanel?.name}`}
              </DialogTitle>
              <DialogDescription>
                Select an available panel to assign this candidate for interview.
                {assignmentRound && (
                  <span className="block mt-1 font-medium text-blue-600">
                    Next Round: {assignmentRound.toUpperCase()}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            {loadingPanels ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading available panels...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search panel members by name or email..."
                    value={panelSearchTerm}
                    onChange={(e) => setPanelSearchTerm(e.target.value)}
                    className="pl-9 pr-8"
                  />
                  {panelSearchTerm && (
                    <button
                      onClick={() => setPanelSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {availablePanels
                  .filter((panel) => {
                    const searchLower = panelSearchTerm.toLowerCase()
                    return (
                      panelSearchTerm === "" ||
                      (panel.name && panel.name.toLowerCase().includes(searchLower)) ||
                      (panel.email && panel.email.toLowerCase().includes(searchLower))
                    )
                  })
                  .length > 0 ? (
                  availablePanels
                    .filter((panel) => {
                      const searchLower = panelSearchTerm.toLowerCase()
                      return (
                        panelSearchTerm === "" ||
                        (panel.name && panel.name.toLowerCase().includes(searchLower)) ||
                        (panel.email && panel.email.toLowerCase().includes(searchLower))
                      )
                    })
                    .map((panel) => (
                    <Card key={panel.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Panel Details</h3>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{panel.name || 'N/A'}</span> - {panel.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {panel.assigned_candidate ? (
                            <div className="space-y-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Assigned
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUndoAssignment(panel.assigned_candidate.candidate_id, panel.id)}
                                disabled={assigningCandidate === panel.assigned_candidate.candidate_id}
                              >
                                {assigningCandidate === panel.assigned_candidate.candidate_id ? "Processing..." : "Undo Assignment"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handlePanelAssignmentUpdated(panel.id || panel._id)}
                              disabled={assigningCandidate === selectedCandidateForPanel?._id}
                            >
                              {assigningCandidate === selectedCandidateForPanel?._id ? "Assigning..." : "Map Candidate"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {panelSearchTerm ? "No panels match your search criteria." : "No available panels found."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Unassigned Candidate Details Modal */}
        <Dialog open={isUnassignedDetailsOpen} onOpenChange={setIsUnassignedDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
            </DialogHeader>
            {selectedUnassignedCandidate && (
              <UnassignedCandidateDetails 
                candidate={selectedUnassignedCandidate}
                onClose={() => {
                  setIsUnassignedDetailsOpen(false)
                  setSelectedUnassignedCandidate(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Ongoing Interviews Dialog */}
        <Dialog open={isInterviewsDialogOpen} onOpenChange={(open) => {
          setIsInterviewsDialogOpen(open)
          if (open) {
            setInterviewSearchTerm("")
          }
        }}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Ongoing Interviews</DialogTitle>
              <DialogDescription>
                View and manage all ongoing interviews
              </DialogDescription>
            </DialogHeader>
            
            {loadingInterviews ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading interviews...</span>
              </div>
            ) : ongoingInterviews.length > 0 ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by candidate or panel member name..."
                    value={interviewSearchTerm}
                    onChange={(e) => setInterviewSearchTerm(e.target.value)}
                    className="pl-9 pr-8"
                  />
                  {interviewSearchTerm && (
                    <button
                      onClick={() => setInterviewSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate Name</TableHead>
                        <TableHead>Panel Member Name</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ongoingInterviews
                        .filter((interview) => {
                          const searchLower = interviewSearchTerm.toLowerCase()
                          return (
                            interviewSearchTerm === "" ||
                            (interview.candidate_name && interview.candidate_name.toLowerCase().includes(searchLower)) ||
                            (interview.panel_name && interview.panel_name.toLowerCase().includes(searchLower))
                          )
                        })
                        .map((interview) => (
                      <TableRow key={`${interview.candidate_id}-${interview.panel_id}`}>
                        <TableCell className="font-medium">
                          {interview.candidate_name}
                        </TableCell>
                        <TableCell>{interview.panel_name}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignInterview(interview.candidate_id, interview.panel_id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Unassign
                          </Button>
                        </TableCell>
                      </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                {ongoingInterviews.filter((interview) => {
                  const searchLower = interviewSearchTerm.toLowerCase()
                  return (
                    interviewSearchTerm === "" ||
                    (interview.candidate_name && interview.candidate_name.toLowerCase().includes(searchLower)) ||
                    (interview.panel_name && interview.panel_name.toLowerCase().includes(searchLower))
                  )
                }).length === 0 && interviewSearchTerm && (
                  <div className="text-center py-8 text-gray-500">
                    No interviews match your search criteria.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No ongoing interviews found
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
