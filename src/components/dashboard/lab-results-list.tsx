"use client";

import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export default function LabResultsList() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for lab results
  const labResults = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      date: "April 28, 2024",
      status: "normal",
      doctor: "Dr. Emily Rodriguez",
      category: "Hematology",
      results: [
        {
          name: "White Blood Cell (WBC)",
          value: "7.5",
          unit: "10^3/uL",
          range: "4.5-11.0",
          status: "normal",
        },
        {
          name: "Red Blood Cell (RBC)",
          value: "4.8",
          unit: "10^6/uL",
          range: "4.5-5.9",
          status: "normal",
        },
        {
          name: "Hemoglobin (Hgb)",
          value: "14.2",
          unit: "g/dL",
          range: "13.5-17.5",
          status: "normal",
        },
        {
          name: "Hematocrit (Hct)",
          value: "42",
          unit: "%",
          range: "41-50",
          status: "normal",
        },
        {
          name: "Platelet Count",
          value: "250",
          unit: "10^3/uL",
          range: "150-450",
          status: "normal",
        },
      ],
    },
    {
      id: 2,
      name: "Lipid Panel",
      date: "April 28, 2024",
      status: "abnormal",
      doctor: "Dr. Emily Rodriguez",
      category: "Chemistry",
      results: [
        {
          name: "Total Cholesterol",
          value: "220",
          unit: "mg/dL",
          range: "<200",
          status: "abnormal",
        },
        {
          name: "HDL Cholesterol",
          value: "45",
          unit: "mg/dL",
          range: ">40",
          status: "normal",
        },
        {
          name: "LDL Cholesterol",
          value: "145",
          unit: "mg/dL",
          range: "<100",
          status: "abnormal",
        },
        {
          name: "Triglycerides",
          value: "150",
          unit: "mg/dL",
          range: "<150",
          status: "normal",
        },
      ],
    },
    {
      id: 3,
      name: "Comprehensive Metabolic Panel",
      date: "March 15, 2024",
      status: "normal",
      doctor: "Dr. James Wilson",
      category: "Chemistry",
      results: [
        {
          name: "Glucose",
          value: "95",
          unit: "mg/dL",
          range: "70-99",
          status: "normal",
        },
        {
          name: "Sodium",
          value: "140",
          unit: "mmol/L",
          range: "136-145",
          status: "normal",
        },
        {
          name: "Potassium",
          value: "4.0",
          unit: "mmol/L",
          range: "3.5-5.0",
          status: "normal",
        },
        {
          name: "Chloride",
          value: "102",
          unit: "mmol/L",
          range: "98-107",
          status: "normal",
        },
        {
          name: "Carbon Dioxide",
          value: "24",
          unit: "mmol/L",
          range: "23-29",
          status: "normal",
        },
        {
          name: "BUN",
          value: "15",
          unit: "mg/dL",
          range: "7-20",
          status: "normal",
        },
        {
          name: "Creatinine",
          value: "0.9",
          unit: "mg/dL",
          range: "0.6-1.2",
          status: "normal",
        },
        {
          name: "Calcium",
          value: "9.5",
          unit: "mg/dL",
          range: "8.5-10.2",
          status: "normal",
        },
      ],
    },
    {
      id: 4,
      name: "Thyroid Function Panel",
      date: "February 10, 2024",
      status: "abnormal",
      doctor: "Dr. Sarah Johnson",
      category: "Endocrinology",
      results: [
        {
          name: "TSH",
          value: "5.5",
          unit: "mIU/L",
          range: "0.4-4.0",
          status: "abnormal",
        },
        {
          name: "Free T4",
          value: "1.0",
          unit: "ng/dL",
          range: "0.8-1.8",
          status: "normal",
        },
        {
          name: "Free T3",
          value: "3.0",
          unit: "pg/mL",
          range: "2.3-4.2",
          status: "normal",
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-500">Normal</Badge>;
      case "abnormal":
        return <Badge variant="destructive">Abnormal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getValueStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "abnormal":
        return "text-red-600 font-medium";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
        <p className="text-muted-foreground">
          View and manage your laboratory test results.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button variant="outline">
            All Categories
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="relative w-full sm:w-75">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lab results..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="abnormal">Abnormal Results</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {labResults.map((result) => (
            <Collapsible key={result.id}>
              <Card>
                <CardHeader className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {result.date} • Ordered by {result.doctor}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <Badge variant="outline">{result.category}</Badge>
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
                          <TableHead className="text-right">Units</TableHead>
                          <TableHead className="text-right">
                            Reference Range
                          </TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.results.map((item) => (
                          <TableRow key={item.name}>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell
                              className={`text-right ${getValueStatusColor(item.status)}`}
                            >
                              {item.value}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.range}
                            </TableCell>
                            <TableCell className="text-right">
                              {getStatusBadge(item.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View Full Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </CardFooter>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </TabsContent>
        <TabsContent value="abnormal" className="space-y-4">
          {labResults
            .filter((result) => result.status === "abnormal")
            .map((result) => (
              <Collapsible key={result.id}>
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                        <CardDescription>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {result.date} • Ordered by {result.doctor}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        <Badge variant="outline">{result.category}</Badge>
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
                            <TableHead className="text-right">Units</TableHead>
                            <TableHead className="text-right">
                              Reference Range
                            </TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.results.map((item) => (
                            <TableRow key={item.name}>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell
                                className={`text-right ${getValueStatusColor(item.status)}`}
                              >
                                {item.value}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.range}
                              </TableCell>
                              <TableCell className="text-right">
                                {getStatusBadge(item.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Full Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </CardFooter>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
