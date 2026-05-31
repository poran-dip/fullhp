import { Check } from "lucide-react";
import Link from "next/link";
import AdminLoginButton from "@/components/demo/admin-login-button";
import DoctorLoginButton from "@/components/demo/doctor-login-button";
import PatientLoginButton from "@/components/demo/patient-login-button";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FeaturesPage() {
  const patientFeatures = [
    "AI-Powered Doctor Matching",
    "24/7 Emergency Services",
    "Easy Online Booking",
    "Digital Prescription Tracking",
    "Test Result Management",
    "Comprehensive Medical History",
  ];

  const doctorFeatures = [
    "Centralized Appointment Management",
    "Digital Patient Records",
    "Reduced Paperwork",
    "Real-Time Patient Insights",
    "Seamless Communication Tools",
  ];

  const adminFeatures = [
    "Comprehensive Dashboard",
    "Staff and Patient Management",
    "Appointment Tracking",
    "Resource Allocation Insights",
    "Performance Analytics",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-12">
          Platform Features
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-center">For Patients</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              {patientFeatures.map((feature) => (
                <div key={feature} className="flex items-center mb-2">
                  <Check className="mr-2 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium">Test Credentials:</p>
                <p className="text-sm">Email: myra@gmail.com</p>
                <p className="text-sm mb-2">Password: myrakapoor</p>
                <PatientLoginButton />
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/dashboard" className="w-full">
                <Button variant="default" className="w-full cursor-pointer">
                  Open Dashboard
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-center">For Doctors</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              {doctorFeatures.map((feature) => (
                <div key={feature} className="flex items-center mb-2">
                  <Check className="mr-2 text-blue-500" />
                  <span>{feature}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium">Test Credentials:</p>
                <p className="text-sm">Email: sosangkar@gmail.com</p>
                <p className="text-sm mb-2">Password: sosangkar</p>
                <DoctorLoginButton />
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/docs" className="w-full">
                <Button variant="default" className="w-full cursor-pointer">
                  Login as Doctor
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-center">For Administrators</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              {adminFeatures.map((feature) => (
                <div key={feature} className="flex items-center mb-2">
                  <Check className="mr-2 text-purple-500" />
                  <span>{feature}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-medium">Test Credentials:</p>
                <p className="text-sm">Email: porandip@gmail.com</p>
                <p className="text-sm mb-2">Password: Password@1</p>
                <AdminLoginButton />
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/admin" className="w-full">
                <Button variant="default" className="w-full cursor-pointer">
                  Login as Admin
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
