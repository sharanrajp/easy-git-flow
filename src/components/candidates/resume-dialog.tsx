import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface ResumeDialogProps {
  isOpen: boolean
  onClose: () => void
  resumeUrl: string | null
  candidateName?: string
}

export function ResumeDialog({ isOpen, onClose, resumeUrl, candidateName }: ResumeDialogProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!resumeUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Resume {candidateName && `- ${candidateName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading resume...</p>
              </div>
            </div>
          )}
          
          <ScrollArea className="h-full w-full">
            <iframe
              src={resumeUrl}
              className="w-full h-full border-0"
              style={{ minHeight: '75vh' }}
              onLoad={() => setIsLoading(false)}
              title={`Resume for ${candidateName || 'candidate'}`}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
              allow="fullscreen"
            />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
