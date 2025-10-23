import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResumeDialogProps {
  isOpen: boolean
  onClose: () => void
  resumeUrl: string | null
  candidateName?: string
}

export function ResumeDialog({ isOpen, onClose, resumeUrl, candidateName }: ResumeDialogProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (!resumeUrl) return null

  const handleOpenInNewTab = () => {
    window.open(resumeUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Resume {candidateName && `- ${candidateName}`}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-hidden">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading resume...</p>
              </div>
            </div>
          )}
          
          {hasError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Unable to display resume in browser</p>
                <Button onClick={handleOpenInNewTab} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Resume in New Tab
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full w-full">
              <iframe
                src={resumeUrl}
                className="w-full h-full border-0"
                style={{ minHeight: '75vh' }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
                title={`Resume for ${candidateName || 'candidate'}`}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                allow="fullscreen"
              />
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
