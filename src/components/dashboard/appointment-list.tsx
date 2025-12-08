"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, Clock, MapPin, MoreHorizontal, Search } from "lucide-react"
import { format, parseISO, isAfter, isBefore, isToday } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Define the appointment interface based on the API response structure
interface Doctor {
  id: string
  name: string
  specialty: string
  image?: string
}

interface Appointment {
  id: string
  patientId: string
  doctorId?: string
  dateTime?: string
  condition?: string
  specialization?: string
  status: "NEW" | "PENDING" | "COMPLETED" | "CANCELED" | "EMERGENCY"
  comments?: string
  description?: string
  prescriptions?: string[]
  tests?: string[]
  doctor?: Doctor
  location?: string // We'll need to add this in the UI or map from somewhere
}

export default function AppointmentsList() {
  const [date, setDate] = useState<Date>()
  const [searchQuery, setSearchQuery] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])

  // Function to fetch appointments using patientId from localStorage
  const fetchAppointments = async () => {
    try {
      setLoading(true)
      // Get patientId from localStorage
      const patientId = localStorage.getItem('patientId')
      
      if (!patientId) {
        setError("Patient ID not found. Please login again.")
        setLoading(false)
        return
      }
      
      // Fetch appointments for this patient
      const response = await fetch(`/api/appointments?patientId=${patientId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`)
      }
      
      const data = await response.json()
      setAppointments(data)
      
      // Filter appointments into upcoming and past
      filterAppointments(data)
      
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setLoading(false)
    }
  }
  
  // Function to filter appointments into upcoming and past
  const filterAppointments = (appointments: Appointment[]) => {
    const now = new Date()
    const upcoming: Appointment[] = []
    const past: Appointment[] = []
    
    appointments.forEach(appointment => {
      if (!appointment.dateTime) {
        // If no dateTime, consider it as tentative/upcoming
        upcoming.push(appointment)
        return
      }
      
      const appointmentDate = parseISO(appointment.dateTime)
      
      // If appointment is today or in the future
      if (isToday(appointmentDate) || isAfter(appointmentDate, now)) {
        upcoming.push(appointment)
      } else {
        past.push(appointment)
      }
    })
    
    // Sort upcoming by date (nearest first)
    upcoming.sort((a, b) => {
      if (!a.dateTime) return -1
      if (!b.dateTime) return 1
      return parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime()
    })
    
    // Sort past by date (most recent first)
    past.sort((a, b) => {
      if (!a.dateTime) return 1
      if (!b.dateTime) return -1
      return parseISO(b.dateTime).getTime() - parseISO(a.dateTime).getTime()
    })
    
    setUpcomingAppointments(upcoming)
    setPastAppointments(past)
  }
  
  // Function to filter appointments by date
  const filterByDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      // If date filter is cleared, reset to original filter
      filterAppointments(appointments)
      return
    }
    
    // Filter to only show appointments on the selected date
    const filteredUpcoming = appointments.filter(appointment => {
      if (!appointment.dateTime) return false
      const appointmentDate = parseISO(appointment.dateTime)
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear() &&
        (isToday(appointmentDate) || isAfter(appointmentDate, new Date()))
      )
    })
    
    const filteredPast = appointments.filter(appointment => {
      if (!appointment.dateTime) return false
      const appointmentDate = parseISO(appointment.dateTime)
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear() &&
        isBefore(appointmentDate, new Date()) &&
        !isToday(appointmentDate)
      )
    })
    
    setUpcomingAppointments(filteredUpcoming)
    setPastAppointments(filteredPast)
  }
  
  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      // If search is cleared, reset to original filter
      filterAppointments(appointments)
      return
    }
    
    const searchLower = query.toLowerCase()
    
    // Filter both lists based on search query
    const filteredUpcoming = appointments.filter(appointment => {
      return (
        (isToday(parseISO(appointment.dateTime || '')) || isAfter(parseISO(appointment.dateTime || ''), new Date())) &&
        (
          appointment.doctor?.name.toLowerCase().includes(searchLower) ||
          appointment.doctor?.specialty.toLowerCase().includes(searchLower) ||
          appointment.condition?.toLowerCase().includes(searchLower) ||
          appointment.specialization?.toLowerCase().includes(searchLower) ||
          appointment.description?.toLowerCase().includes(searchLower)
        )
      )
    })
    
    const filteredPast = appointments.filter(appointment => {
      return (
        (!isToday(parseISO(appointment.dateTime || '')) && isBefore(parseISO(appointment.dateTime || ''), new Date())) &&
        (
          appointment.doctor?.name.toLowerCase().includes(searchLower) ||
          appointment.doctor?.specialty.toLowerCase().includes(searchLower) ||
          appointment.condition?.toLowerCase().includes(searchLower) ||
          appointment.specialization?.toLowerCase().includes(searchLower) ||
          appointment.description?.toLowerCase().includes(searchLower)
        )
      )
    })
    
    setUpcomingAppointments(filteredUpcoming)
    setPastAppointments(filteredPast)
  }
  
  // Effect to fetch appointments on component mount
  useEffect(() => {
    fetchAppointments()
  }, [])
  
  // Effect to apply date filter when date changes
  useEffect(() => {
    filterByDate(date)
  }, [date])
  
  // Map status from API to UI status
  const mapStatusToBadge = (status: string) => {
    switch (status) {
      case "NEW":
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>
      case "CANCELED":
        return <Badge variant="destructive">Cancelled</Badge>
      case "EMERGENCY":
        return <Badge className="bg-red-500">Emergency</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD"
    return format(parseISO(dateString), "MMMM d, yyyy")
  }
  
  // Format time for display
  const formatTime = (dateString?: string) => {
    if (!dateString) return "TBD"
    return format(parseISO(dateString), "h:mm a")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your upcoming and past appointments.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("justify-start text-left font-normal w-60", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
          {date && (
            <Button variant="ghost" size="icon" onClick={() => setDate(undefined)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Clear date</span>
            </Button>
          )}
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No upcoming appointments</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don&apos;t have any upcoming appointments scheduled.
                  </p>
                  <Button>Book an Appointment</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={appointment.doctor?.image || "/placeholder.svg?height=40&width=40"} alt={appointment.doctor?.name || "Doctor"} />
                          <AvatarFallback>
                            {appointment.doctor?.name
                              ? appointment.doctor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "DR"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{appointment.doctor?.name || "Pending Doctor Assignment"}</p>
                            {mapStatusToBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctor?.specialty || appointment.specialization || "General Consultation"}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(appointment.dateTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatTime(appointment.dateTime)}</span>
                            </div>
                            {appointment.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>
                          {appointment.condition && (
                            <p className="text-sm">
                              <span className="font-medium">Condition:</span> {appointment.condition}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button size="sm">View Details</Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Reschedule</DropdownMenuItem>
                              <DropdownMenuItem>Add to Calendar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Cancel Appointment</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No past appointments</p>
                  <p className="text-sm text-muted-foreground">You don&apos;t have any past appointments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={appointment.doctor?.image || "/placeholder.svg?height=40&width=40"} alt={appointment.doctor?.name || "Doctor"} />
                          <AvatarFallback>
                            {appointment.doctor?.name
                              ? appointment.doctor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "DR"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{appointment.doctor?.name || "No Doctor Assigned"}</p>
                            {mapStatusToBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctor?.specialty || appointment.specialization || "General Consultation"}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(appointment.dateTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatTime(appointment.dateTime)}</span>
                            </div>
                            {appointment.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button size="sm">View Details</Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Medical Notes</DropdownMenuItem>
                              <DropdownMenuItem>Download Summary</DropdownMenuItem>
                              <DropdownMenuItem>Book Follow-up</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}