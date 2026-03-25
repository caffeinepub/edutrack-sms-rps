import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Link2,
  LogOut,
  Palette,
  School,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";

interface SchoolBrandingLocal {
  motto: string;
  websiteUrl: string;
  logoBase64: string;
  stampBase64: string;
  signatureBase64: string;
}

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

function getNavItems(role: string): NavItem[] {
  if (role === "superAdmin")
    return [
      {
        label: "Dashboard",
        to: "/superadmin/dashboard",
        icon: <LayoutDashboard size={16} />,
      },
    ];
  if (role === "schoolAdmin")
    return [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: <LayoutDashboard size={16} />,
      },
      { label: "Teachers", to: "/admin/teachers", icon: <Users size={16} /> },
      { label: "Students", to: "/admin/students", icon: <School size={16} /> },
      { label: "Classes", to: "/admin/classes", icon: <BookOpen size={16} /> },
      {
        label: "Subjects",
        to: "/admin/subjects",
        icon: <ClipboardList size={16} />,
      },
      {
        label: "Assignments",
        to: "/admin/assignments",
        icon: <Link2 size={16} />,
      },
      {
        label: "Sessions",
        to: "/admin/sessions",
        icon: <CalendarDays size={16} />,
      },
      { label: "Terms", to: "/admin/terms", icon: <Clock size={16} /> },
      {
        label: "Branding",
        to: "/admin/branding",
        icon: <Palette size={16} />,
      },
    ];
  if (role === "teacher")
    return [
      {
        label: "Dashboard",
        to: "/teacher/dashboard",
        icon: <LayoutDashboard size={16} />,
      },
      {
        label: "Score Entry",
        to: "/teacher/scores",
        icon: <ClipboardList size={16} />,
      },
    ];
  if (role === "student")
    return [
      {
        label: "Dashboard",
        to: "/student/dashboard",
        icon: <LayoutDashboard size={16} />,
      },
    ];
  return [];
}

function getRoleLabel(role: string): string {
  if (role === "superAdmin") return "Super Admin";
  if (role === "schoolAdmin") return "School Admin";
  if (role === "teacher") return "Teacher";
  if (role === "student") return "Student";
  return "";
}

export default function Layout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { role, displayName, logout, schoolId } = useAuth();
  const { actor } = useActor();
  const router = useRouter();
  const navItems = getNavItems(role ?? "");
  const pathname = router.state.location.pathname;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const [branding, setBranding] = useState<SchoolBrandingLocal | null>(null);

  const showBranding =
    role === "schoolAdmin" || role === "teacher" || role === "student";

  useEffect(() => {
    if (!actor || !schoolId || !showBranding) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any)
      .getSchoolBranding(BigInt(schoolId))
      .then((result: any) => {
        if (result) setBranding(result);
      })
      .catch(() => {});
  }, [actor, schoolId, showBranding]);

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col shadow-sidebar"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.26 0.11 264) 0%, oklch(0.42 0.14 264) 100%)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {showBranding && branding?.logoBase64 ? (
              <img
                src={`data:image/*;base64,${branding.logoBase64}`}
                alt="School Logo"
                className="w-9 h-9 object-contain"
              />
            ) : (
              <GraduationCap size={20} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-white font-bold text-base leading-tight block truncate">
              {showBranding && displayName ? displayName : "EduTrack"}
            </span>
            {showBranding && branding?.motto ? (
              <p
                className="text-white/60 text-[10px] italic leading-tight mt-0.5"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {branding.motto}
              </p>
            ) : (
              <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                SMS + RPS
              </p>
            )}
          </div>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
            <ChevronRight size={10} />
            {getRoleLabel(role ?? "")}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5" data-ocid="nav.section">
          {navItems.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                  active
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
                data-ocid="nav.link"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <Avatar className="w-8 h-8 bg-white/20">
              <AvatarFallback className="text-white text-xs font-bold bg-white/20">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12px] font-semibold truncate">
                {displayName ?? "User"}
              </p>
              <p className="text-white/50 text-[10px]">
                {getRoleLabel(role ?? "")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full mt-1 text-white/70 hover:text-white hover:bg-white/10 justify-start gap-2 text-[12px]"
            data-ocid="nav.logout_button"
          >
            <LogOut size={14} /> Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1">
            <h1 className="text-[15px] font-bold text-foreground">{title}</h1>
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              data-ocid="nav.bell_button"
            >
              <Bell size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              data-ocid="nav.settings_button"
            >
              <Settings size={16} />
            </Button>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
