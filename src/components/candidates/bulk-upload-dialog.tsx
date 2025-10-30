import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, CheckCircle, AlertCircle, FileSearch, Eye, ChevronLeft, MessageSquare } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { makeAuthenticatedRequest } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { fetchVacancies } from "../../lib/vacancy-api"
import type { Position } from "../../lib/schema-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchBulkUploadLogs, fetchBulkUploadLogDetails, fetchCandidateDetails, type BulkUploadLog, type BulkUploadLogDetails, type BackendCandidate } from "@/lib/candidates-api"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { AssignedCandidateDetails } from "./assigned-candidate-details"

interface BulkUploadDialogProps {
  onSubmit: (candidates: any[]) => void
  onCancel: () => void
}

interface SkippedCandidate {
  name: string
  email?: string
  reason: string
  row_number?: number
  candidate_id?: string
}

interface ExistingCandidate {
  name: string
  email?: string
  applied_position: string
  interview_status: string
  last_interview_round: string
  last_interview_date?: string
  phone_number?: string
}

interface UploadResponse {
  message: string
  candidates_count: number
  applied_position: string
  source: string
  recruiter_name: string
  upload_id?: string
  skipped?: SkippedCandidate[]
  existing_candidates?: ExistingCandidate[]
}

interface UploadError {
  error: string
  details?: string[]
}

export function BulkUploadDialog({ onSubmit, onCancel }: BulkUploadDialogProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const [appliedPosition, setAppliedPosition] = useState("")
  const [source, setSource] = useState("")
  const [otherSource, setOtherSource] = useState("")
  const [vacancies, setVacancies] = useState<Position[]>([])
  const [selectedRecruiter, setSelectedRecruiter] = useState("")
  const [loadingVacancies, setLoadingVacancies] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [interviewType, setInterviewType] = useState("walk-in")
  const [skippedCandidates, setSkippedCandidates] = useState<SkippedCandidate[]>([])
  const [existingCandidates, setExistingCandidates] = useState<ExistingCandidate[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // New states for comprehensive logs
  const [uploadLogs, setUploadLogs] = useState<BulkUploadLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [selectedUploadDetails, setSelectedUploadDetails] = useState<BulkUploadLogDetails | null>(null)
  const [loadingUploadDetails, setLoadingUploadDetails] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<BackendCandidate | null>(null)
  const [showCandidateDialog, setShowCandidateDialog] = useState(false)
  const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false)
  const [uploadedByFilter, setUploadedByFilter] = useState<string>("all")
  const [availableRecruiters, setAvailableRecruiters] = useState<string[]>([])
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [showAllLogs, setShowAllLogs] = useState(false)
  const [skippedCandidatesPage, setSkippedCandidatesPage] = useState(1)
  const itemsPerPage = 15

  // Load active vacancies on component mount
  useEffect(() => {
    const loadVacancies = async () => {
      try {
        setLoadingVacancies(true)
        const allVacancies = await fetchVacancies()
        const activeVacancies = allVacancies.filter((v: Position) => v.status === "active")
        setVacancies(activeVacancies)
      } catch (error) {
        console.error('Failed to load vacancies:', error)
        toast({
          variant: "destructive",
          title: "Error loading vacancies",
          description: "Failed to load active positions. Please refresh and try again.",
        })
      } finally {
        setLoadingVacancies(false)
      }
    }

    loadVacancies()
  }, [])

  // Load upload logs when switching to logs tab or filter changes
  useEffect(() => {
    if (showLogs && showAllLogs) {
      loadUploadLogs()
    }
  }, [showLogs, showAllLogs, uploadedByFilter])

  // When manually switching to Logs tab, show all logs if no current upload
  useEffect(() => {
    if (showLogs && !currentUploadId && !showAllLogs) {
      setShowAllLogs(true)
    }
  }, [showLogs])

  // Reset skipped candidates pagination when viewing new upload details
  useEffect(() => {
    setSkippedCandidatesPage(1)
  }, [selectedUploadDetails])

  const loadUploadLogs = async () => {
    setLoadingLogs(true)
    try {
      const logs = await fetchBulkUploadLogs(uploadedByFilter !== "all" ? uploadedByFilter : undefined)
      
      // Ensure logs is an array before setting state
      if (Array.isArray(logs)) {
        setUploadLogs(logs)
        
        // Extract unique recruiters for filter
        const recruiters = Array.from(new Set(logs.map(log => log.uploaded_by))).filter(Boolean)
        setAvailableRecruiters(recruiters)
      } else {
        console.error('API returned non-array response:', logs)
        setUploadLogs([])
        toast({
          variant: "destructive",
          title: "Invalid response",
          description: "The server returned an invalid response format.",
        })
      }
    } catch (error) {
      console.error('Failed to load upload logs:', error)
      setUploadLogs([]) // Ensure uploadLogs is always an array
      toast({
        variant: "destructive",
        title: "Error loading logs",
        description: "Failed to load upload logs. Please try again.",
      })
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleViewUploadDetails = async (uploadId: string) => {
    setLoadingUploadDetails(true)
    try {
      const details = await fetchBulkUploadLogDetails(uploadId)
      setSelectedUploadDetails(details)
    } catch (error) {
      console.error('Failed to load upload details:', error)
      toast({
        variant: "destructive",
        title: "Error loading details",
        description: "Failed to load upload details. Please try again.",
      })
    } finally {
      setLoadingUploadDetails(false)
    }
  }

  const handleViewCandidateDetails = async (candidateId: string) => {
    setLoadingCandidateDetails(true)
    try {
      const candidate = await fetchCandidateDetails(candidateId)
      setSelectedCandidate(candidate)
    } catch (error) {
      console.error('Failed to load candidate details:', error)
      toast({
        variant: "destructive",
        title: "Error loading candidate",
        description: "Failed to load candidate details. Please try again.",
      })
    } finally {
      setLoadingCandidateDetails(false)
    }
  }

  // Auto-select recruiter when applied position changes
  const handleAppliedPositionChange = (positionTitle: string) => {
    setAppliedPosition(positionTitle)
    
    // Find the selected vacancy and auto-fill recruiter
    const selectedVacancy = vacancies.find(v => v.position_title === positionTitle)
    if (selectedVacancy) {
      setSelectedRecruiter(selectedVacancy.recruiter_name)
    } else {
      setSelectedRecruiter("")
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Only allow CSV and XLSX files
      if (
        selectedFile.type === "text/csv" || 
        selectedFile.name.endsWith(".csv") ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.name.endsWith(".xlsx")
      ) {
        setFile(selectedFile)
        setResults(null)
        setValidationErrors([])
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a CSV or XLSX file only.",
        })
      }
    }
  }

  const validateForm = (): boolean => {
    const errors: string[] = []
    
    if (!file) {
      errors.push("Please select a CSV file")
    }
    
    if (!appliedPosition) {
      errors.push("Applied Position is required")
    }
    
    if (!source) {
      errors.push("Source is required")
    }
    
    if (source === "other" && !otherSource.trim()) {
      errors.push("Other Source is required when 'other' is selected")
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const downloadTemplate = () => {
    const csvContent = `name,email,phone_number,location,total_experience,skill_set,interview_type,notice_period,current_ctc,expected_ctc,negotiable,willing_to_relocate
John Doe,john.doe@email.com,+911234567890,Madurai,5,"React,JavaScript,TypeScript",Walk-In,2 weeks,9,10,Yes,No
Jane Smith,jane.smith@email.com,+911234567891,Chennai,2,"Node.js,Python,MongoDB",Walk-In,1 month,8,10,No,Yes`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "candidate_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const processFile = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    setProgress(0)
    setResults(null)

    try {
      // Prepare FormData for API call
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('applied_position', appliedPosition)
      formData.append('source', source === 'other' ? otherSource : source)
      formData.append('interview_type', interviewType)
      if (selectedRecruiter) {
        formData.append('recruiter_name', selectedRecruiter)
      }
      if (source === 'other') {
        formData.append('other_source', otherSource)
      }

      setProgress(50)

      // Call backend API
      const response = await makeAuthenticatedRequest('/candidates/upload-candidates-csv', {
        method: 'POST',
        body: formData,
      })

      setProgress(100)

      // Check if response is HTML instead of JSON (common error case)
      const contentType = response.headers.get('content-type')
      if (!response.ok) {
        if (contentType?.includes('text/html')) {
          throw new Error(`API endpoint not found. Server returned HTML instead of JSON. Status: ${response.status}`)
        }
        // Try to get error details from JSON response
        try {
          const errorData: UploadError = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      // Ensure we can parse JSON
      if (!contentType?.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 200)}`)
      }

      const successData: UploadResponse = await response.json()
      
      // Store skipped and existing candidates data
      if (successData.skipped && successData.skipped.length > 0) {
        setSkippedCandidates(successData.skipped)
      }
      if (successData.existing_candidates && successData.existing_candidates.length > 0) {
        setExistingCandidates(successData.existing_candidates)
      }
      
      // Show success message with logs info
      const logsInfo = successData.skipped?.length || successData.existing_candidates?.length 
        ? ` (${(successData.skipped?.length || 0) + (successData.existing_candidates?.length || 0)} entries in logs)`
        : ''
      
      toast({
        title: "Upload successful",
        description: `${successData.candidates_count} candidates uploaded successfully for ${successData.applied_position} via ${successData.source}. Recruiter: ${successData.recruiter_name}${logsInfo}`,
      })

      setResults({ 
        success: successData.candidates_count, 
        errors: [] 
      })

      // Call parent onSubmit to refresh data
      onSubmit([])

      // Switch to Logs tab and load current upload details
      if (successData.upload_id) {
        setCurrentUploadId(successData.upload_id)
        setShowAllLogs(false)
        setShowLogs(true)
        
        // Load details of the current upload
        handleViewUploadDetails(successData.upload_id)
      }

      // Reset form after a delay
      setTimeout(() => {
        setFile(null)
        setAppliedPosition("")
        setSource("")
        setOtherSource("")
        setSelectedRecruiter("")
        setInterviewType("walk-in")
        setResults(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)

    } catch (error: any) {
      console.error('Upload error:', error)
      
      let errorMessages: string[] = []
      
      try {
        // Try to parse error response if it's JSON
        if (error.message.includes('{')) {
          const errorData = JSON.parse(error.message)
          if (errorData.details && Array.isArray(errorData.details)) {
            errorMessages = errorData.details
          } else {
            errorMessages = [errorData.error || error.message]
          }
        } else {
          errorMessages = [error.message]
        }
      } catch {
        errorMessages = [error.message || 'Upload failed. Please try again.']
      }

      setResults({ success: 0, errors: errorMessages })
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessages[0],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
    <Tabs defaultValue="upload" value={showLogs ? "logs" : "upload"} onValueChange={(value) => {
      setShowLogs(value === "logs")
      // Reset current upload when switching back to upload tab
      if (value === "upload") {
        setCurrentUploadId(null)
        setShowAllLogs(false)
        setSelectedUploadDetails(null)
      }
    }} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="logs" className="relative">
          <FileSearch className="h-3.5 w-3.5 mr-1.5" />
          Logs
          {(skippedCandidates.length > 0 || existingCandidates.length > 0) && (
            <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">
              {skippedCandidates.length + existingCandidates.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-4 mt-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-md">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-xs font-medium text-primary">Need a template?</p>
              <p className="text-[10px] text-primary/70">Download our sample CSV template to get started</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="text-[10px] h-7 px-2">
            <Download className="h-2.5 w-2.5 mr-1" />
            Download Template
          </Button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
        {/* First row: Applied Position + Source */}
        <div className="flex space-x-3">
          {/* Applied Position */}
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="appliedPosition" className="text-xs font-medium">Applied Position *</Label>
            <Select value={appliedPosition} onValueChange={handleAppliedPositionChange} disabled={loadingVacancies}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={loadingVacancies ? "Loading positions..." : "Select applied position"} />
              </SelectTrigger>
              <SelectContent>
                {vacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.position_title}>
                    {vacancy.position_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="source" className="text-xs font-medium">Source *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="naukri">Naukri</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second row: Other Source (conditionally) */}
        {source === "other" && (
          <div className="space-y-1.5">
            <Label htmlFor="otherSource" className="text-xs font-medium">Other Source *</Label>
            <Input
              id="otherSource"
              value={otherSource}
              onChange={(e) => setOtherSource(e.target.value)}
              placeholder="Enter other source"
              className="text-sm"
            />
          </div>
        )}

        {/* Interview Type */}
        <div className="space-y-1.5">
          <Label htmlFor="interviewType" className="text-xs font-medium">Interview Type *</Label>
          <Select value={interviewType} onValueChange={setInterviewType}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select interview type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-In</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload CSV/XLSX */}
        <div className="space-y-1.5">
          <Label htmlFor="csvFile" className="text-xs font-medium">Upload CSV/XLSX File *</Label>
          <Input
            id="csvFile"
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
            className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 smooth-transition"
          />
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="text-xs font-medium">Please fix the following errors:</p>
                <div className="text-xs space-y-0.5">
                  {validationErrors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {file && (
          <div className="p-2.5 bg-success/10 border border-success/20 rounded-md animate-fade-in">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-success" />
              <span className="text-xs font-medium text-success">{file.name}</span>
              <span className="text-xs text-success/80">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Processing file...</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-1.5" />
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-2">
            {results.success > 0 && (
              <Alert className="py-2">
                <CheckCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">Successfully processed {results.success} candidates</AlertDescription>
              </Alert>
            )}

            {results.errors.length > 0 && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{results.errors.length} errors found:</p>
                    <div className="text-xs space-y-0.5 max-h-20 overflow-hidden">
                      {results.errors.slice(0, 3).map((error, index) => (
                        <p key={index}>• {error}</p>
                      ))}
                      {results.errors.length > 3 && <p>• ... and {results.errors.length - 3} more errors</p>}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} size="sm" className="text-xs">
            Cancel
          </Button>
          <Button 
            onClick={processFile} 
            disabled={!file || isProcessing || !appliedPosition || !source || (source === 'other' && !otherSource.trim())} 
            size="sm"
            className="gradient-primary text-white hover:scale-105 smooth-transition shadow-elegant hover:shadow-glow text-xs"
          >
            {isProcessing ? "Uploading..." : "Upload Candidates"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="logs" className="space-y-4 mt-4">
        {selectedUploadDetails ? (
          // Upload Details View
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {showAllLogs && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedUploadDetails(null)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <h3 className="text-sm font-semibold">
                {currentUploadId && !showAllLogs ? "Recent Upload Details" : "Upload Details"}
              </h3>
            </div>
            
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Uploaded By:</span>
                    <p className="font-medium">{selectedUploadDetails.uploaded_by}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Upload Type:</span>
                    <p className="font-medium">{selectedUploadDetails.upload_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied Position:</span>
                    <p className="font-medium">{selectedUploadDetails.applied_position}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Upload Date & Time:</span>
                    <p className="font-medium">{selectedUploadDetails.uploaded_date} {selectedUploadDetails.uploaded_time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Added Candidates */}
            {selectedUploadDetails.added_candidates?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold">Added Candidates ({selectedUploadDetails.added_candidates.length})</h3>
                </div>
                <div className="overflow-x-auto w-full">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[200px]">Email</TableHead>
                        <TableHead className="w-[150px]">Phone</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUploadDetails.added_candidates.map((candidate) => (
                        <TableRow key={candidate._id}>
                          <TableCell className="font-medium truncate">{candidate.name}</TableCell>
                          <TableCell className="truncate">{candidate.email}</TableCell>
                          <TableCell>{candidate.phone_number || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{candidate.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCandidateDetails(candidate._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Skipped Candidates */}
            {selectedUploadDetails.skipped_candidates?.length > 0 && (() => {
              const startIndex = (skippedCandidatesPage - 1) * itemsPerPage
              const endIndex = startIndex + itemsPerPage
              const paginatedSkipped = selectedUploadDetails.skipped_candidates.slice(startIndex, endIndex)
              const totalPages = Math.ceil(selectedUploadDetails.skipped_candidates.length / itemsPerPage)

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-semibold">Skipped Candidates ({selectedUploadDetails.skipped_candidates.length})</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Row</TableHead>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="w-[200px]">Email</TableHead>
                          <TableHead className="w-[300px]">Reason</TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSkipped.map((candidate, index) => (
                          <TableRow key={index}>
                            <TableCell>{candidate.row_number || startIndex + index + 1}</TableCell>
                            <TableCell className="font-medium truncate">{candidate.name}</TableCell>
                            <TableCell className="truncate">{candidate.email || '-'}</TableCell>
                            <TableCell className="text-destructive break-words">{candidate.reason}</TableCell>
                            <TableCell>
                              {candidate.candidate_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    setLoadingCandidateDetails(true)
                                    try {
                                      const details = await fetchCandidateDetails(candidate.candidate_id!)
                                      setSelectedCandidate(details)
                                      setShowCandidateDialog(true)
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to fetch candidate details",
                                        variant: "destructive",
                                      })
                                    } finally {
                                      setLoadingCandidateDetails(false)
                                    }
                                  }}
                                  disabled={loadingCandidateDetails}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="pt-2">
                      <Pagination
                        currentPage={skippedCandidatesPage}
                        totalPages={totalPages}
                        onPageChange={setSkippedCandidatesPage}
                      />
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="flex justify-end gap-2 pt-2">
              {currentUploadId && !showAllLogs ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAllLogs(true)
                      setSelectedUploadDetails(null)
                      loadUploadLogs()
                    }} 
                    size="sm"
                  >
                    View All Previous Logs
                  </Button>
                  <Button variant="outline" onClick={onCancel} size="sm">
                    Close
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setSelectedUploadDetails(null)} size="sm">
                  Back to Logs
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Upload Logs List View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {showAllLogs ? "All Upload History" : "Bulk Upload History"}
              </h3>
              <Select value={uploadedByFilter} onValueChange={setUploadedByFilter}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Filter by recruiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {availableRecruiters.map((recruiter) => (
                    <SelectItem key={recruiter} value={recruiter}>
                      {recruiter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingLogs ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading logs...</p>
              </div>
            ) : uploadLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileSearch className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No upload logs found</p>
                <p className="text-xs mt-1">Upload history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Upload ID</TableHead>
                      <TableHead className="w-[120px]">Uploaded By</TableHead>
                      <TableHead className="w-[100px]">Upload Type</TableHead>
                      <TableHead className="w-[150px]">Position</TableHead>
                      <TableHead className="w-[70px]">Total</TableHead>
                      <TableHead className="w-[80px]">Added</TableHead>
                      <TableHead className="w-[80px]">Skipped</TableHead>
                      <TableHead className="w-[150px]">Date & Time</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadLogs.map((log) => (
                      <TableRow key={log.upload_id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewUploadDetails(log.upload_id)}>
                        <TableCell className="font-mono text-xs truncate">{log.upload_id.substring(0, 8)}...</TableCell>
                        <TableCell className="truncate">{log.uploaded_by}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.upload_type}</Badge>
                        </TableCell>
                        <TableCell className="truncate">{log.applied_position}</TableCell>
                        <TableCell>{log.total_candidates}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-success text-[#40474C] text-sm font-medium px-2 py-1">{log.added_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{log.skipped_count}</Badge>
                        </TableCell>
                        <TableCell className="text-xs truncate">{log.uploaded_date} {log.uploaded_time}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUploadDetails(log.upload_id)}
                            disabled={loadingUploadDetails}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={onCancel} size="sm">
                Close
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>

    {/* Candidate Details Dialog */}
    <AssignedCandidateDetails
      candidate={selectedCandidate}
      isOpen={showCandidateDialog}
      onClose={() => {
        setShowCandidateDialog(false)
        setSelectedCandidate(null)
      }}
    />
    </>
  )
}
