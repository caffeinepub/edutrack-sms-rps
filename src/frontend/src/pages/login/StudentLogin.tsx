import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import LoginLayout from "./LoginLayout";

export default function StudentLogin() {
  const { actor } = useActor();
  const { login } = useAuth();
  const router = useRouter();
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setLoading(true);
    try {
      const studentId = await actor.loginStudent(
        admissionNumber.trim(),
        password.trim(),
      );
      if (studentId !== null && studentId !== undefined) {
        // Use getStudentSelf (update call) to avoid stale-read issues with query calls
        const student = await actor.getStudentSelf();
        const schoolId = student ? student.schoolId.toString() : null;
        login({
          role: "student",
          userId: studentId.toString(),
          schoolId,
          displayName: student?.fullName ?? admissionNumber.trim(),
        });
        router.navigate({ to: "/student/dashboard" });
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout
      title="Student Login"
      description="View your results and performance"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="admission">Admission Number</Label>
          <Input
            id="admission"
            placeholder="GFA/2025/001"
            required
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            data-ocid="student_login.admission_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-ocid="student_login.password_input"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          data-ocid="student_login.submit_button"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </LoginLayout>
  );
}
