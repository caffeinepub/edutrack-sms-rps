import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.11 264) 0%, oklch(0.42 0.14 264) 60%, oklch(0.54 0.20 264) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-white/90 text-[12px] font-semibold uppercase tracking-wider mb-6">
              <GraduationCap size={14} />
              School Management & Result Processing System
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              EduTrack SMS+RPS
            </h1>
            <p className="text-white/75 text-base max-w-xl mx-auto mb-10">
              A comprehensive digital platform for managing Nursery, Primary,
              and Secondary schools — teachers, students, classes, subjects,
              results, and more.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary font-bold hover:bg-white/90 gap-2 text-[14px]"
                data-ocid="landing.register_button"
              >
                Register Your School <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Login Cards */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center text-xl font-bold text-foreground mb-2">
          Choose Your Login
        </h2>
        <p className="text-center text-muted-foreground text-[13px] mb-8">
          Select your role to continue to your portal
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              role: "Super Admin",
              to: "/login/superadmin",
              icon: <Shield size={28} />,
              desc: "Platform management & oversight",
              ocid: "landing.superadmin_button",
            },
            {
              role: "School Admin",
              to: "/login/admin",
              icon: <GraduationCap size={28} />,
              desc: "Manage your school operations",
              ocid: "landing.admin_button",
            },
            {
              role: "Teacher",
              to: "/login/teacher",
              icon: <Users size={28} />,
              desc: "Enter & manage student scores",
              ocid: "landing.teacher_button",
            },
            {
              role: "Student",
              to: "/login/student",
              icon: <UserCheck size={28} />,
              desc: "View results & report cards",
              ocid: "landing.student_button",
            },
          ].map((item, i) => (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={item.to}>
                <Card
                  className="hover:shadow-card hover:border-primary/30 transition-all cursor-pointer h-full"
                  data-ocid={item.ocid}
                >
                  <CardContent className="p-5 text-center">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "oklch(0.95 0.02 264)" }}
                    >
                      <span style={{ color: "oklch(0.42 0.14 264)" }}>
                        {item.icon}
                      </span>
                    </div>
                    <h3 className="font-bold text-[14px] text-foreground mb-1">
                      {item.role}
                    </h3>
                    <p className="text-muted-foreground text-[11px]">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-card border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen size={20} />,
                title: "Multi-Level Support",
                desc: "Nursery, Primary, Junior & Senior Secondary",
              },
              {
                icon: <Users size={20} />,
                title: "Role-Based Access",
                desc: "Secure portals for admins, teachers, and students",
              },
              {
                icon: <GraduationCap size={20} />,
                title: "Automatic Results",
                desc: "Auto-grading, ranking, and report generation",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                  style={{ color: "oklch(0.54 0.20 264)" }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[13px] text-foreground">
                    {f.title}
                  </h4>
                  <p className="text-muted-foreground text-[12px] mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-[12px] text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
