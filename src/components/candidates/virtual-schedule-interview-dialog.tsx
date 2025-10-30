import { useState, useEffect, useRef } from "react"
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
  const hasUserChangedSelectionRef = useRef(false)
  const hasAutoSelectedRef = useRef(false)
  const hasFetchedPanelistsRef = useRef(false)
  const [panelistsLoaded, setPanelistsLoaded] = useState(false)

  useEffect(() => {
    const fetchPanelists = async () => {
      // Prevent repeated API calls - only fetch once per dialog session
      if (hasFetchedPanelistsRef.current) {
        console.log("Skipping fetch - already fetched for this session")
        return
      }
      
      if (!candidate?._id) {
        console.log("No candidate ID available")
        setPanelists([])
        return
      }

      // Determine next round - use same logic as Walk-in schedule form
      let nextRound = "r1"
      if (candidate.status === "r1-completed") {
        nextRound = "r2"
      } else if (candidate.status === "r2-completed") {
        nextRound = "r3"
      }
      
      console.log("Virtual Schedule - Candidate:", candidate.name, "Status:", candidate.status, "Next Round:", nextRound)

      if (!candidate?.vacancyId) {
        console.log("No vacancyId - fetching all available panelists")
        // If no vacancyId, fetch all panelists using the generic API
        try {
          setLoading(true)
          hasFetchedPanelistsRef.current = true
          const allUsers = await getAllUsers()
          
          // For R3, only show tpm_tem role; for R1 and R2, show panel_member role
          // Filter by current_status "free" to match Walk-in behavior
          const panelMembers = allUsers.filter((user: any) => {
            if (nextRound === "r3") {
              return user.role === 'tpm_tem' && user.current_status === 'free'
            }
            return user.role === 'panel_member' && user.current_status === 'free'
          })
          
          console.log("No vacancyId path - Next round:", nextRound, "Fetched panel members:", panelMembers)
          setPanelists(panelMembers)
          setPanelistsLoaded(true)
        } catch (error) {
          console.error("Failed to fetch panelists:", error)
          setPanelists([])
          hasFetchedPanelistsRef.current = false
        } finally {
          setLoading(false)
        }
        return
      }
      
      // Mark that we're fetching to prevent duplicate calls
      hasFetchedPanelistsRef.current = true
      
      try {
        setLoading(true)
        let fetchedPanelists = await fetchPanelistsForCandidate(candidate._id, candidate.vacancyId)
        console.log("Raw API response from fetchPanelistsForCandidate:", fetchedPanelists)
        console.log("Next round:", nextRound)
        
        // For R3, the backend already returns the correct tpm_tem users
        // The API returns: [{ id, name, email }] - no role or status fields
        // So for R3, we just use the response directly
        if (nextRound === "r3") {
          console.log("R3 detected - using API response directly (backend already filtered for tpm_tem)")
          // Just ensure the data structure is normalized
          fetchedPanelists = fetchedPanelists.map((p: any) => ({
            ...p,
            _id: p.id || p._id, // Normalize id field
          }))
        } else {
          // For R1 and R2, filter for panel_member role with status "free"
          // Check if the API response has role/status fields
          const hasRoleFields = fetchedPanelists.length > 0 && 
            (fetchedPanelists[0].hasOwnProperty('role') || fetchedPanelists[0].hasOwnProperty('current_status'))
          
          if (hasRoleFields) {
            console.log("Filtering for R1/R2 panel_member users from API response")
            fetchedPanelists = fetchedPanelists.filter((p: any) => {
              const role = p.role || p.role_name || p.user_role
              const status = p.current_status || p.status
              console.log("Checking panelist:", p.name, "role:", role, "status:", status)
              return role === 'panel_member' && status === 'free'
            })
          } else {
            // API doesn't return role fields, just use the response as-is
            console.log("R1/R2: API response has no role fields, using response as-is")
          }
        }
        
        console.log("Vacancy path - Next round:", nextRound, "Final panel members:", fetchedPanelists)
        
        // If this is a reschedule, ensure the currently assigned panelist is in the list
        if (isReschedule && candidate.panel_name) {
          const hasCurrentPanelist = fetchedPanelists.some((p: any) => 
            p.name === candidate.panel_name || 
            p.email === (candidate as any).panel_email
          )
          
          if (!hasCurrentPanelist && candidate.panel_name) {
            // Add the current panelist to the list
            const currentPanelist = {
              _id: (candidate as any).panel_id || candidate.panel_name,
              name: candidate.panel_name,
              email: (candidate as any).panel_email || '',
              role: nextRound === "r3" ? 'tpm_tem' : 'panel_member',
              skill_set: []
            }
            console.log("Adding current panelist to list:", currentPanelist)
            setPanelists([currentPanelist, ...fetchedPanelists])
          } else {
            setPanelists(fetchedPanelists || [])
          }
        } else {
          setPanelists(fetchedPanelists || [])
        }
        
        // Mark that panelists have been loaded successfully
        setPanelistsLoaded(true)
        console.log("Panelists loaded successfully")
      } catch (error) {
        console.error("Failed to fetch panelists:", error)
        setPanelists([])
        hasFetchedPanelistsRef.current = false // Reset on error to allow retry
      } finally {
        setLoading(false)
      }
    }
    
    if (open && candidate) {
      fetchPanelists()
    }
  }, [open])

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
      // Reset all flags when dialog opens
      if (!hasUserChangedSelectionRef.current) {
        hasAutoSelectedRef.current = false
      }
      hasFetchedPanelistsRef.current = false // Allow fetching for new dialog session
      setPanelistsLoaded(false) // Reset loaded state
      console.log("Dialog opened - reset all fetch/selection flags")
    }
  }, [open])

  // Update selected panel members when panelists are loaded and we have existing schedule
  useEffect(() => {
    // Only run when panelists have been loaded successfully
    if (!panelistsLoaded || panelists.length === 0) {
      console.log("Skipping auto-selection - panelists not loaded or empty")
      return
    }
    
    // Only auto-select if user hasn't manually changed the selection AND we haven't auto-selected yet
    if (hasUserChangedSelectionRef.current || hasAutoSelectedRef.current) {
      console.log("Skipping auto-selection - user changed:", hasUserChangedSelectionRef.current, "already auto-selected:", hasAutoSelectedRef.current)
      return
    }
    
    if (isReschedule && candidate && panelists.length > 0) {
      console.log("Attempting to match existing panelist")
      console.log("Candidate panel_name:", candidate.panel_name)
      console.log("Loaded panelists:", panelists)
      
      // Find matching panelist by name or email
      const matchingPanelist = panelists.find((p: any) => 
        p.name === candidate.panel_name || 
        p.email === (candidate as any).panel_email
      )
      
      if (matchingPanelist) {
        const panelistId = matchingPanelist._id || matchingPanelist.name
        console.log("Found matching panelist, setting ID:", panelistId)
        setSelectedPanelMembers([panelistId])
        hasAutoSelectedRef.current = true // Mark that we've done the initial auto-selection
      }
    } else if (existingSchedule?.panelMembers && panelists.length > 0 && !isReschedule) {
      const existingPanelNames = existingSchedule.panelMembers
      console.log("Matching existing panel names:", existingPanelNames)
      console.log("Against loaded panelists:", panelists)
      
      // Find matching panelist by name or ID
      const matchingPanelists = panelists.filter((p: any) => 
        existingPanelNames.includes(p.name) || 
        existingPanelNames.includes(p._id) ||
        existingPanelNames.includes(p.email)
      )
      
      if (matchingPanelists.length > 0) {
        const matchingIds = matchingPanelists.map((p: any) => p._id)
        console.log("Found matching panelists, setting IDs:", matchingIds)
        setSelectedPanelMembers(matchingIds)
        hasAutoSelectedRef.current = true // Mark that we've done the initial auto-selection
      }
    }
  }, [panelistsLoaded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with panel members:", selectedPanelMembers)
    if (selectedDate && selectedTime && meetingLink && selectedPanelMembers.length > 0) {
      if (isReschedule && !rescheduleReason) {
        return
      }
      console.log("Submitting schedule data:", {
        date: selectedDate,
        time: selectedTime,
        meetingLink,
        panelMembers: selectedPanelMembers,
      })
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
    console.log("User manually selecting panelist:", panelistId)
    hasUserChangedSelectionRef.current = true // Mark that user has manually changed selection
    setSelectedPanelMembers((prev) => {
      // If clicking the same panelist, unselect it
      if (prev.includes(panelistId)) {
        console.log("Unselecting panelist:", panelistId)
        return []
      }
      // Otherwise, select only this panelist (single selection)
      console.log("Selecting panelist:", panelistId)
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
            <Label>Select Panel Member (select one) *</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-3 bg-background">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading panelists...</p>
              ) : panelists.length === 0 ? (
                <p className="text-sm text-muted-foreground">No panelists available</p>
              ) : (
                panelists.map((panelist: any) => {
                  // Handle different possible ID fields
                  const panelistId = panelist._id || panelist.id || panelist.panel_id || panelist.username || panelist.email
                  // Check if selected by ID only (ensures only one radio button is selected)
                  const isSelected = selectedPanelMembers.includes(panelistId)
                  return (
                    <div 
                      key={panelistId} 
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "border-border hover:bg-muted/50 hover:border-muted-foreground/30"
                      )}
                      onClick={() => handlePanelistSelection(panelistId)}
                    >
                      <input
                        type="checkbox"
                        id={panelistId}
                        checked={isSelected}
                        onChange={() => handlePanelistSelection(panelistId)}
                        className="w-4 h-4 text-primary accent-primary cursor-pointer"
                      />
                      <label
                        htmlFor={panelistId}
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
