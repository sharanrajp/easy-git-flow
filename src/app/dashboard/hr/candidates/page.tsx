// @ts-nocheck

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogDescription } from "@/components/ui/dialog"
import { AssignedCandidateDetails } from "@/components/candidates/assigned-candidate-details"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { getMockCandidates, getMockVacancies, type Candidate } from "@/lib/mock-data"
import { CandidateForm } from "@/components/candidates/candidate-form"
import { CandidateDetails } from "@/components/candidates/candidate-details"
import { BulkActionsToolbar } from "@/components/candidates/bulk-actions-toolbar"
import { BulkUploadDialog } from "@/components/candidates/bulk-upload-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllUsers } from "@/lib/auth"
import { saveInterviewSession, type InterviewSession } from "@/lib/interview-data"
import { getInterviewSessions } from "@/lib/interview-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchUnassignedCandidates, fetchAssignedCandidates, addCandidate, type BackendCandidate } from "@/lib/candidates-api"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function CandidatesPage() {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("candidates")
      return stored ? JSON.parse(stored) : getMockCandidates()
    }
    return getMockCandidates()
  })
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [recruiterFilter, setRecruiterFilter] = useState("all")
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

  // No stored user available since we removed localStorage
  const currentUser = null
  const vacancies = getMockVacancies()

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

  // Load unassigned candidates when tab becomes free
  useEffect(() => {
    const loadUnassignedCandidates = async () => {
      if (activeTab !== "unassigned") return
      
      setLoadingUnassigned(true)
      try {
        const data = await fetchUnassignedCandidates()
        setUnassignedCandidates(data)
      } catch (error) {
        console.error('Failed to load unassigned candidates:', error)
        setUnassignedCandidates([])
      } finally {
        setLoadingUnassigned(false)
      }
    }

    loadUnassignedCandidates()
  }, [activeTab])

  // Load assigned candidates when tab becomes free
  useEffect(() => {
    const loadAssignedCandidates = async () => {
      if (activeTab !== "assigned") return
      
      setLoadingAssigned(true)
      try {
        const data = await fetchAssignedCandidates()
        setAssignedCandidates(data)
      } catch (error) {
        console.error('Failed to load assigned candidates:', error)
        setAssignedCandidates([])
      } finally {
        setLoadingAssigned(false)
      }
    }

    loadAssignedCandidates()
  }, [activeTab])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("candidates", JSON.stringify(candidates))
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("candidateUpdated"))
    }
  }, [candidates])

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.applied_position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesJob = jobFilter === "all" || candidate.applied_position.toLowerCase().includes(jobFilter.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesExperience = experienceFilter === "all" || candidate.total_experience.includes(experienceFilter)
    const matchesRecruiter =
      recruiterFilter === "all" || candidate.source.toLowerCase().includes(recruiterFilter.toLowerCase())
    const matchesInterviewType = interviewTypeFilter === "all" || candidate.interviewType === interviewTypeFilter

    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const appliedDate = new Date(candidate.appliedDate)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (dateFilter) {
        case "today":
          return daysDiff === 0
        case "week":
          return daysDiff <= 7
        case "month":
          return daysDiff <= 30
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
      matchesInterviewType &&
      matchesDate
    )
  })

  const statusOptions: Record<string, { value: string; label: string }[]> = {
  unassigned: [],
  assigned: [
    { value: "r1-scheduled", label: "R1 Scheduled" },
    { value: "r1-in-progress", label: "R1 In Progress" },
    { value: "r2-scheduled", label: "Schedule R2" },
    { value: "r2-in-progress", label: "R2 In Progress" },
    { value: "r3-scheduled", label: "Schedule R3" },
    { value: "r3-in-progress", label: "R3 In Progress" },
  ],
  completed: [
    { value: "selected", label: "Selected" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
    { value: "offerReleased", label: "Offer Released" },
    { value: "candidateDeclined", label: "Candidate Declined" },
    { value: "onHold", label: "On Hold" },
    { value: "joined", label: "Joined" },
    { value: "completed", label: "Completed" }
  ],
}

  const localUnassignedCandidates = filteredCandidates.filter((c) => c.status === "unassigned")
  const localAssignedCandidates = filteredCandidates.filter(
    (c) =>
      c.status === "assigned" ||
      c.status === "r1-scheduled" ||
      c.status === "r1-in-progress" ||
      c.status === "r2-scheduled" ||
      c.status === "r2-in-progress" ||
      c.status === "r3-scheduled" ||
      c.status === "r3-in-progress",
  )
  const completedCandidates = filteredCandidates.filter(
    (c) => c.status === "completed" || c.status === "hired" || c.status === "rejected" || c.status === "selected" || c.status === "offerReleased" || c.status === "candidateDeclined" || c.status === "joined" || c.status === "onHold" ,
  )

  const handleCreateCandidate = async (candidateData: Partial<Candidate>) => {
    try {
      // Prepare data for backend API
      const backendCandidateData = {
        name: candidateData.name,
        email: candidateData.email,
        phone_number: candidateData.phone_number,
        applied_position: candidateData.applied_position,
        total_experience: candidateData.total_experience,
        skill_set: candidateData.skill_set,
        source: candidateData.source,
        appliedDate: new Date().toISOString().split("T")[0],
        status: "unassigned",
        recruiter: currentUser?.name || "Unknown",
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
        appliedDate: newBackendCandidate.appliedDate,
        recruiter: newBackendCandidate.recruiter || "",
        assignedPanelist: newBackendCandidate.assignedPanelist,
        currentRound: newBackendCandidate.currentRound,
        interviewDateTime: newBackendCandidate.interviewDateTime,
        waitTime: newBackendCandidate.waitTime,
        waitTimeStarted: newBackendCandidate.waitTimeStarted,
        isCheckedIn: newBackendCandidate.isCheckedIn || false,
      };

      // Update local state with new candidate
      setCandidates([newCandidate, ...candidates]);
      setIsCreateOpen(false);
      setFormHasChanges(false);
      
      // Show success message
      toast({
        title: "Candidate added successfully",
        description: `${newCandidate.name} has been added to the candidates list.`,
      });

    } catch (error) {
      console.error("Error creating candidate:", error);
      toast({
        variant: "destructive",
        title: "Error adding candidate",
        description: "Failed to add the candidate. Please try again.",
      });
    }
  }

  const handleEditCandidate = (candidateData: Partial<Candidate>) => {
    if (!selectedCandidate) return

    const updatedCandidates = candidates.map((c) => (c.id === selectedCandidate.id ? { ...c, ...candidateData } : c))
    setCandidates(updatedCandidates)
    setIsEditOpen(false)
    setSelectedCandidate(null)
    setEditFormHasChanges(false)
  }

  const handleDeleteCandidate = () => {
    if (!deleteCandidate) return

    setCandidates(candidates.filter((c) => c.id !== deleteCandidate.id))
    setDeleteCandidate(null)
  }

  const handleBulkUpload = (uploadedCandidates: Partial<Candidate>[]) => {
    const newCandidates = uploadedCandidates.map((candidateData, index) => ({
      id: (Date.now() + index).toString(),
      ...candidateData,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "unassigned" as const,
      waitTime: null,
      waitTimeStarted: null,
      isCheckedIn: false,
    })) as Candidate[]

    setCandidates([...newCandidates, ...candidates])
    setIsBulkUploadOpen(false)
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
      round: candidateToSchedule.currentRound || "R1",
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
            currentRound: "R1" as const,
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
        return "R1 Scheduled"
      case "r1-in-progress":
        return "R1 In Progress"
      case "r2-scheduled":
        return "Schedule R2"
      case "r2-in-progress":
        return "R2 In Progress"
      case "r3-scheduled":
        return "Schedule R3"
      case "r3-in-progress":
        return "R3 In Progress"
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

  const handleSelectAll = (candidateList: Candidate[], checked: boolean) => {
    if (checked) {
      const newSelected = candidateList.map((c) => c.id)
      setSelectedCandidates([...new Set([...selectedCandidates, ...newSelected])])
    } else {
      const candidateIds = candidateList.map((c) => c.id)
      setSelectedCandidates(selectedCandidates.filter((id) => !candidateIds.includes(id)))
    }
  }

  const handleBulkAction = (action: string, data?: any) => {
    const selectedCandidateObjects = candidates.filter((c) => selectedCandidates.includes(c.id))

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
        setCandidates(candidates.filter((c) => !selectedCandidates.includes(c.id)))
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
    return candidates.filter((c) => selectedCandidates.includes(c.id))
  }

  const handleChangeStatus = (candidateId: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, status: newStatus } : c
    ))
  }

  return (
    <DashboardLayout requiredRole="hr">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600">Manage and track candidate applications</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="cursor-pointer bg-transparent"
              onClick={() => setIsBulkUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <Button 
                className="gradient-primary text-white hover:scale-105 smooth-transition shadow-elegant hover:shadow-glow cursor-pointer" 
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
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions[activeTab].map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCandidates.length > 0 && (
                <div className="ml-auto">
                  <BulkActionsToolbar
                    selectedCandidates={getSelectedCandidateObjects()}
                    onClearSelection={clearSelection}
                    onBulkAction={handleBulkAction}
                  />
                </div>
              )}
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
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="product">Product Manager</SelectItem>
                <SelectItem value="designer">UX Designer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="1">1-2 years</SelectItem>
                <SelectItem value="3">3-5 years</SelectItem>
                <SelectItem value="6">6+ years</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="unassigned" onValueChange={(val) => setActiveTab(val)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unassigned">
              Unassigned ({loadingUnassigned ? "..." : unassignedCandidates.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({loadingAssigned ? "..." : assignedCandidates.length})
            </TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCandidates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unassigned">
            {loadingUnassigned ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading unassigned candidates...</span>
                </CardContent>
              </Card>
            ) : unassignedCandidates.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Unassigned Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              unassignedCandidates.length > 0 &&
                              unassignedCandidates.every((c) => selectedCandidates.includes(c._id))
                            }
                            onCheckedChange={(checked) => {
                              const candidateIds = unassignedCandidates.map((c) => c._id)
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedCandidates.map((candidate) => (
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
                              <div className="text-sm text-gray-500">{candidate.phone_number || "No phone_number"}</div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.applied_position}</TableCell>
                          <TableCell>{candidate.total_experience || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(candidate.skill_set) && candidate.skill_set.length > 0 ? (
                                candidate.skill_set.slice(0, 2).map((skill: string, skillIndex: number) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs">No skill</Badge>
                              )}
                              {candidate.skill_set && candidate.skill_set.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidate.skill_set.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{candidate.source || "Not specified"}</TableCell>
                          <TableCell>{new Date(candidate.appliedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-800">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {candidate.status || "Unassigned"}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                onClick={() => {
                                  // Convert backend candidate to frontend format for assignment
                                  const frontendCandidate = {
                                    id: candidate._id,
                                    name: candidate.name,
                                    email: candidate.email,
                                    phone_number: candidate.phone_number,
                                    applied_position: candidate.applied_position,
                                    status: candidate.status,
                                    total_experience: candidate.total_experience,
                                    skill_set: candidate.skill_set,
                                    source: candidate.source,
                                    appliedDate: candidate.appliedDate,
                                    recruiter: candidate.recruiter
                                  }
                                  handleScheduleInterview(frontendCandidate)
                                }}
                              >
                                Assign Panel
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => {
                                  // Convert to frontend format for details view
                                  const frontendCandidate = {
                                    id: candidate._id,
                                    name: candidate.name,
                                    email: candidate.email,
                                    phone_number: candidate.phone_number,
                                    applied_position: candidate.applied_position,
                                    status: candidate.status,
                                    total_experience: candidate.total_experience,
                                    skill_set: candidate.skill_set,
                                    source: candidate.source,
                                    appliedDate: candidate.appliedDate,
                                    recruiter: candidate.recruiter
                                  }
                                  setSelectedCandidate(frontendCandidate)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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

          <TabsContent value="assigned">
            {loadingAssigned ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading assigned candidates...</span>
                </CardContent>
              </Card>
            ) : assignedCandidates.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              assignedCandidates.length > 0 &&
                              assignedCandidates.every((c) => selectedCandidates.includes(c._id))
                            }
                            onCheckedChange={(checked) => {
                              const candidateIds = assignedCandidates.map((c) => c._id)
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
                        <TableHead>Current Round</TableHead>
                        <TableHead>Panelist</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedCandidates.map((candidate) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "selected":
                              return "bg-green-100 text-green-800"
                            case "rejected":
                              return "bg-red-100 text-red-800"
                            case "on-hold":
                              return "bg-yellow-100 text-yellow-800"
                            case "assigned":
                              return "bg-gray-100 text-gray-800"
                            default:
                              return "bg-gray-100 text-gray-800"
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
                            <TableCell>{candidate.last_interview_round || "N/A"}</TableCell>
                            <TableCell>{candidate.panel_name || "Not assigned"}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(candidate.final_status || "assigned")}>
                                {candidate.final_status || "assigned"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedAssignedCandidate(candidate)
                                    setIsAssignedDetailsOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
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

          <TabsContent value="completed">
            {completedCandidates.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              completedCandidates.length > 0 &&
                              completedCandidates.every((c) => selectedCandidates.includes(c.id))
                            }
                            onCheckedChange={(checked) => handleSelectAll(completedCandidates, checked as boolean)}
                          />
                        </TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Final Status</TableHead>
                        <TableHead>Total Wait Time</TableHead>
                        <TableHead>Last Interview</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCandidates.includes(candidate.id)}
                              onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                              <div className="text-sm text-gray-500">{candidate.phone_number}</div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.applied_position}</TableCell>
                          <TableCell>
                            {candidate.status !== "completed" ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="p-0 h-auto">
                                    <Badge className={getStatusColor(candidate.status)}>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(candidate.status)}
                                        {formatStatus(candidate.status)}
                                        <ChevronDown className="h-3 w-3" />
                                      </div>
                                    </Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "selected")}>Selected</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "rejected")}>Rejected</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "hired")}>Hired</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "completed")}>Completed</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "offerReleased")}>Offer Released</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "candidateDeclined")}>Candidate Declined</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "onHold")}>On Hold</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeStatus(candidate.id, "joined")}>Joined</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Badge className={getStatusColor(candidate.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(candidate.status)}
                                  {formatStatus(candidate.status)}
                                </div>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.totalWaitTime ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Timer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{candidate.totalWaitTime}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(candidate.appliedDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedCandidate(candidate)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedCandidate(candidate)
                                  setIsEditOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => setDeleteCandidate(candidate)}
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
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed candidates</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    {searchTerm ||
                    jobFilter !== "all" ||
                    statusFilter !== "all" ||
                    experienceFilter !== "all" ||
                    recruiterFilter !== "all" ||
                    interviewTypeFilter !== "all" ||
                    dateFilter !== "all"
                      ? "No completed candidates match your current filters. Try adjusting your search criteria."
                      : "No candidates have completed the interview process yet. Completed candidates (selected or rejected) will appear here."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
                      panelist.name.toLowerCase().includes(panelistSearch.toLowerCase()) ||
                      panelist.skill_set?.some((skill) => skill.toLowerCase().includes(panelistSearch.toLowerCase())),
                  )

                  const availablePanelists = filteredPanelists.filter((p) => p.current_status === "free")
                  const interviewingPanelists = filteredPanelists.filter((p) => p.current_status === "in_interview")
                  const breakPanelists = filteredPanelists.filter((p) => p.current_status === "break")
                  const unavailablePanelists = filteredPanelists.filter((p) => p.current_status === "unavailable" || !p.current_status)

                  return (
                    <>
                      <div className="mb-4">
                        <Input
                          placeholder="Search panelists by name or skills..."
                          value={panelistSearch}
                          onChange={(e) => setPanelistSearch(e.target.value)}
                          className="w-full"
                        />
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
                      panelist.name.toLowerCase().includes(panelistSearch.toLowerCase()) ||
                      panelist.skill_set?.some((skill) => skill.toLowerCase().includes(panelistSearch.toLowerCase())),
                  )

                  const availablePanelists = filteredPanelists.filter((p) => p.current_status === "free")
                  const interviewingPanelists = filteredPanelists.filter((p) => p.current_status === "in_interview")
                  const breakPanelists = filteredPanelists.filter((p) => p.current_status === "break")
                  const unavailablePanelists = filteredPanelists.filter((p) => p.current_status === "unavailable" || !p.current_status)

                  return (
                    <>
                      <div className="mb-4">
                        <Input
                          placeholder="Search panelists by name or skills..."
                          value={panelistSearch}
                          onChange={(e) => setPanelistSearch(e.target.value)}
                          className="w-full"
                        />
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

        <AlertDialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteCandidate?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCandidate} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Assigned Candidate Details Modal */}
        <AssignedCandidateDetails
          candidate={selectedAssignedCandidate}
          isOpen={isAssignedDetailsOpen}
          onClose={() => {
            setIsAssignedDetailsOpen(false)
            setSelectedAssignedCandidate(null)
          }}
        />
      </div>
    </DashboardLayout>
  )
}
