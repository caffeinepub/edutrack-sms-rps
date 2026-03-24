import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BookOpen, ClipboardList, Loader2 } from "lucide-react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useSearchClasses, useSearchSubjects } from "../../hooks/useQueries";

export default function TeacherDashboard() {
  const { schoolId, displayName } = useAuth();
  const { data: classes = [], isLoading: classesLoading } = useSearchClasses(
    schoolId ?? "",
  );
  const { data: subjects = [], isLoading: subjectsLoading } = useSearchSubjects(
    schoolId ?? "",
  );

  return (
    <Layout title={`Hello, ${displayName ?? "Teacher"}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] flex items-center gap-2">
                <BookOpen size={15} style={{ color: "oklch(0.54 0.20 264)" }} />{" "}
                Assigned Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div
                  className="flex justify-center py-4"
                  data-ocid="teacher_dashboard.classes_loading_state"
                >
                  <Loader2 className="animate-spin text-primary" size={18} />
                </div>
              ) : classes.length === 0 ? (
                <p
                  className="text-muted-foreground text-[12px] py-4"
                  data-ocid="teacher_dashboard.classes_empty_state"
                >
                  No classes assigned
                </p>
              ) : (
                <div
                  className="space-y-1.5"
                  data-ocid="teacher_dashboard.classes_list"
                >
                  {classes.map((c, i) => (
                    <div
                      key={c.id.toString()}
                      className="flex items-center gap-2"
                      data-ocid={`teacher_dashboard.class.item.${i + 1}`}
                    >
                      <Badge variant="outline" className="text-[11px]">
                        {c.classLevel}
                      </Badge>
                      <span className="text-[12px] font-medium">
                        {c.className} {c.arm}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] flex items-center gap-2">
                <ClipboardList
                  size={15}
                  style={{ color: "oklch(0.73 0.18 142)" }}
                />{" "}
                Assigned Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectsLoading ? (
                <div
                  className="flex justify-center py-4"
                  data-ocid="teacher_dashboard.subjects_loading_state"
                >
                  <Loader2 className="animate-spin text-primary" size={18} />
                </div>
              ) : subjects.length === 0 ? (
                <p
                  className="text-muted-foreground text-[12px] py-4"
                  data-ocid="teacher_dashboard.subjects_empty_state"
                >
                  No subjects assigned
                </p>
              ) : (
                <div
                  className="space-y-1.5"
                  data-ocid="teacher_dashboard.subjects_list"
                >
                  {subjects.map((s, i) => (
                    <div
                      key={s.id.toString()}
                      className="flex items-center gap-2"
                      data-ocid={`teacher_dashboard.subject.item.${i + 1}`}
                    >
                      <span className="text-[12px] font-medium">{s.name}</span>
                      {s.code && (
                        <span className="text-muted-foreground text-[11px] font-mono">
                          {s.code}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex">
          <Link to="/teacher/scores">
            <Button
              className="gap-2"
              data-ocid="teacher_dashboard.score_entry_button"
            >
              <ClipboardList size={15} /> Go to Score Entry
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
