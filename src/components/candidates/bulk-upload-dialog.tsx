import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { makeAuthenticatedRequest } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { fetchVacancies } from "../../lib/vacancy-api"
import type { Vacancy } from "../../lib/schema-data"

interface BulkUploadDialogProps {
  onSubmit: (candidates: any[]) => void
  onCancel: () => void
}

interface UploadResponse {
  message: string
  candidates_count: number
  applied_position: string
  source: string
  recruiter_name: string
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
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [selectedRecruiter, setSelectedRecruiter] = useState("")
  const [loadingVacancies, setLoadingVacancies] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load active vacancies on component mount
  useEffect(() => {
    const loadVacancies = async () => {
      try {
        setLoadingVacancies(true)
        const allVacancies = await fetchVacancies()
        const activeVacancies = allVacancies.filter((v: Vacancy) => v.status === "active")
        setVacancies(activeVacancies)
      } catch (error) {
        console.error('Failed to load vacancies:', error)
        toast({
          variant: "error",
          title: "Error loading vacancies",
          description: "Failed to load active positions. Please refresh and try again.",
        })
      } finally {
        setLoadingVacancies(false)
      }
    }

    loadVacancies()
  }, [])

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
      // Only allow CSV files
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
        setResults(null)
        setValidationErrors([])
      } else {
        toast({
          variant: "error",
          title: "Invalid file type",
          description: "Please select a CSV file only.",
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
    const csvContent = `Name,Email,Phone,Experience,Skills,Job Type,Location,Notice Period,Current CTC,Expected CTC,Negotiable,Relocation
John Doe,john.doe@email.com,+1234567890,3-5 years,"React,JavaScript,TypeScript",Full Time,San Francisco CA,2 weeks,$95000,$110000,Yes,No
Jane Smith,jane.smith@email.com,+1234567891,2-4 years,"Node.js,Python,MongoDB",Contract,New York NY,1 month,$85000,$100000,No,Yes`

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
      
      // Show success message
      toast({
        title: "Upload successful",
        description: `${successData.candidates_count} candidates uploaded successfully for ${successData.applied_position} via ${successData.source}. Recruiter: ${successData.recruiter_name}`,
      })

      setResults({ 
        success: successData.candidates_count, 
        errors: [] 
      })

      // Call parent onSubmit to refresh data
      onSubmit([])

      // Reset form after successful upload
      setTimeout(() => {
        setFile(null)
        setAppliedPosition("")
        setSource("")
        setOtherSource("")
        setSelectedRecruiter("")
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
        variant: "error",
        title: "Upload failed",
        description: errorMessages[0],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
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

        {/* Third row: Upload CSV */}
        <div className="space-y-1.5">
          <Label htmlFor="csvFile" className="text-xs font-medium">Upload CSV File *</Label>
          <Input
            id="csvFile"
            ref={fileInputRef}
            type="file"
            accept=".csv"
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
    </div>
  )
}
