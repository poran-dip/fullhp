"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Clock } from "lucide-react"

export default function PatientAppointmentRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    specialization: "",
    condition: "",
    description: "",
    appointmentDate: undefined as Date | undefined,
    appointmentTime: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTermsDialog, setShowTermsDialog] = useState(false)

  useEffect(() => {
    // Check if patient is already logged in
    const existingPatientId = localStorage.getItem('patientId')
    if (existingPatientId) {
      router.push('/dashboard/appointments')
      return
    }

    // Check for doctor cookie when component mounts
    const doctorId = localStorage.getItem('doctorIdToBook')

    // If no doctor cookie, redirect back to doctor search
    if (!doctorId) {
      router.push('/all-doctors')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear any previous errors
    setError(null)
  }

  const handleSpecializationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, specialization: value }))
  }

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, appointmentDate: date }))
  }

  const handleTimeChange = (time: string) => {
    setFormData((prev) => ({ ...prev, appointmentTime: time }))
  }

  const validateForm = () => {
    // Basic form validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (!formData.appointmentDate) {
      setError("Please select an appointment date")
      return false
    }

    if (!formData.appointmentTime) {
      setError("Please select an appointment time")
      return false
    }

    return true
  }

  const handleTermsCheck = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before showing terms
    if (!validateForm()) {
      return
    }
    
    setShowTermsDialog(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    setShowTermsDialog(false)

    try {
      // Combine date and time for full datetime
      const appointmentDateTime = formData.appointmentDate 
        ? new Date(
            formData.appointmentDate.getFullYear(), 
            formData.appointmentDate.getMonth(), 
            formData.appointmentDate.getDate(), 
            parseInt(formData.appointmentTime.split(':')[0]), 
            parseInt(formData.appointmentTime.split(':')[1])
          ) 
        : null

      // First, create a new patient
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          age: parseInt(formData.age) || undefined,
          gender: formData.gender
        })
      })

      if (!patientResponse.ok) {
        const errorData = await patientResponse.json()
        if (errorData.error === 'Email already in use') {
          setError(errorData.error)
          setIsSubmitting(false)
          return
        }
        throw new Error(errorData.error || 'Failed to create patient')
      }

      const patient = await patientResponse.json()

      // Then, create a new appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: localStorage.getItem('doctorIdToBook'),
          specialization: formData.specialization,
          condition: formData.condition,
          description: formData.description,
          dateTime: appointmentDateTime?.toISOString(),
          status: 'NEW'
        })
      })

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json()
        throw new Error(errorData.error || 'Failed to book appointment')
      }

      const appointment = await appointmentResponse.json()
      
      // Store patient details in localStorage for login
      localStorage.setItem('patientId', patient.id)
      localStorage.setItem('patientEmail', patient.email)

      // Redirect to confirmation page
      router.push(`/book/confirmation?appointment=${appointment.id}`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'an unknown error occurred'
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  // Generate time slots (every 30 minutes from 8 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const handleLoginRedirect = () => {
    router.push('/')
  }

  return (
    <div className="container py-10 mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Patient Registration & Appointment</CardTitle>
          <CardDescription>
            Create your account and book an appointment in one step
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleTermsCheck}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error === 'Email already in use' ? (
                  <div className="flex justify-between items-center">
                    <span>Email is already registered. Please log in.</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLoginRedirect}
                    >
                      Go to Login
                    </Button>
                  </div>
                ) : (
                  error
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Password *</Label>
                <Input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Confirm Password *</Label>
                <Input 
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
              <Label>Gender</Label>
              <Select 
                value={formData.gender}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
              <div>
                <Label>Age</Label>
                <Input 
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="120"
                />
              </div>
            </div>

            <div>
              <Label>Specialization *</Label>
              <Select 
                value={formData.specialization}
                onValueChange={handleSpecializationChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Condition</Label>
              <Input 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Appointment Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      {formData.appointmentDate ? (
                        format(formData.appointmentDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.appointmentDate}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Appointment Time *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {formData.appointmentTime ? (
                        formData.appointmentTime
                      ) : (
                        <span className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" /> Select Time
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {generateTimeSlots().map((time) => (
                        <Button
                          key={time}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            handleTimeChange(time)
                          }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide additional details about your appointment"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Create Account & Book Appointment'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Terms of Service Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
            <DialogDescription>
              By creating an account and booking an appointment, you agree to our terms of service and privacy policy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm max-h-[300px] overflow-y-auto py-2">
            <p>Before proceeding, please acknowledge that:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Your submitted information will be used exclusively to process and display your appointment-related preferences.</li>
              <li>Due to the developmental nature of EazyDoc, submitted data may be accessible to the Cosmic Titans development team and other users.</li>
              <li>EazyDoc is not designed for secure or confidential handling of personal or sensitive medical information.</li>
              <li>You understand that you submit information at your own risk.</li>
            </ol>
            <p className="pt-2">For complete details, please review our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTermsDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              I Agree & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}