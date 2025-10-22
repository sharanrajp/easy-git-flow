import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { fetchVacancies } from "@/lib/vacancy-api"
import { fetchDriveInsights, fetchJoinedCandidates, type DriveInsights, type JoinedCandidate } from "@/lib/analytics-api"
import { fetchAssignedCandidates, fetchUnassignedCandidates, type BackendCandidate } from "@/lib/candidates-api"
import { type Vacancy } from "@/lib/schema-data"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, UserCheck, Clock, TrendingUp, CheckCircle, XCircle, Briefcase, RefreshCw, Search, Download, Calendar } from "lucide-react"
import { format } from "date-fns"
import { SkillsDisplay } from "@/components/ui/skills-display"

interface AggregateMetrics {
  total_candidates: number
  attended: number
  not_attended: number
  cleared_all_rounds: number
  total_rejected: number
  selection_rate: number
  avg_time_to_hire: number
  avg_time_to_fill: number
  active_drives: number
}

interface VacancyWithInsights extends Vacancy {
  insights?: DriveInsights | null
}

export default function SuperadminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [vacancies, setVacancies] = useState<VacancyWithInsights[]>([])
  const [candidates, setCandidates] = useState<BackendCandidate[]>([])
  const [joinedCandidates, setJoinedCandidates] = useState<JoinedCandidate[]>([])
  const [vacancyFilter, setVacancyFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [recruiterFilter, setRecruiterFilter] = useState<string>("all")
  const [monthYearFilter, setMonthYearFilter] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })
  const [activeTab, setActiveTab] = useState("drive-summary")
  const { toast } = useToast()

  // Auto-refresh on mount, filter changes, and tab changes
  useEffect(() => {
    loadInitialData()
  }, [vacancyFilter, recruiterFilter, monthYearFilter, activeTab])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all vacancies (superadmin-accessible endpoint)
      const vacanciesData = await fetchVacancies()
      
      // Fetch insights with filters
      try {
        const insights = await fetchDriveInsights(
          vacancyFilter !== 'all' ? vacancyFilter : undefined,
          monthYearFilter
        );
        
        // Attach insights to the corresponding vacancy
        const vacanciesWithInsights = vacanciesData.map(vacancy => {
          if (vacancyFilter !== 'all' && vacancy.id === vacancyFilter) {
            return { ...vacancy, insights };
          } else if (vacancyFilter === 'all') {
            // For "all", we'll have aggregated insights, but we still need individual vacancy data
            return { ...vacancy, insights: null };
          }
          return { ...vacancy, insights: null };
        });
        
        setVacancies(vacanciesWithInsights);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
        setVacancies(vacanciesData.map(v => ({ ...v, insights: null })));
      }

      // Fetch joined candidates for Candidate Summary tab
      if (activeTab === 'candidate-summary') {
        try {
          const joinedCandidatesData = await fetchJoinedCandidates();
          
          console.log('Loaded joined candidates data:', joinedCandidatesData);
          
          // Ensure we got an array back (not a Blob for export)
          if (Array.isArray(joinedCandidatesData)) {
            setJoinedCandidates(joinedCandidatesData);
          } else {
            console.error('Unexpected response type from fetchJoinedCandidates:', typeof joinedCandidatesData);
            setJoinedCandidates([]);
          }
        } catch (error) {
          console.error("Failed to fetch joined candidates:", error);
          setJoinedCandidates([]);
        }
      } else {
        // Reset joined candidates when not on candidate summary tab
        setJoinedCandidates([]);
      }
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

  // Calculate aggregate metrics from API response
  const aggregateMetrics = useMemo((): AggregateMetrics => {
    // Find the vacancy with insights (will be the filtered one or aggregated)
    const vacancyWithInsights = vacancies.find(v => v.insights);
    
    if (vacancyWithInsights?.insights) {
      return {
        total_candidates: vacancyWithInsights.insights.total_candidates,
        attended: vacancyWithInsights.insights.attended,
        not_attended: vacancyWithInsights.insights.not_attended,
        cleared_all_rounds: vacancyWithInsights.insights.cleared_all_rounds,
        total_rejected: vacancyWithInsights.insights.rejected_count,
        selection_rate: 0, // Not displayed
        avg_time_to_hire: vacancyWithInsights.insights.avg_time_to_hire,
        avg_time_to_fill: vacancyWithInsights.insights.avg_time_to_fill,
        active_drives: vacancies.filter(v => v.status === "active").length
      };
    }

    return {
      total_candidates: 0,
      attended: 0,
      not_attended: 0,
      cleared_all_rounds: 0,
      total_rejected: 0,
      selection_rate: 0,
      avg_time_to_hire: 0,
      avg_time_to_fill: 0,
      active_drives: 0
    };
  }, [vacancies])

  // Get unique recruiters for filter
  const uniqueRecruiters = useMemo(() => {
    const recruiters = vacancies.map(v => v.recruiter_name).filter(Boolean)
    return Array.from(new Set(recruiters))
  }, [vacancies])

  // Filter joined candidates based on search
  const filteredJoinedCandidates = useMemo(() => {
    // Safety check: ensure joinedCandidates is an array
    if (!Array.isArray(joinedCandidates)) {
      console.error('joinedCandidates is not an array:', joinedCandidates);
      return [];
    }
    
    console.log('Filtering joined candidates:', joinedCandidates);
    
    return joinedCandidates.filter(candidate => {
      const matchesSearch = searchQuery === "" || 
        candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skill_set?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSearch
    })
  }, [joinedCandidates, searchQuery])

  // Export candidates to CSV using API endpoint
  const handleExportCSV = async () => {
    try {
      const blob = await fetchJoinedCandidates(true) as Blob;

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `candidates-summary-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Exported candidates to CSV`
      })
    } catch (error) {
      console.error("Failed to export CSV:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export candidates to CSV",
        variant: "destructive"
      })
    }
  }

  // Prepare data for charts (commented out - not currently used)
  /*
  const barChartData = useMemo(() => {
    return vacancies
      .filter(v => v.insights)
      .map(v => ({
        name: v.position_title.length > 20 ? v.position_title.substring(0, 20) + '...' : v.position_title,
        "Selection Rate": 0
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
  */

  const handleDriveRowClick = (vacancyId: string) => {
    // Removed - no longer needed
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
    <DashboardLayout requiredRole="superadmin">
      <div className="space-y-6 p-6">
        {/* Header with Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Superadmin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Comprehensive analytics and insights</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Vacancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vacancies</SelectItem>
                {vacancies.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.position_title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                {uniqueRecruiters.map(recruiter => (
                  <SelectItem key={recruiter} value={recruiter || ""}>
                    {recruiter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={monthYearFilter} onValueChange={setMonthYearFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return <SelectItem key={value} value={value}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards - Exactly 5 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Candidates */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Candidates</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aggregateMetrics.total_candidates}</div>
            </CardContent>
          </Card>

          {/* Attended / Not Attended */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Attended / Not Attended</CardTitle>
              <UserCheck className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aggregateMetrics.attended} / {aggregateMetrics.not_attended}</div>
            </CardContent>
          </Card>

          {/* Cleared / Rejected */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Cleared / Rejected</CardTitle>
              <CheckCircle className="h-5 w-5 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aggregateMetrics.cleared_all_rounds} / {aggregateMetrics.total_rejected || 0}</div>
            </CardContent>
          </Card>

          {/* Average Time to Hire */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Avg Time to Hire</CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold whitespace-nowrap">{aggregateMetrics.avg_time_to_hire.toFixed(1)} <span className="text-xs text-muted-foreground">days</span></div>
            </CardContent>
          </Card>

          {/* Average Time to Fill */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Avg Time to Fill</CardTitle>
              <Calendar className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold whitespace-nowrap">{aggregateMetrics.avg_time_to_fill.toFixed(1)} <span className="text-xs text-muted-foreground">days</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Export Section (for Candidate Summary tab only) */}
        {activeTab === 'candidate-summary' && (
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="drive-summary">Drive Summary</TabsTrigger>
            <TabsTrigger value="candidate-summary">Candidate Summary</TabsTrigger>
          </TabsList>

        {/* Drive Summary Tab */}
        <TabsContent value="drive-summary">
          {vacancies.filter(v => recruiterFilter === 'all' || v.recruiter_name === recruiterFilter).length === 0 ? (
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
                  <TableHead>Joined / Vacancies</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacancies.filter(v => recruiterFilter === 'all' || v.recruiter_name === recruiterFilter).map(vacancy => (
                  <TableRow 
                    key={vacancy.id}
                  >
                    <TableCell className="font-medium">{vacancy.position_title}</TableCell>
                    <TableCell>{vacancy.recruiter_name || "N/A"}</TableCell>
                    <TableCell>{vacancy.drive_location || "N/A"}</TableCell>
                    <TableCell>{vacancy.drive_date ? format(new Date(vacancy.drive_date), "MMM dd, yyyy") : "N/A"}</TableCell>
                    <TableCell>{vacancy.insights?.total_candidates || 0}</TableCell>
                    <TableCell>{vacancy.insights?.joined_per_vacancy || `${vacancy.insights?.cleared_all_rounds || 0} / ${vacancy.number_of_vacancies}`}</TableCell>
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
        </TabsContent>

        {/* Candidate Summary Tab */}
        <TabsContent value="candidate-summary">
          {filteredJoinedCandidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates found matching the filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date of Joining</TableHead>
                  <TableHead>Time to Hire</TableHead>
                  <TableHead>Time to Fill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJoinedCandidates.filter(c => c.final_status === 'joined').map((candidate, idx) => (
                  <TableRow key={`joined-${idx}`}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.total_experience || "-"}</TableCell>
                    <TableCell>
                      <SkillsDisplay skills={candidate.skill_set || []} maxVisible={3} />
                    </TableCell>
                    <TableCell>{candidate.recruiter_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="default">Joined</Badge>
                    </TableCell>
                    <TableCell>{candidate.joined_date ? format(new Date(candidate.joined_date), "MMM dd, yyyy") : "-"}</TableCell>
                    <TableCell>{candidate.time_to_hire ? `${candidate.time_to_hire} days` : "-"}</TableCell>
                    <TableCell>{candidate.time_to_fill ? `${candidate.time_to_fill} days` : "-"}</TableCell>
                  </TableRow>
                ))}
                {filteredJoinedCandidates.filter(c => c.final_status === 'offerReleased').map((candidate, idx) => (
                  <TableRow key={`offer-${idx}`}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.total_experience || "-"}</TableCell>
                    <TableCell>
                      <SkillsDisplay skills={candidate.skill_set || []} maxVisible={3} />
                    </TableCell>
                    <TableCell>{candidate.recruiter_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Offer Released</Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>


          {/* Drive Summary Tab */}
          {/* <TabsContent value="drive-summary">
            <Card>
              <CardContent className="pt-6">
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
                        <TableHead>Selected / Vacancies</TableHead>
                        <TableHead>Avg Time to Hire</TableHead>
                        <TableHead>Avg Time to Fill</TableHead>
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
                          <TableCell>{vacancy.insights?.cleared_all_rounds || 0} / {vacancy.number_of_vacancies}</TableCell>
                          <TableCell>{(vacancy.insights?.avg_time_to_hire ?? 0).toFixed(1)} days</TableCell>
                          <TableCell>{((vacancy.insights?.avg_time_to_hire ?? 0) + 7).toFixed(1)} days</TableCell>
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
          </TabsContent> */}

          {/* Candidate Summary Tab */}
          {/* <TabsContent value="candidate-summary">
            <Card>
              <CardContent className="p-0">
                {filteredJoinedCandidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No candidates found matching the filters.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate Name</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Skills</TableHead>
                        {statusFilter === "joined" && (
                          <>
                            <TableHead>Date of Joining</TableHead>
                            <TableHead>Time to Hire</TableHead>
                            <TableHead>Time to Fill</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJoinedCandidates.map((candidate, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell>{candidate.total_experience || "N/A"}</TableCell>
                          <TableCell>
                            <SkillsDisplay skills={candidate.skill_set || []} maxVisible={3} />
                          </TableCell>
                          {statusFilter === "joined" && (
                            <>
                              <TableCell>{candidate.joined_date || "N/A"}</TableCell>
                              <TableCell>{candidate.time_to_hire ? `${candidate.time_to_hire} days` : "N/A"}</TableCell>
                              <TableCell>{candidate.time_to_fill ? `${candidate.time_to_fill} days` : "N/A"}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>*/}
        </Tabs>

        {/* Charts temporarily disabled as per new dashboard layout */}
        {/* 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        */}
      </div>
    </DashboardLayout>
  )
}
