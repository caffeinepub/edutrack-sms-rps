import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraduationCap, Loader2 } from "lucide-react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useSearchSubjects, useStudentScores } from "../../hooks/useQueries";

function calcGrade(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600",
  B: "text-blue-600",
  C: "text-amber-600",
  D: "text-orange-500",
  E: "text-orange-600",
  F: "text-red-600",
};

export default function StudentDashboard() {
  const { userId, schoolId, displayName } = useAuth();
  const { data: scores = [], isLoading } = useStudentScores(userId);
  const { data: subjects = [] } = useSearchSubjects(schoolId ?? "");

  const subjectMap = new Map(subjects.map((s) => [s.id.toString(), s.name]));

  const totalScore = scores.reduce((sum, s) => sum + Number(s.total), 0);
  const avgScore = scores.length
    ? (totalScore / scores.length).toFixed(1)
    : "0.0";

  return (
    <Layout title={`My Results — ${displayName ?? "Student"}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Subjects",
              value: scores.length,
              color: "oklch(0.54 0.20 264)",
            },
            {
              label: "Total Score",
              value: totalScore,
              color: "oklch(0.73 0.18 142)",
            },
            {
              label: "Average Score",
              value: `${avgScore}%`,
              color: "oklch(0.70 0.17 40)",
            },
          ].map((kpi) => (
            <Card key={kpi.label} className="shadow-card">
              <CardContent className="p-5">
                <p
                  className="text-[24px] font-extrabold text-foreground leading-none"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </p>
                <p className="text-muted-foreground text-[12px] mt-1">
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <GraduationCap
                size={16}
                style={{ color: "oklch(0.54 0.20 264)" }}
              />{" "}
              Result Sheet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="flex justify-center py-10"
                data-ocid="student_results.loading_state"
              >
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : scores.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="student_results.empty_state"
              >
                <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-[13px]">No results available yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">CA1 (/20)</TableHead>
                    <TableHead className="text-center">CA2 (/20)</TableHead>
                    <TableHead className="text-center">Exam (/60)</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((score, i) => {
                    const total = Number(score.total);
                    const grade = score.grade || calcGrade(total);
                    return (
                      <TableRow
                        key={score.id.toString()}
                        data-ocid={`student_results.item.${i + 1}`}
                      >
                        <TableCell className="font-medium text-[13px]">
                          {subjectMap.get(score.subjectId.toString()) ??
                            "Subject"}
                        </TableCell>
                        <TableCell className="text-center text-[12px]">
                          {Number(score.ca1)}
                        </TableCell>
                        <TableCell className="text-center text-[12px]">
                          {Number(score.ca2)}
                        </TableCell>
                        <TableCell className="text-center text-[12px]">
                          {Number(score.exam)}
                        </TableCell>
                        <TableCell className="text-center text-[12px] font-semibold">
                          {total}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-bold border-0 ${GRADE_COLORS[grade] ?? ""}`}
                          >
                            {grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Grading key */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Grading Scale
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { g: "A", r: "70–100" },
                { g: "B", r: "60–69" },
                { g: "C", r: "50–59" },
                { g: "D", r: "45–49" },
                { g: "E", r: "40–44" },
                { g: "F", r: "0–39" },
              ].map((item) => (
                <div key={item.g} className="flex items-center gap-1.5">
                  <span
                    className={`text-[12px] font-bold ${GRADE_COLORS[item.g] ?? ""}`}
                  >
                    {item.g}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    = {item.r}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
