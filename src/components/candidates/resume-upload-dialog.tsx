import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "@/lib/api-config"
import { getToken } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface ResumeUploadDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface UploadStatus {
  fileName: string
  status: 'uploading' | 'parsing' | 'updating' | 'success' | 'failed'
  error?: string
}

export function ResumeUploadDialog({ open, onClose, onSuccess }: ResumeUploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop()
      return extension === 'pdf' || extension === 'docx'
    })

    if (validFiles.length !== files.length) {
      alert('Only PDF and DOCX files are supported. Some files were filtered out.')
    }

    setSelectedFiles(validFiles)
    setUploadStatuses(validFiles.map(file => ({
      fileName: file.name,
      status: 'uploading'
    })))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      console.error('No files selected')
      return
    }

    console.log('Starting upload with files:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))

    setIsProcessing(true)
    setOverallProgress(0)

    const formData = new FormData()
    selectedFiles.forEach((file, index) => {
      console.log(`Appending file ${index + 1}:`, file.name, file.type, file.size)
      formData.append('files', file, file.name)
    })

    // Log FormData contents
    console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
      key,
      fileName: value instanceof File ? value.name : 'not a file',
      size: value instanceof File ? value.size : 0
    })))

    try {
      const token = getToken()
      console.log('Making request to:', `${API_BASE_URL}/resumes/upload-resumes`)
      
      const response = await fetch(`${API_BASE_URL}/resumes/upload-resumes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set Content-Type - let browser set it with boundary
        },
        body: formData
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Update statuses based on response
      const newStatuses: UploadStatus[] = selectedFiles.map((file, index) => {
        const fileResult = result.results?.find((r: any) => 
          r.filename === file.name || r.fileName === file.name
        )

        if (fileResult) {
          return {
            fileName: file.name,
            status: fileResult.success ? 'success' : 'failed',
            error: fileResult.error || fileResult.message
          }
        }

        // Fallback if result structure is different
        return {
          fileName: file.name,
          status: 'success'
        }
      })

      setUploadStatuses(newStatuses)
      setOverallProgress(100)

      // If all successful, trigger success callback
      const allSuccess = newStatuses.every(s => s.status === 'success')
      if (allSuccess) {
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1500)
      }

    } catch (error) {
      console.error('Resume upload error:', error)
      setUploadStatuses(prevStatuses =>
        prevStatuses.map(status => ({
          ...status,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Upload failed'
        }))
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setSelectedFiles([])
    setUploadStatuses([])
    setOverallProgress(0)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'parsing':
        return <FileText className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'updating':
        return <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusLabel = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading to S3...'
      case 'parsing':
        return 'Parsing resume...'
      case 'updating':
        return 'Updating database...'
      case 'success':
        return 'Complete'
      case 'failed':
        return 'Failed'
    }
  }

  const successCount = uploadStatuses.filter(s => s.status === 'success').length
  const failedCount = uploadStatuses.filter(s => s.status === 'failed').length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Resumes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select one or more resume files (PDF, DOCX). Only existing candidates will be updated.
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} file(s) selected` 
                  : 'Select Resume Files'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {selectedFiles.length > 0 && !isProcessing && (
              <Alert>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {selectedFiles.length} file(s) ready to upload
                    </span>
                    <Button
                      size="sm"
                      onClick={handleUpload}
                      disabled={isProcessing}
                    >
                      Upload All
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}

          {/* Summary Stats */}
          {uploadStatuses.length > 0 && (
            <div className="flex gap-4 justify-center">
              {successCount > 0 && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {successCount} Success
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  {failedCount} Failed
                </Badge>
              )}
            </div>
          )}

          {/* File Status List */}
          {uploadStatuses.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium mb-3">Upload Status</h4>
                  {uploadStatuses.map((status, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div className="mt-0.5">
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {status.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getStatusLabel(status.status)}
                        </p>
                        {status.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {status.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {/* <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm space-y-1">
                <p className="font-medium">Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You can select multiple resumes at once (bulk upload)</li>
                  <li>Large batches are handled asynchronously</li>
                  <li>Only existing candidates in the system will be updated</li>
                  <li>Check the "Failed" list to retry any resumes if needed</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert> */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
