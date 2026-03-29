"use client"

import Image from "next/image"
import Link from "next/link"
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Doctor {
  id: string;
  name: string | null;
  specialization: string;
  image: string | null;
  rating: number;
  location: string | null;
  status?: string;
  appointments: Appointment[];
}

interface Appointment {
  [key: string]: unknown;
}

interface FeaturedDoctorsProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
}

export default function FeaturedDoctors({ doctors, isLoading, error }: FeaturedDoctorsProps) {
  const router = useRouter()
  
  const featuredDoctors = doctors.slice(0, 4).map(doctor => ({
    id: doctor.id,
    name: doctor.name || 'Unnamed Doctor',
    specialization: doctor.specialization,
    rating: doctor.rating || 0,
    reviews: doctor.appointments.length,
    location: doctor.location || 'Location Not Specified',
    image: doctor.image || "/placeholder.svg?height=400&width=400",
    status: doctor.status || 'AVAILABLE'
  }))

  const handleBookAppointment = (doctorId: string) => {
    Cookies.set('selectedDoctorId', doctorId, { expires: 2/1440 })
    router.push(`/book`)
  }

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <p>Loading doctors...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">Featured Doctors</h2>
          <p className="mx-auto max-w-175 text-muted-foreground md:text-lg">
            Our top-rated healthcare professionals ready to provide the care you need.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden border shadow-sm">
              <div className="aspect-square relative">
                <Image 
                  src={doctor.image || "/placeholder.svg"} 
                  alt={doctor.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-xl">{doctor.name}</CardTitle>
                <CardDescription>{doctor.specialization}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? "opacity-100" : "opacity-30"}`}
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {Number(doctor.rating).toFixed(1)} ({doctor.reviews} reviews)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{doctor.location}</p>
                <Badge 
                  variant="outline" 
                  className={`
                    ${doctor.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-200' : 
                      doctor.status === 'ON_DUTY' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-red-50 text-red-700 border-red-200'}
                  `}
                >
                  {doctor.status}
                </Badge>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={() => handleBookAppointment(doctor.id)}>
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Button variant="outline">
            <Link href="/all-doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}