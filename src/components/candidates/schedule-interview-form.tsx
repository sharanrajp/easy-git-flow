import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Candidate } from "@/lib/schema-data"
import { getAllUsers } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

interface ScheduleInterviewFormProps {
  candidate: Candidate
  onSubmit: (data: { panelist: string; dateTime: string }) => void
  onCancel: () => void
}

export function ScheduleInterviewForm({ candidate, onSubmit, onCancel }: ScheduleInterviewFormProps) {
  const [selectedPanelist, setSelectedPanelist] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [panelists, setPanelists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getNextRound = () => {
    if (!candidate.currentRound) return "r1"

    switch (candidate.status) {
      case "r1-completed":
        return "r2"
      case "r2-completed":
        return "r3"
      default:
        return candidate.currentRound || "r1"
    }
  }

  const nextRound = getNextRound()

  useEffect(() => {
    const fetchPanelists = async () => {
      setIsLoading(true)
      try {
        const users = await getAllUsers()
        // For R3, only show tpm_tem role; for R1 and R2, show panel_member role
        const filteredUsers = users.filter((user) => {
          if (nextRound === "r3") {
            return user.role === "tpm_tem" && user.current_status === "free"
          }
          return user.role === "panel_member" && user.current_status === "free"
        })
        setPanelists(filteredUsers)
      } catch (error) {
        console.error("Failed to fetch panelists:", error)
        setPanelists([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPanelists()
  }, [nextRound])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPanelist && selectedDate && selectedTime) {
      // Combine date and time using local date components
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateTimeString = `${year}-${month}-${day}T${selectedTime}`;
      onSubmit({
        panelist: selectedPanelist,
        dateTime: dateTimeString,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Candidate Info */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Name:</span>
              <p className="font-medium">{candidate.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Position:</span>
              <p className="font-medium">{candidate.applied_position}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience:</span>
              <p className="font-medium">{candidate.total_experience}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Interview Round:</span>
              <Badge variant="outline" className="ml-2">
                {nextRound}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="panelist">Select Panelist *</Label>
          {isLoading ? (
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading panelists...</span>
            </div>
          ) : (
            <>
              <Select value={selectedPanelist} onValueChange={setSelectedPanelist}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a panelist" />
                </SelectTrigger>
                <SelectContent>
                  {panelists.map((panelist) => (
                    <SelectItem key={panelist._id} value={panelist.name}>
                      <div className="flex flex-col">
                        <span>{panelist.name}</span>
                        {panelist.skill_set && (
                          <span className="text-xs text-gray-500">Skills: {panelist.skill_set.join(", ")}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {panelists.length === 0 && (
                <p className="text-sm text-red-600">No available panelists found for this position.</p>
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>Interview Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? formatDate(selectedDate) : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Interview Time *</Label>
          <Input
            id="time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!selectedPanelist || !selectedDate || !selectedTime || isLoading}>
            Assign {nextRound} Interview
          </Button>
        </div>
      </form>
    </div>
  )
}
