import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import {
  useSearchClasses,
  useSearchStudents,
  useSearchSubjects,
} from "../../hooks/useQueries";

interface ScoreRow {
  studentId: string;
  studentName: string;
  ca1: string;
  ca2: string;
  exam: string;
}

function calcGrade(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

export default function ScoreEntry() {
  const { schoolId, userId } = useAuth();
  const { data: classes = [] } = useSearchClasses(schoolId ?? "");
  const { data: subjects = [] } = useSearchSubjects(schoolId ?? "");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const { data: students = [], isLoading: studentsLoading } = useSearchStudents(
    schoolId ?? "",
  );
  const { actor } = useActor();
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [saving, setSaving] = useState(false);

  const classStudents = students.filter(
    (s) => !selectedClass || s.classId.toString() === selectedClass,
  );

  const initRows = () => {
    setRows(
      classStudents.map((s) => ({
        studentId: s.id.toString(),
        studentName: s.fullName,
        ca1: "",
        ca2: "",
        exam: "",
      })),
    );
  };

  const updateRow = (
    studentId: string,
    field: "ca1" | "ca2" | "exam",
    value: string,
  ) => {
    setRows((p) =>
      p.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r)),
    );
  };

  const handleSaveAll = async () => {
    if (!actor || !userId || !selectedSubject || !sessionId || !termId) {
      toast.error(
        "Please fill in all required fields (subject, session ID, term ID)",
      );
      return;
    }
    setSaving(true);
    let saved = 0;
    for (const row of rows) {
      const ca1 = Number(row.ca1 || 0);
      const ca2 = Number(row.ca2 || 0);
      const exam = Number(row.exam || 0);
      if (ca1 > 20 || ca2 > 20 || exam > 60) {
        toast.error(`Invalid scores for ${row.studentName}`);
        continue;
      }
      try {
        await actor.enterScore(
          BigInt(row.studentId),
          BigInt(selectedSubject),
          BigInt(userId),
          BigInt(sessionId),
          BigInt(termId),
          BigInt(ca1),
          BigInt(ca2),
          BigInt(exam),
        );
        saved++;
      } catch {
        toast.error(`Failed to save score for ${row.studentName}`);
      }
    }
    setSaving(false);
    if (saved > 0) toast.success(`Saved scores for ${saved} student(s)`);
  };

  return (
    <Layout title="Score Entry">
      <div className="space-y-5">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">Select Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Class</Label>
                <Select
                  value={selectedClass}
                  onValueChange={(v) => {
                    setSelectedClass(v);
                    setRows([]);
                  }}
                >
                  <SelectTrigger
                    className="h-8 text-[12px]"
                    data-ocid="scores.class_select"
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.className} {c.arm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger
                    className="h-8 text-[12px]"
                    data-ocid="scores.subject_select"
                  >
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Session ID</Label>
                <Input
                  className="h-8 text-[12px]"
                  placeholder="e.g. 1"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  data-ocid="scores.session_input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Term ID</Label>
                <Input
                  className="h-8 text-[12px]"
                  placeholder="e.g. 1"
                  value={termId}
                  onChange={(e) => setTermId(e.target.value)}
                  data-ocid="scores.term_input"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 text-[12px]"
              onClick={initRows}
              disabled={!selectedClass}
              data-ocid="scores.load_students_button"
            >
              Load Students
            </Button>
          </CardContent>
        </Card>

        {rows.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px]">
                  Enter Scores (CA1 max 20 | CA2 max 20 | Exam max 60)
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="gap-1.5 text-[12px]"
                  data-ocid="scores.save_button"
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}{" "}
                  Save All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {studentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-24">CA1 (/20)</TableHead>
                      <TableHead className="w-24">CA2 (/20)</TableHead>
                      <TableHead className="w-24">Exam (/60)</TableHead>
                      <TableHead className="w-20">Total</TableHead>
                      <TableHead className="w-16">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => {
                      const total =
                        Number(row.ca1 || 0) +
                        Number(row.ca2 || 0) +
                        Number(row.exam || 0);
                      const grade = calcGrade(total);
                      return (
                        <TableRow
                          key={row.studentId}
                          data-ocid={`scores.item.${i + 1}`}
                        >
                          <TableCell className="text-[12px] font-medium">
                            {row.studentName}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              className="h-7 w-16 text-[12px]"
                              value={row.ca1}
                              onChange={(e) =>
                                updateRow(row.studentId, "ca1", e.target.value)
                              }
                              data-ocid={`scores.ca1_input.${i + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              className="h-7 w-16 text-[12px]"
                              value={row.ca2}
                              onChange={(e) =>
                                updateRow(row.studentId, "ca2", e.target.value)
                              }
                              data-ocid={`scores.ca2_input.${i + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={60}
                              className="h-7 w-16 text-[12px]"
                              value={row.exam}
                              onChange={(e) =>
                                updateRow(row.studentId, "exam", e.target.value)
                              }
                              data-ocid={`scores.exam_input.${i + 1}`}
                            />
                          </TableCell>
                          <TableCell className="text-[12px] font-semibold">
                            {total}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-[12px] font-bold ${grade === "A" ? "text-green-600" : grade === "F" ? "text-red-500" : "text-foreground"}`}
                            >
                              {grade}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
