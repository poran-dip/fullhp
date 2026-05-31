import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  {
    title: "For Patients",
    checkColor: "text-green-500",
    features: [
      "AI-Powered Doctor Matching",
      "24/7 Emergency Services",
      "Digital Prescription Tracking",
      "Test Result Management",
      "Comprehensive Medical History",
    ],
  },
  {
    title: "For Doctors",
    checkColor: "text-blue-500",
    features: [
      "Centralized Management",
      "Digital Patient Records",
      "Reduced Paperwork",
      "Real-Time Patient Insights",
      "Seamless Communication Tools",
    ],
  },
  {
    title: "For Administrators",
    checkColor: "text-purple-500",
    features: [
      "Comprehensive Dashboard",
      "Staff and Patient Management",
      "Appointment Tracking",
      "Resource Allocation Insights",
      "Performance Analytics",
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-20 bg-blue-50">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
            Everything You Need, For Everyone
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            FullHP is built for every stakeholder in the healthcare journey —
            patients, doctors, and the teams that support them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <Card key={role.title} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-center">{role.title}</CardTitle>
              </CardHeader>
              <CardContent className="grow">
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check
                        className={`h-4 w-4 shrink-0 ${role.checkColor}`}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
