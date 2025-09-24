import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface BulkUploadDialogProps {
  onSubmit: (candidates: any[]) => void
  onCancel: () => void
}

export function BulkUploadDialog({ onSubmit, onCancel }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]

      if (
        validTypes.includes(selectedFile.type) ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile)
        setResults(null)
      } else {
        alert("Please select a CSV or Excel file")
      }
    }
  }

  const downloadTemplate = () => {
    const csvContent = `Name,Email,Phone,Applied Position,Experience,Skills,Source,Job Type,Location,Notice Period,Current CTC,Expected CTC,Negotiable,Relocation
John Doe,john.doe@email.com,+1234567890,Senior Frontend Developer,3-5 years,"React,JavaScript,TypeScript",LinkedIn,Full Time,San Francisco CA,2 weeks,$95000,$110000,Yes,No
Jane Smith,jane.smith@email.com,+1234567891,Backend Developer,2-4 years,"Node.js,Python,MongoDB",Website,Contract,New York NY,1 month,$85000,$100000,No,Yes`

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
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const candidates = []
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        setProgress((i / (lines.length - 1)) * 100)

        const values: string[] = []
        let current = ""
        let inQuotes = false

        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            values.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        values.push(current.trim())

        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`)
          continue
        }

        const candidate: any = {}
        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, "") || ""

          switch (header.toLowerCase()) {
            case "name":
              candidate.name = value
              break
            case "email":
              candidate.email = value
              break
            case "phone":
              candidate.phone = value
              break
            case "applied position":
            case "position":
              candidate.appliedPosition = value
              break
            case "experience":
              candidate.experience = value
              break
            case "skills":
              candidate.skills = value
                .split(",")
                .map((s: string) => s.trim())
                .filter((s: string) => s)
              break
            case "source":
              candidate.source = value
              break
            case "job type":
            case "jobtype":
              candidate.job_type = value.toLowerCase().replace(" ", "-")
              break
            case "location":
              candidate.location = value
              break
            case "notice period":
              candidate.noticePeriod = value
              break
            case "current ctc":
              candidate.currentCTC = value
              break
            case "expected ctc":
              candidate.expectedCTC = value
              break
            case "negotiable":
              candidate.negotiable = value.toLowerCase() === "yes" || value.toLowerCase() === "true"
              break
            case "relocation":
              candidate.relocation = value.toLowerCase() === "yes" || value.toLowerCase() === "true"
              break
          }
        })

        // Validate required fields
        if (!candidate.name || !candidate.email) {
          errors.push(`Row ${i + 1}: Missing required fields (Name, Email)`)
          continue
        }

        // Set defaults
        candidate.id = `bulk_${Date.now()}_${i}`
        candidate.interviewType = "Walk-In"
        candidate.skills = candidate.skills || []
        candidate.source = candidate.source || "Bulk Upload"
        candidate.job_type = candidate.job_type || "full_time"
        candidate.location = candidate.location || "Not specified"
        candidate.noticePeriod = candidate.noticePeriod || "Not specified"
        candidate.currentCTC = candidate.currentCTC || "Not specified"
        candidate.expectedCTC = candidate.expectedCTC || "Not specified"
        candidate.negotiable = candidate.negotiable || false
        candidate.relocation = candidate.relocation || false
        candidate.appliedDate = new Date().toISOString().split("T")[0]
        candidate.status = "unassigned"

        candidates.push(candidate)
      }

      setResults({ success: candidates.length, errors })

      if (candidates.length > 0) {
        onSubmit(candidates)
      }
    } catch (error) {
      setResults({ success: 0, errors: ["Failed to process file. Please check the format."] })
    } finally {
      setIsProcessing(false)
      setProgress(100)
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
      <div className="space-y-1.5">
        <Label htmlFor="csvFile" className="text-xs font-medium">Upload Candidates</Label>
        <Input
          id="csvFile"
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileSelect}
          className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 smooth-transition"
        />
      </div>

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
          disabled={!file || isProcessing} 
          size="sm"
          className="gradient-primary text-white hover:scale-105 smooth-transition shadow-elegant hover:shadow-glow text-xs"
        >
          {isProcessing ? "Processing..." : "Upload"}
        </Button>
      </div>
    </div>
  )
}
