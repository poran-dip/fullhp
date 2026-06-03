"use client";

import { Calendar, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentWithTests } from "@/services/lab-results";

interface Props {
  appointments: AppointmentWithTests[];
  error: string | null;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentWithTests;
}) {
  const pendingCount = appointment.tests.filter(
    (t) => t.result === null,
  ).length;

  return (
    <Collapsible>
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                {appointment.doctor?.name ?? "Unassigned Doctor"}
              </CardTitle>
              <CardDescription>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(appointment.time)}
                  {appointment.doctor?.specialization && (
                    <> &bull; {appointment.doctor.specialization}</>
                  )}
                  {appointment.department && (
                    <> &bull; {appointment.department}</>
                  )}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {appointment.tests.length} test
                {appointment.tests.length !== 1 ? "s" : ""}
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  View Details
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointment.tests.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.test}</TableCell>
                    <TableCell className="text-right">
                      {t.result ?? (
                        <span className="text-muted-foreground italic">
                          Pending
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function LabResultsList({ appointments, error }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
          <p className="text-muted-foreground">
            View your laboratory test results.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const query = searchQuery.toLowerCase();

  const matchesSearch = (a: AppointmentWithTests) =>
    !query ||
    a.tests.some((t) => t.test.toLowerCase().includes(query)) ||
    (a.doctor?.name ?? "").toLowerCase().includes(query) ||
    (a.department ?? "").toLowerCase().includes(query);

  const recent = appointments.filter(
    (a) => new Date(a.updatedAt) >= sevenDaysAgo && matchesSearch(a),
  );

  const pending = appointments.filter(
    (a) => a.tests.some((t) => t.result === null) && matchesSearch(a),
  );

  const all = appointments.filter(matchesSearch);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
        <p className="text-muted-foreground">
          View your laboratory test results.
        </p>
      </div>

      <div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tests or doctors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">
            Recent
            {recent.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {recent.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Results</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {recent.length === 0 ? (
            <EmptyState message="No test results updated in the last 7 days." />
          ) : (
            recent.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <EmptyState message="No pending test results." />
          ) : (
            pending.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {all.length === 0 ? (
            <EmptyState
              message={
                searchQuery
                  ? "No results match your search."
                  : "No lab results found."
              }
            />
          ) : (
            all.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
