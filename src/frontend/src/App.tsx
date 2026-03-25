import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import RegisterSchool from "./pages/RegisterSchool";
import Assignments from "./pages/admin/Assignments";
import Branding from "./pages/admin/Branding";
import Classes from "./pages/admin/Classes";
import AdminDashboard from "./pages/admin/Dashboard";
import Sessions from "./pages/admin/Sessions";
import Students from "./pages/admin/Students";
import Subjects from "./pages/admin/Subjects";
import Teachers from "./pages/admin/Teachers";
import Terms from "./pages/admin/Terms";
import AdminLogin from "./pages/login/AdminLogin";
import StudentLogin from "./pages/login/StudentLogin";
import SuperAdminLogin from "./pages/login/SuperAdminLogin";
import TeacherLogin from "./pages/login/TeacherLogin";
import StudentDashboard from "./pages/student/Dashboard";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import ScoreEntry from "./pages/teacher/Scores";

function getAuth() {
  try {
    const raw = localStorage.getItem("edutrack_auth");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterSchool,
});
const superAdminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/superadmin",
  component: SuperAdminLogin,
});
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/admin",
  component: AdminLogin,
});
const teacherLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/teacher",
  component: TeacherLogin,
});
const studentLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/student",
  component: StudentLogin,
});

const superAdminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin/dashboard",
  component: SuperAdminDashboard,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "superAdmin")
      throw redirect({ to: "/login/superadmin" });
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboard,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminTeachersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/teachers",
  component: Teachers,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/students",
  component: Students,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminClassesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/classes",
  component: Classes,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminSubjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/subjects",
  component: Subjects,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminSessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/sessions",
  component: Sessions,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/terms",
  component: Terms,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminAssignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/assignments",
  component: Assignments,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const adminBrandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/branding",
  component: Branding,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "schoolAdmin")
      throw redirect({ to: "/login/admin" });
  },
});

const teacherDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher/dashboard",
  component: TeacherDashboard,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "teacher")
      throw redirect({ to: "/login/teacher" });
  },
});

const teacherScoresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher/scores",
  component: ScoreEntry,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "teacher")
      throw redirect({ to: "/login/teacher" });
  },
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/dashboard",
  component: StudentDashboard,
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth?.role || auth.role !== "student")
      throw redirect({ to: "/login/student" });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerRoute,
  superAdminLoginRoute,
  adminLoginRoute,
  teacherLoginRoute,
  studentLoginRoute,
  superAdminDashboardRoute,
  adminDashboardRoute,
  adminTeachersRoute,
  adminStudentsRoute,
  adminClassesRoute,
  adminSubjectsRoute,
  adminSessionsRoute,
  adminTermsRoute,
  adminAssignmentsRoute,
  adminBrandingRoute,
  teacherDashboardRoute,
  teacherScoresRoute,
  studentDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppInner() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
