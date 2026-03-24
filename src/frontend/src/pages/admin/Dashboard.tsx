import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock,
  PlusCircle,
  School,
  UserPlus,
  Users,
} from "lucide-react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  useSearchClasses,
  useSearchStudents,
  useSearchSubjects,
  useSearchTeachers,
} from "../../hooks/useQueries";

export default function AdminDashboard() {
  const { schoolId, displayName } = useAuth();
  const router = useRouter();
  const { data: teachers = [] } = useSearchTeachers(schoolId ?? "");
  const { data: students = [] } = useSearchStudents(schoolId ?? "");
  const { data: classes = [] } = useSearchClasses(schoolId ?? "");
  const { data: subjects = [] } = useSearchSubjects(schoolId ?? "");

  const kpis = [
    {
      label: "Students",
      value: students.length,
      icon: <School size={20} />,
      color: "oklch(0.54 0.20 264)",
      to: "/admin/students",
    },
    {
      label: "Teachers",
      value: teachers.length,
      icon: <Users size={20} />,
      color: "oklch(0.73 0.18 142)",
      to: "/admin/teachers",
    },
    {
      label: "Classes",
      value: classes.length,
      icon: <BookOpen size={20} />,
      color: "oklch(0.70 0.17 40)",
      to: "/admin/classes",
    },
    {
      label: "Subjects",
      value: subjects.length,
      icon: <ClipboardList size={20} />,
      color: "oklch(0.62 0.18 310)",
      to: "/admin/subjects",
    },
  ];

  const quickActions = [
    {
      label: "Add Student",
      icon: <UserPlus size={16} />,
      to: "/admin/students",
    },
    { label: "Add Teacher", icon: <Users size={16} />, to: "/admin/teachers" },
    {
      label: "Create Class",
      icon: <PlusCircle size={16} />,
      to: "/admin/classes",
    },
    {
      label: "Create Subject",
      icon: <BookOpen size={16} />,
      to: "/admin/subjects",
    },
    {
      label: "Manage Sessions",
      icon: <CalendarDays size={16} />,
      to: "/admin/sessions",
    },
    { label: "Manage Terms", icon: <Clock size={16} />, to: "/admin/terms" },
  ];

  return (
    <Layout title={`Welcome, ${displayName ?? "Admin"}`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className="shadow-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.navigate({ to: kpi.to })}
              data-ocid={`admin_dashboard.${kpi.label.toLowerCase()}_card`}
            >
              <CardContent className="p-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${kpi.color}20`, color: kpi.color }}
                >
                  {kpi.icon}
                </div>
                <p className="text-[26px] font-extrabold text-foreground leading-none">
                  {kpi.value}
                </p>
                <p className="text-muted-foreground text-[12px] mt-1">
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-[14px] font-semibold text-foreground mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="flex-col h-auto py-4 gap-2 text-[12px] font-medium hover:border-primary/40 hover:bg-primary/5"
                onClick={() => router.navigate({ to: action.to })}
                data-ocid={`admin_dashboard.${action.label.replace(/\s/g, "_").toLowerCase()}_button`}
              >
                <span style={{ color: "oklch(0.54 0.20 264)" }}>
                  {action.icon}
                </span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
