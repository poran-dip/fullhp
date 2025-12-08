import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from '@/components/ui/calendar';
import { Search, Pencil, Trash2, Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, set } from 'date-fns';
import { toast } from "sonner";

// Define types based on Prisma schema
interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Patient {
  id: string;
  name: string;
  age?: number | null;
  gender?: string | null;
}

interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId?: string | null;
  doctor?: Doctor | null;
  dateTime?: Date | null;
  condition?: string | null;
  specialization?: string | null;
  status: 'NEW' | 'PENDING' | 'COMPLETED' | 'CANCELED';
}

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  
  // Form fields
  const [formPatientId, setFormPatientId] = useState('');
  const [formDoctorId, setFormDoctorId] = useState<string | undefined>(undefined);
  const [formDate, setFormDate] = useState<Date | undefined>(undefined);
  const [formTime, setFormTime] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formStatus, setFormStatus] = useState<'NEW' | 'PENDING' | 'COMPLETED' | 'CANCELED'>('NEW');
  
  // Lists for select fields
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Fetch all appointments on component mount
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  // Fetch all appointments from API
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error("Error", {
        description: "Failed to load appointment data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch patients for select
  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error("Error", {
        description: "Failed to load patient data",
      });
    }
  };

  // Fetch doctors for select
  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error("Error", {
        description: "Failed to load doctor data",
      });
    }
  };

  const getFilteredDoctors = () => {
    if (!formSpecialization || formSpecialization === "" || formSpecialization === "none") {
      return doctors;
    }
    return doctors.filter(doctor => doctor.specialization === formSpecialization);
  };

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...appointments];
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patient?.name?.toLowerCase().includes(term) ||
        appointment.doctor?.name?.toLowerCase().includes(term) ||
        appointment.condition?.toLowerCase().includes(term) ||
        appointment.specialization?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter(appointment => 
        appointment.status === statusFilter
      );
    }
    
    setFilteredAppointments(filtered);
  }, [searchTerm, statusFilter, appointments]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Add appointment
  const handleAddAppointment = () => {
    // Reset form
    setFormPatientId('');
    setFormDoctorId(undefined);
    setFormDate(undefined);
    setFormTime('');
    setFormCondition('');
    setFormSpecialization('');
    setFormStatus('NEW');
    setIsAddDialogOpen(true);
  };

  // Submit new appointment
  const submitNewAppointment = async () => {
    if (!formPatientId) {
      toast.error("Required Fields", {
        description: "Please select a patient",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let dateTime = undefined;
      
      if (formDate && formTime) {
        const [hours, minutes] = formTime.split(':').map(Number);
        dateTime = set(formDate, { hours, minutes });
      }
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: formPatientId,
          doctorId: formDoctorId === "none" ? null : (formDoctorId || null),
          dateTime: dateTime || null,
          condition: formCondition || null,
          specialization: formSpecialization || null,
          status: formStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      const newAppointment = await response.json();
      console.log(newAppointment);

      // Update local state
      await fetchAppointments(); // Refetch to get all relations
      
      toast.success("Success", {
        description: "Appointment created successfully",
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error("Error", {
        description: "Failed to create appointment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    
    // Populate form with current values
    setFormPatientId(appointment.patientId);
    setFormDoctorId(appointment.doctorId || undefined);
    setFormDate(appointment.dateTime ? new Date(appointment.dateTime) : undefined);
    setFormTime(appointment.dateTime ? format(new Date(appointment.dateTime), 'HH:mm') : '');
    setFormCondition(appointment.condition || '');
    setFormSpecialization(appointment.specialization || '');
    setFormStatus(appointment.status);
    
    setIsEditDialogOpen(true);
  };

  // Submit edited appointment
  const submitEditedAppointment = async () => {
    if (!currentAppointment || !formPatientId) {
      toast.error("Required Fields", {
        description: "Please select a patient",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let dateTime = undefined;
      
      if (formDate && formTime) {
        const [hours, minutes] = formTime.split(':').map(Number);
        dateTime = set(formDate, { hours, minutes });
      }
      
      const response = await fetch(`/api/appointments/${currentAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: formPatientId,
          doctorId: formDoctorId === "none" ? null : (formDoctorId || null),
          dateTime: dateTime || null,
          condition: formCondition || null,
          specialization: formSpecialization || null,
          status: formStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      // Update local state
      await fetchAppointments(); // Refetch to get all relations
      
      toast.success("Success", {
        description: "Appointment updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error("Error", {
        description: "Failed to update appointment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete appointment
  const handleDeleteClick = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentAppointment) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/appointments/${currentAppointment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      
      // Update local state
      setAppointments(prev => prev.filter(a => a.id !== currentAppointment.id));
      setFilteredAppointments(prev => prev.filter(a => a.id !== currentAppointment.id));
      
      toast.success("Success", {
        description: "Appointment deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error("Error", {
        description: "Failed to delete appointment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get status badge styles
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Time slot options
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <div className="space-y-4">
      {/* Header and controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center flex-1">
          <Search className="mr-2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={handleSearch}
            className="grow"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddAppointment} className="flex items-center bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>List of all appointments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.patient?.name || 'Unknown'}</TableCell>
                  <TableCell>{appointment.doctor?.name || 'Not Assigned'}</TableCell>
                  <TableCell>
                    {appointment.dateTime 
                      ? format(new Date(appointment.dateTime), 'MMM d, yyyy h:mm a') 
                      : 'Not Scheduled'}
                  </TableCell>
                  <TableCell>{appointment.condition || '-'}</TableCell>
                  <TableCell>{appointment.specialization || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(appointment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Patient Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                Patient *
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formPatientId} 
                  onValueChange={setFormPatientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Doctor Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor" className="text-right">
                Doctor
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formDoctorId} 
                  onValueChange={(value) => {
                    setFormDoctorId(value === "none" ? undefined : value);
                    // Auto-fill specialization when a doctor is selected
                    if (value !== "none") {
                      const selectedDoctor = doctors.find(doc => doc.id === value);
                      if (selectedDoctor) {
                        setFormSpecialization(selectedDoctor.specialization);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {getFilteredDoctors().map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formDate ? format(formDate, 'PPP') : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={setFormDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Time Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formTime} 
                  onValueChange={setFormTime} 
                  disabled={!formDate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Condition */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condition" className="text-right">
                Condition
              </Label>
              <Input
                id="condition"
                value={formCondition}
                onChange={(e) => setFormCondition(e.target.value)}
                className="col-span-3"
                placeholder="Patient's condition"
              />
            </div>
            
            {/* Specialization */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-specialization" className="text-right">
                Specialization
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formSpecialization} 
                  onValueChange={(value) => {
                    setFormSpecialization(value === "none" ? "" : value);
                    // Clear doctor selection if the specialization changes
                    if (formDoctorId) {
                      const currentDoctor = doctors.find(doc => doc.id === formDoctorId);
                      if (!currentDoctor || currentDoctor.specialization !== value) {
                        setFormDoctorId(undefined);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Gynecology">Gynecology</SelectItem>
                    <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formStatus} 
                  onValueChange={(value: 'NEW' | 'PENDING' | 'COMPLETED' | 'CANCELED') => setFormStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELED">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={submitNewAppointment}
              disabled={isSubmitting || !formPatientId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Patient Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-patient" className="text-right">
                Patient *
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formPatientId} 
                  onValueChange={setFormPatientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Doctor Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-doctor" className="text-right">
                Doctor
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formDoctorId} 
                  onValueChange={(value) => {
                    setFormDoctorId(value === "none" ? undefined : value);
                    // Auto-fill specialization when a doctor is selected
                    if (value !== "none") {
                      const selectedDoctor = doctors.find(doc => doc.id === value);
                      if (selectedDoctor) {
                        setFormSpecialization(selectedDoctor.specialization);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {getFilteredDoctors().map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formDate ? format(formDate, 'PPP') : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={setFormDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Time Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-time" className="text-right">
                Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formTime} 
                  onValueChange={setFormTime} 
                  disabled={!formDate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Condition */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-condition" className="text-right">
                Condition
              </Label>
              <Input
                id="edit-condition"
                value={formCondition}
                onChange={(e) => setFormCondition(e.target.value)}
                className="col-span-3"
                placeholder="Patient's condition"
              />
            </div>
            
            {/* Specialization */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialization" className="text-right">
                Specialization
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formSpecialization} 
                  onValueChange={(value) => {
                    setFormSpecialization(value === "none" ? "" : value);
                    // Clear doctor selection if the specialization changes
                    if (formDoctorId) {
                      const currentDoctor = doctors.find(doc => doc.id === formDoctorId);
                      if (!currentDoctor || currentDoctor.specialization !== value) {
                        setFormDoctorId(undefined);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Gynecology">Gynecology</SelectItem>
                    <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formStatus} 
                  onValueChange={(value: 'NEW' | 'PENDING' | 'COMPLETED' | 'CANCELED') => setFormStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELED">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={submitEditedAppointment}
              disabled={isSubmitting || !formPatientId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment 
              {currentAppointment && ` for ${currentAppointment.patient?.name}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAppointments;