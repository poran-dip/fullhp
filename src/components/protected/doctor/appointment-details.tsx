"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/lib/api";

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
}

interface Test {
  id: string;
  test: string;
  result: string | null;
}

interface PastAppointment {
  id: string;
  time: string;
  status: string;
  condition: string | null;
  department: string | null;
  doctorComments: string | null;
}

interface Patient {
  id: string;
  name: string | null;
  image: string | null;
  gender: string | null;
  dob: string | null;
  pastAppointments: PastAppointment[];
}

interface AppointmentDetail {
  id: string;
  time: string;
  status: string;
  condition: string | null;
  department: string | null;
  doctorComments: string | null;
  patient: Patient;
  prescriptions: Prescription[];
  tests: Test[];
}

interface DoctorAppointmentDetailProps {
  data: AppointmentDetail | null;
  error: string | null;
}

export default function DoctorAppointmentDetail({
  data,
  error,
}: DoctorAppointmentDetailProps) {
  const router = useRouter();
  const { apiFetch } = useApi();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    data?.prescriptions ?? [],
  );
  const [tests, setTests] = useState<Test[]>(data?.tests ?? []);
  const [doctorComments, setDoctorComments] = useState(
    data?.doctorComments ?? "",
  );
  const [newPrescription, setNewPrescription] = useState({
    medicine: "",
    dosage: "",
  });
  const [newTest, setNewTest] = useState({ test: "", result: "" });
  const [savingComments, setSavingComments] = useState(false);
  const [addingPrescription, setAddingPrescription] = useState(false);
  const [addingTest, setAddingTest] = useState(false);

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error ?? "Appointment not found"}</p>
      </div>
    );
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const formatAge = (dob: string | null) => {
    if (!dob) return null;
    const age = Math.floor(
      (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    return age;
  };

  const patch = async (body: Record<string, unknown>) => {
    const res = await apiFetch(`/api/appointments/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  const handleSaveComments = async () => {
    setSavingComments(true);
    try {
      await patch({ doctorComments });
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingComments(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.medicine.trim() || !newPrescription.dosage.trim())
      return;
    setAddingPrescription(true);
    try {
      const res = await apiFetch(`/api/appointments/${data.id}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrescription),
      });
      if (!res.ok) throw new Error();
      const created: Prescription = await res.json();
      setPrescriptions((prev) => [...prev, created]);
      setNewPrescription({ medicine: "", dosage: "" });
      toast.success("Prescription added");
    } catch {
      toast.error("Failed to add prescription");
    } finally {
      setAddingPrescription(false);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    try {
      const res = await apiFetch(
        `/api/appointments/${data.id}/prescriptions/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error();
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prescription removed");
    } catch {
      toast.error("Failed to remove prescription");
    }
  };

  const handleAddTest = async () => {
    if (!newTest.test.trim()) return;
    setAddingTest(true);
    try {
      const res = await apiFetch(`/api/appointments/${data.id}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: newTest.test,
          result: newTest.result || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created: Test = await res.json();
      setTests((prev) => [...prev, created]);
      setNewTest({ test: "", result: "" });
      toast.success("Test added");
    } catch {
      toast.error("Failed to add test");
    } finally {
      setAddingTest(false);
    }
  };

  const handleUpdateTestResult = async (id: string, result: string) => {
    try {
      const res = await apiFetch(`/api/appointments/${data.id}/tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      if (!res.ok) throw new Error();
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, result } : t)));
      toast.success("Result updated");
    } catch {
      toast.error("Failed to update result");
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      const res = await apiFetch(`/api/appointments/${data.id}/tests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setTests((prev) => prev.filter((t) => t.id !== id));
      toast.success("Test removed");
    } catch {
      toast.error("Failed to remove test");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {data.patient.name ?? "Unknown Patient"}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {formatDateTime(data.time)}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="info">Patient Info</TabsTrigger>
          <TabsTrigger value="medical">Medical Records</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Patient Info */}
        <TabsContent value="info" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-slate-700 mb-3">
                Personal Details
              </h4>
              <p>
                <span className="text-slate-500 text-sm">Name</span>
                <br />
                <span className="font-medium">
                  {data.patient.name ?? "N/A"}
                </span>
              </p>
              <p>
                <span className="text-slate-500 text-sm">Age</span>
                <br />
                <span className="font-medium">
                  {formatAge(data.patient.dob) ?? "N/A"}
                </span>
              </p>
              <p>
                <span className="text-slate-500 text-sm">Gender</span>
                <br />
                <span className="font-medium">
                  {data.patient.gender ?? "N/A"}
                </span>
              </p>
            </Card>

            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-slate-700 mb-3">
                Appointment Details
              </h4>
              <p>
                <span className="text-slate-500 text-sm">Status</span>
                <br />
                <span className="font-medium">{data.status}</span>
              </p>
              <p>
                <span className="text-slate-500 text-sm">Department</span>
                <br />
                <span className="font-medium">{data.department ?? "N/A"}</span>
              </p>
              <p>
                <span className="text-slate-500 text-sm">Condition</span>
                <br />
                <span className="font-medium">{data.condition ?? "N/A"}</span>
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Records */}
        <TabsContent value="medical" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prescriptions */}
            <Card className="p-4">
              <h4 className="font-semibold text-slate-700 mb-3">
                Prescriptions
              </h4>
              <div className="space-y-2 mb-4">
                {prescriptions.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">
                    No prescriptions yet
                  </p>
                ) : (
                  prescriptions.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start justify-between border rounded-md p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{p.medicine}</p>
                        <p className="text-slate-500 text-xs">{p.dosage}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePrescription(p.id)}
                        className="text-red-400 hover:text-red-600 text-xs ml-2 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Add Prescription
                </p>
                <Input
                  placeholder="Medicine name"
                  value={newPrescription.medicine}
                  onChange={(e) =>
                    setNewPrescription((prev) => ({
                      ...prev,
                      medicine: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Dosage (e.g. 500mg twice daily)"
                  value={newPrescription.dosage}
                  onChange={(e) =>
                    setNewPrescription((prev) => ({
                      ...prev,
                      dosage: e.target.value,
                    }))
                  }
                />
                <Button
                  size="sm"
                  className="w-full"
                  disabled={addingPrescription}
                  onClick={handleAddPrescription}
                >
                  {addingPrescription ? "Adding..." : "+ Add"}
                </Button>
              </div>
            </Card>

            {/* Tests */}
            <Card className="p-4">
              <h4 className="font-semibold text-slate-700 mb-3">Tests</h4>
              <div className="space-y-2 mb-4">
                {tests.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">No tests yet</p>
                ) : (
                  tests.map((t) => (
                    <div key={t.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm">{t.test}</p>
                        <button
                          type="button"
                          onClick={() => handleDeleteTest(t.id)}
                          className="text-red-400 hover:text-red-600 text-xs ml-2 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Result (optional)"
                          value={t.result ?? ""}
                          onChange={(e) =>
                            setTests((prev) =>
                              prev.map((x) =>
                                x.id === t.id
                                  ? { ...x, result: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateTestResult(t.id, t.result ?? "")
                          }
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Add Test
                </p>
                <Input
                  placeholder="Test name"
                  value={newTest.test}
                  onChange={(e) =>
                    setNewTest((prev) => ({ ...prev, test: e.target.value }))
                  }
                />
                <Input
                  placeholder="Result (optional)"
                  value={newTest.result}
                  onChange={(e) =>
                    setNewTest((prev) => ({ ...prev, result: e.target.value }))
                  }
                />
                <Button
                  size="sm"
                  className="w-full"
                  disabled={addingTest}
                  onClick={handleAddTest}
                >
                  {addingTest ? "Adding..." : "+ Add"}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="pt-4">
          <h4 className="font-semibold text-slate-700 mb-3">
            Previous Appointments with This Doctor
          </h4>
          {data.patient.pastAppointments.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-slate-500">No previous appointments</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.patient.pastAppointments.map((a) => (
                <Card key={a.id} className="p-4 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-blue-600">
                        {formatDateTime(a.time)}
                      </p>
                      <p className="text-slate-600 text-sm mt-0.5">
                        {a.condition ?? a.department ?? "General"}
                      </p>
                      {a.doctorComments && (
                        <p className="text-slate-400 text-xs mt-1 italic">
                          {a.doctorComments}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{a.status}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="pt-4">
          <Card className="p-4 space-y-4">
            <h4 className="font-semibold text-slate-700">Notes</h4>
            <Textarea
              placeholder="Add notes about this appointment..."
              className="min-h-40"
              value={doctorComments}
              onChange={(e) => setDoctorComments(e.target.value)}
            />
            <Button
              disabled={savingComments}
              onClick={handleSaveComments}
              className="w-full"
            >
              {savingComments ? "Saving..." : "Save Notes"}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
