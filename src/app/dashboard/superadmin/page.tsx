import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { fetchVacancies } from "@/lib/vacancy-api"
import { fetchDriveInsights, type DriveInsights } from "@/lib/analytics-api"
import { type Vacancy } from "@/lib/schema-data"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, UserCheck, Clock, TrendingUp, CheckCircle, XCircle, Briefcase, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface AggregateMetrics {
  total_candidates: number
  attended: number
  not_attended: number
  cleared_all_rounds: number
  total_rejected: number
  selection_rate: number
  avg_time_to_hire: number
  active_drives: number
}

interface VacancyWithInsights extends Vacancy {
  insights?: DriveInsights | null
}

export default function SuperadminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [vacancies, setVacancies] = useState<VacancyWithInsights[]>([])
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all vacancies (superadmin-accessible endpoint)
      const vacanciesData = await fetchVacancies()
      
      // Fetch insights for each vacancy
      const vacanciesWithInsights = await Promise.all(
        vacanciesData.map(async (vacancy) => {
          try {
            const insights = await fetchDriveInsights(vacancy.id)
            return { ...vacancy, insights }
          } catch (error) {
            console.error(`Failed to fetch insights for vacancy ${vacancy.id}:`, error)
            return {
              ...vacancy,
              insights: null
            }
          }
        })
      )
      
      setVacancies(vacanciesWithInsights)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate aggregate metrics based on selected filters
  const aggregateMetrics = useMemo((): AggregateMetrics => {
    let filteredVacancies = vacancies

    // If a specific drive is selected, show only that drive's metrics
    if (selectedDrive) {
      const selectedVacancy = filteredVacancies.find(v => v.id === selectedDrive)
      if (selectedVacancy?.insights) {
        return {
          total_candidates: selectedVacancy.insights.total_candidates,
          attended: selectedVacancy.insights.attended,
          not_attended: selectedVacancy.insights.not_attended,
          cleared_all_rounds: selectedVacancy.insights.cleared_all_rounds,
          total_rejected: selectedVacancy.insights.total_rejected,
          selection_rate: selectedVacancy.insights.selection_rate,
          avg_time_to_hire: selectedVacancy.insights.avg_time_to_hire,
          active_drives: 1
        }
      }
    }

    // Aggregate metrics across all vacancies
    const metrics = filteredVacancies.reduce((acc, vacancy) => {
      if (!vacancy.insights) return acc
      
      return {
        total_candidates: acc.total_candidates + vacancy.insights.total_candidates,
        attended: acc.attended + vacancy.insights.attended,
        not_attended: acc.not_attended + vacancy.insights.not_attended,
        cleared_all_rounds: acc.cleared_all_rounds + vacancy.insights.cleared_all_rounds,
        total_rejected: acc.total_rejected + vacancy.insights.total_rejected,
        selection_rate: 0, // Will calculate below
        avg_time_to_hire: 0, // Will calculate below
        active_drives: acc.active_drives + (vacancy.status === "active" ? 1 : 0)
      }
    }, {
      total_candidates: 0,
      attended: 0,
      not_attended: 0,
      cleared_all_rounds: 0,
      total_rejected: 0,
      selection_rate: 0,
      avg_time_to_hire: 0,
      active_drives: 0
    })

    // Calculate average selection rate and time to hire
    const vacanciesWithInsights = filteredVacancies.filter(v => v.insights)
    if (vacanciesWithInsights.length > 0) {
      metrics.selection_rate = vacanciesWithInsights.reduce((sum, v) => sum + (v.insights?.selection_rate || 0), 0) / vacanciesWithInsights.length
      metrics.avg_time_to_hire = vacanciesWithInsights.reduce((sum, v) => sum + (v.insights?.avg_time_to_hire || 0), 0) / vacanciesWithInsights.length
    }

    return metrics
  }, [vacancies, selectedDrive])

  // Prepare data for charts
  const barChartData = useMemo(() => {
    return vacancies
      .filter(v => v.insights)
      .map(v => ({
        name: v.position_title.length > 20 ? v.position_title.substring(0, 20) + '...' : v.position_title,
        "Selection Rate": v.insights?.selection_rate || 0
      }))
  }, [vacancies])

  const lineChartData = useMemo(() => {
    return vacancies
      .filter(v => v.insights && v.drive_date)
      .map(v => ({
        name: format(new Date(v.drive_date!), "MMM dd"),
        "Avg Days": v.insights?.avg_time_to_hire || 0
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
  }, [vacancies])

  const pieChartData = useMemo(() => {
    return [
      { name: "Attended", value: aggregateMetrics.attended },
      { name: "Not Attended", value: aggregateMetrics.not_attended }
    ]
  }, [aggregateMetrics])

  const COLORS = ['#10b981', '#f59e0b']

  const handleDriveRowClick = (vacancyId: string) => {
    setSelectedDrive(selectedDrive === vacancyId ? null : vacancyId)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Superadmin Dashboard</h1>
              <p className="text-muted-foreground mt-1">ATS Hiring Overview</p>
            </div>
            <Button 
              onClick={loadInitialData} 
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          {/* Filter by Drive */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Select 
                value={selectedDrive || "all"} 
                onValueChange={(value) => setSelectedDrive(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Drive" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drives</SelectItem>
                  {vacancies.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.total_candidates}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attended</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.attended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Not Attended</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.not_attended}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cleared All Rounds</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.cleared_all_rounds}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.total_rejected}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Selection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.selection_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.avg_time_to_hire.toFixed(1)} days</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Drives</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregateMetrics.active_drives}</div>
            </CardContent>
          </Card>
        </div>

        {/* Drives Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Drives Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {vacancies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drives found. Create a vacancy to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drive Title</TableHead>
                    <TableHead>HR Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Drive Date</TableHead>
                    <TableHead>Total Candidates</TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>Selection Rate</TableHead>
                    <TableHead>Avg Time (days)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.map(vacancy => (
                    <TableRow 
                      key={vacancy.id}
                      onClick={() => handleDriveRowClick(vacancy.id)}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedDrive === vacancy.id ? 'bg-muted' : ''}`}
                    >
                      <TableCell className="font-medium">{vacancy.position_title}</TableCell>
                      <TableCell>{vacancy.recruiter_name || "N/A"}</TableCell>
                      <TableCell>{vacancy.drive_location || "N/A"}</TableCell>
                      <TableCell>{vacancy.drive_date ? format(new Date(vacancy.drive_date), "MMM dd, yyyy") : "N/A"}</TableCell>
                      <TableCell>{vacancy.insights?.total_candidates || 0}</TableCell>
                      <TableCell>{vacancy.insights?.cleared_all_rounds || 0}</TableCell>
                      <TableCell>{vacancy.insights?.selection_rate.toFixed(1) || 0}%</TableCell>
                      <TableCell>{vacancy.insights?.avg_time_to_hire.toFixed(1) || 0}</TableCell>
                      <TableCell>
                        <Badge variant={vacancy.status === "active" ? "default" : "secondary"}>
                          {vacancy.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        {vacancies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Selection Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Drive Selection Rates</CardTitle>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Selection Rate" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Chart - Time to Hire */}
            <Card>
              <CardHeader>
                <CardTitle>Average Time to Hire Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Avg Days" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart - Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {aggregateMetrics.total_candidates > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
