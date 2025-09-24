import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Candidate } from "@/lib/mock-data"
import { getAllUsers } from "@/lib/auth"

interface ScheduleInterviewFormProps {
  candidate: Candidate
  onSubmit: (data: { panelist: string; dateTime: string }) => void
  onCancel: () => void
}

export function ScheduleInterviewForm({ candidate, onSubmit, onCancel }: ScheduleInterviewFormProps) {
  const [selectedPanelist, setSelectedPanelist] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [panelists, setPanelists] = useState<any[]>([])

  useEffect(() => {
    const fetchPanelists = async () => {
      try {
        const users = await getAllUsers()
        setPanelists(users.filter((user) => user.role === "panelist" && user.status === "available"))
      } catch (error) {
        console.error("Failed to fetch panelists:", error)
        setPanelists([])
      }
    }
    fetchPanelists()
  }, [])

  const getNextRound = () => {
    if (!candidate.currentRound) return "R1"

    switch (candidate.status) {
      case "r1-completed":
        return "R2"
      case "r2-completed":
        return "R3"
      default:
        return candidate.currentRound || "R1"
    }
  }

  const nextRound = getNextRound()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPanelist && dateTime) {
      onSubmit({
        panelist: selectedPanelist,
        dateTime,
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
              <p className="font-medium">{candidate.appliedPosition}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience:</span>
              <p className="font-medium">{candidate.experience}</p>
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
          <Select value={selectedPanelist} onValueChange={setSelectedPanelist}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a panelist" />
            </SelectTrigger>
            <SelectContent>
              {panelists.map((panelist) => (
                <SelectItem key={panelist._id} value={panelist.name}>
                  <div className="flex flex-col">
                    <span>{panelist.name}</span>
                    {panelist.skills && (
                      <span className="text-xs text-gray-500">Skills: {panelist.skills.join(", ")}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {panelists.length === 0 && (
            <p className="text-sm text-red-600">No available panelists found for this position.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTime">Interview Date & Time *</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!selectedPanelist || !dateTime}>
            Assign {nextRound} Interview
          </Button>
        </div>
      </form>
    </div>
  )
}
