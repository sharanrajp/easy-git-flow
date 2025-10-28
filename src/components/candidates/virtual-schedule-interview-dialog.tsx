import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getAllUsers, type User } from "@/lib/auth"
import { fetchPanelistsForCandidate, type BackendCandidate } from "@/lib/candidates-api"

interface VirtualScheduleInterviewDialogProps {
  open: boolean
  onClose: () => void
  candidate: BackendCandidate | null
  isReschedule?: boolean
  existingSchedule?: {
    date?: string
    time?: string
    meetingLink?: string
    panelMembers?: string[]
  }
  onSubmit: (data: {
    date: Date
    time: string
    meetingLink: string
    panelMembers: string[]
    rescheduleReason?: string
  }) => void
}

export function VirtualScheduleInterviewDialog({
  open,
  onClose,
  candidate,
  isReschedule = false,
  existingSchedule,
  onSubmit,
}: VirtualScheduleInterviewDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [selectedPanelMembers, setSelectedPanelMembers] = useState<string[]>([])
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [panelists, setPanelists] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPanelists = async () => {
      if (!candidate?._id || !candidate?.vacancyId) {
        setPanelists([])
        return
      }
      
      try {
        setLoading(true)
        const panelists = await fetchPanelistsForCandidate(candidate._id, candidate.vacancyId)
        setPanelists(panelists || [])
      } catch (error) {
        console.error("Failed to fetch panelists:", error)
        setPanelists([])
      } finally {
        setLoading(false)
      }
    }
    
    if (open && candidate) {
      fetchPanelists()
    }
  }, [open, candidate])

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      if (existingSchedule) {
        if (existingSchedule.date) {
          setSelectedDate(new Date(existingSchedule.date))
        }
        setSelectedTime(existingSchedule.time || "")
        setMeetingLink(existingSchedule.meetingLink || "")
        // Ensure panel members are properly set when rescheduling
        const panelMembers = existingSchedule.panelMembers || []
        setSelectedPanelMembers(panelMembers)
        console.log("Pre-selecting panel members for reschedule:", panelMembers)
      } else {
        setSelectedDate(undefined)
        setSelectedTime("")
        setMeetingLink("")
        setSelectedPanelMembers([])
      }
      setRescheduleReason("")
    }
  }, [open, existingSchedule])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDate && selectedTime && meetingLink && selectedPanelMembers.length > 0) {
      if (isReschedule && !rescheduleReason) {
        return
      }
      onSubmit({
        date: selectedDate,
        time: selectedTime,
        meetingLink,
        panelMembers: selectedPanelMembers,
        rescheduleReason: isReschedule ? rescheduleReason : undefined,
      })
      onClose()
    }
  }

  const handlePanelistSelection = (panelistId: string) => {
    setSelectedPanelMembers((prev) => {
      // If clicking the same panelist, deselect it
      if (prev.includes(panelistId)) {
        return []
      }
      // Otherwise, replace with the new selection
      return [panelistId]
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
          </DialogTitle>
          {candidate && (
            <div className="mt-2 space-y-1">
              <p className="font-medium text-foreground">
                {candidate.name} - {candidate.applied_position}
              </p>
              <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Interview Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Interview Time *</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="flex-1"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Teams / Meeting Link *</Label>
            <Input
              id="meetingLink"
              type="url"
              placeholder="https://teams.microsoft.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
            />
          </div>

          {/* Panel Members Selection */}
          <div className="space-y-2">
            <Label>Select Panel Member *</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-3 bg-background">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading panelists...</p>
              ) : panelists.length === 0 ? (
                <p className="text-sm text-muted-foreground">No panelists available</p>
              ) : (
                panelists.map((panelist) => {
                  const isSelected = selectedPanelMembers.includes(panelist._id)
                  return (
                    <div 
                      key={panelist._id} 
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "border-border hover:bg-muted/50 hover:border-muted-foreground/30"
                      )}
                      onClick={() => handlePanelistSelection(panelist._id)}
                    >
                      <input
                        type="radio"
                        id={panelist._id}
                        name="panelist"
                        checked={isSelected}
                        onChange={() => handlePanelistSelection(panelist._id)}
                        className="w-4 h-4 text-primary accent-primary cursor-pointer"
                      />
                      <label
                        htmlFor={panelist._id}
                        className="flex-1 text-sm font-medium cursor-pointer"
                      >
                        <div>
                          <p className={cn(isSelected && "text-primary font-semibold")}>{panelist.name}</p>
                          {panelist.skill_set && panelist.skill_set.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Skills: {Array.isArray(panelist.skill_set) ? panelist.skill_set.join(", ") : panelist.skill_set}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  )
                })
              )}
            </div>
            {selectedPanelMembers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedPanelMembers.length} panelist selected
              </p>
            )}
          </div>

          {/* Reschedule Reason (only shown when rescheduling) */}
          {isReschedule && (
            <div className="space-y-2">
              <Label htmlFor="rescheduleReason">Reschedule Reason *</Label>
              <Select value={rescheduleReason} onValueChange={setRescheduleReason} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate-not-available">Candidate not available</SelectItem>
                  <SelectItem value="panelist-not-available">Panelist not available</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !selectedDate ||
                !selectedTime ||
                !meetingLink ||
                selectedPanelMembers.length === 0 ||
                (isReschedule && !rescheduleReason)
              }
            >
              {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
