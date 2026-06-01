import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Beaker,
  Calendar,
  CalendarPlus,
  Home,
  LogOut,
  Settings,
  Truck,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Role } from "@/generated/prisma/enums";
import { auth, signOut } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navByRole: Record<string, NavItem[]> = {
  [Role.Patient]: [
    { name: "Home", href: "/patient", icon: Home },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Book", href: "/patient/book", icon: CalendarPlus },
    { name: "Tests", href: "/patient/tests", icon: Beaker },
    { name: "Settings", href: "/patient/settings", icon: Settings },
  ],
  [Role.Doctor]: [
    { name: "Home", href: "/doctor", icon: Home },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { name: "Status", href: "/doctor/status", icon: Activity },
    { name: "Settings", href: "/doctor/settings", icon: Settings },
  ],
  [Role.Admin]: [
    { name: "Patients", href: "/admin", icon: User },
    { name: "Doctors", href: "/admin/doctors", icon: UserPlus },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Ambulances", href: "/admin/ambulances", icon: Truck },
  ],
  [Role.Driver]: [
    { name: "Home", href: "/driver", icon: Home },
    { name: "Assignments", href: "/driver/assignments", icon: Calendar },
    { name: "Settings", href: "/driver/settings", icon: Settings },
  ],
};

const portalLabel: Record<string, string> = {
  [Role.Patient]: "Patient Portal",
  [Role.Doctor]: "Doctor Portal",
  [Role.Admin]: "Admin Portal",
  [Role.Driver]: "Driver Portal",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const role = session.user.role;
  const nav = navByRole[role] ?? [];
  const label = portalLabel[role] ?? "Portal";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              FullHP {label}
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="destructive" className="w-full" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            {/* biome-ignore lint: very small image */}
            <img
              src={session.user.image ?? "fallback.png"}
              alt={session.user.name ?? "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
