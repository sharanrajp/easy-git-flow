import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/api-config"
import { getToken } from "@/lib/auth"
import { Search, RefreshCw, Loader2, Play, List } from "lucide-react"
import { ScreeningLogsDialog } from "./screening-logs-dialog"
import { fetchScreeningSummaryLogs, type ScreeningSummaryLog } from "@/lib/candidates-api"

interface PositionScreeningSummary {
  position_title: string
  vacancy_id: string
  total_candidates: number
  screened: number
  not_screened: number
}

interface ScreeningSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScreeningComplete?: () => void
}

export function ScreeningSummaryDialog({ 
  open, 
  onOpenChange,
  onScreeningComplete 
}: ScreeningSummaryDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [summaries, setSummaries] = useState<PositionScreeningSummary[]>([])
  const [runningScreening, setRunningScreening] = useState<string | null>(null)
  const [runningGlobal, setRunningGlobal] = useState<'all' | 'retry' | null>(null)
  const [isScreeningLogsOpen, setIsScreeningLogsOpen] = useState(false)
  const [screeningLogs, setScreeningLogs] = useState<ScreeningSummaryLog[]>([])
  const [loadingScreeningLogs, setLoadingScreeningLogs] = useState(false)

  useEffect(() => {
    if (open) {
      fetchScreeningSummary()
    }
  }, [open])

  const fetchScreeningSummary = async () => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      // First, fetch vacancies to get vacancy IDs
      const vacanciesResponse = await fetch(`${API_BASE_URL}/Vacancy/get_all_vacancies`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!vacanciesResponse.ok) {
        throw new Error("Failed to fetch vacancies")
      }

      const vacancies = await vacanciesResponse.json()
      
      if (!vacancies || vacancies.length === 0) {
        setSummaries([])
        return
      }

      // Fetch screening summaries for all vacancies
      const summaryPromises = vacancies.map(async (vacancy: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/screening/summary-by-position/${vacancy._id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            return await response.json()
          }
          return null
        } catch (error) {
          console.error(`Error fetching summary for vacancy ${vacancy._id}:`, error)
          return null
        }
      })

      const results = await Promise.all(summaryPromises)
      const validSummaries = results.filter(summary => summary !== null).flat()
      setSummaries(validSummaries)
    } catch (error) {
      console.error('Error fetching screening summary:', error)
      toast({
        title: "Error",
        description: "Failed to fetch screening summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRunScreeningForPosition = async (vacancyId: string, positionName: string) => {
    setRunningScreening(vacancyId)
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/screening/screen-by-position/${vacancyId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to run screening")
      }

      toast({
        title: "Success",
        description: `Screening started for ${positionName}`,
      })

      // Refresh the summary
      await fetchScreeningSummary()
      onScreeningComplete?.()
    } catch (error) {
      console.error('Error running screening:', error)
      toast({
        title: "Error",
        description: `Failed to run screening for ${positionName}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setRunningScreening(null)
    }
  }

  const handleRunAllScreenings = async () => {
    setRunningGlobal('all')
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/screening/screen-candidates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to run all screenings")
      }

      toast({
        title: "Success",
        description: "Screening started for all positions",
      })

      // Refresh the summary
      await fetchScreeningSummary()
      onScreeningComplete?.()
    } catch (error) {
      console.error('Error running all screenings:', error)
      toast({
        title: "Error",
        description: "Failed to run all screenings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRunningGlobal(null)
    }
  }

  const handleRetryFailed = async () => {
    setRunningGlobal('retry')
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/screening/retry-failed`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to retry failed screenings")
      }

      toast({
        title: "Success",
        description: "Retrying failed screenings",
      })

      // Refresh the summary
      await fetchScreeningSummary()
      onScreeningComplete?.()
    } catch (error) {
      console.error('Error retrying failed screenings:', error)
      toast({
        title: "Error",
        description: "Failed to retry failed screenings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRunningGlobal(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 mr-10">
          <DialogTitle>Screening Summary</DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setLoadingScreeningLogs(true)
                try {
                  const response = await fetchScreeningSummaryLogs()
                  setScreeningLogs(response.logs)
                  setIsScreeningLogsOpen(true)
                } catch (error) {
                  console.error('Error fetching screening logs:', error)
                  toast({
                    title: "Error",
                    description: "Failed to fetch screening logs. Please try again.",
                    variant: "destructive",
                  })
                } finally {
                  setLoadingScreeningLogs(false)
                }
              }}
              disabled={loadingScreeningLogs}
            >
              {loadingScreeningLogs ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-2" />
                  View Logs
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAllScreenings}
              disabled={loading || runningGlobal === 'all'}
            >
              {runningGlobal === 'all' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Screenings
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryFailed}
              disabled={loading || runningGlobal === 'retry'}
            >
              {runningGlobal === 'retry' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed Screenings
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No positions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position Name</TableHead>
                <TableHead className="text-center">Total Candidates</TableHead>
                <TableHead className="text-center">Screened</TableHead>
                <TableHead className="text-center">Not Screened</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.vacancy_id}>
                  <TableCell className="font-medium">{summary.position_title}</TableCell>
                  <TableCell className="text-center">{summary.total_candidates}</TableCell>
                  <TableCell className="text-center">{summary.screened}</TableCell>
                  <TableCell className="text-center">{summary.not_screened}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunScreeningForPosition(summary.vacancy_id, summary.position_title)}
                      disabled={runningScreening === summary.vacancy_id || summary.not_screened === 0}
                    >
                      {runningScreening === summary.vacancy_id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        'Run Screening'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <ScreeningLogsDialog
        open={isScreeningLogsOpen}
        onOpenChange={setIsScreeningLogsOpen}
        logs={screeningLogs}
        loading={loadingScreeningLogs}
      />
    </Dialog>
  )
}
