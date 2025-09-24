 

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
        candidate.interviewType = "walk-in"
        candidate.skills = candidate.skills || []
        candidate.source = candidate.source || "Bulk Upload"
        candidate.job_type = candidate.job_type || "full-time"
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
    <div className="space-y-6">
      {/* Template Download */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Need a template?</p>
            <p className="text-sm text-blue-700">Download our sample CSV template to get started</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="csvFile">Upload Candidates</Label>
        <Input
          id="csvFile"
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileSelect}
          className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {file && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{file.name}</span>
            <span className="text-xs text-green-600">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Processing file...</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {results.success > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Successfully processed {results.success} candidates</AlertDescription>
            </Alert>
          )}

          {results.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{results.errors.length} errors found:</p>
                  <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                    {results.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {results.errors.length > 5 && <li>• ... and {results.errors.length - 5} more errors</li>}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="flex justify-end gap-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={processFile} disabled={!file || isProcessing} className="bg-blue-600 hover:bg-blue-700">
          {isProcessing ? "Processing..." : "Upload"}
        </Button>
      </div>
    </div>
  )
}
