"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Calendar, 
  Home, 
  Menu, 
  Activity,
  Settings,
  LogOut
} from "lucide-react"
import InitialAvatar from "@/components/initial-avatar"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface DoctorDashboardLayoutProps {
  children: React.ReactNode
}

export default function DoctorDashboardLayout({ children }: DoctorDashboardLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration errors by only rendering client components after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('doctorId')
    localStorage.removeItem('role')

    router.push('/')
  }

  if (!isMounted) {
    return null
  }

  const navigation = [
    { name: "Home", href: "/docs", icon: Home },
    { name: "Appointments", href: "/docs/appointments", icon: Calendar },
    { name: "Status", href: "/docs/status", icon: Activity },
    { name: "Settings", href: "/docs/settings", icon: Settings }
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Mobile sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden fixed top-3 sm:top-4 left-3 sm:left-4 z-40 h-8 w-8 sm:h-9 sm:w-9"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[75vw] max-w-75">
            <div className="flex h-full flex-col">
              <div className="p-3 sm:p-4 border-b">
                <Link href="/" className="flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base">
                  Eazydoc Doctor Portal
                </Link>
              </div>
              <nav className="flex-1 overflow-auto p-3 sm:p-4">
                <ul className="space-y-1 sm:space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 sm:gap-3 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${
                          pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-3 sm:p-4 border-t">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="border-b p-3 sm:p-4">
            <Link href="/" className="flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base">
              Eazydoc Doctor Portal
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <div className="p-3 sm:p-4 border-t mt-auto">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-6 md:px-8">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9">
                  <Link href="/">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Home</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <span className="relative flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full">
                    <InitialAvatar name="D" size={36} fontSize={16} />
                  </span>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}