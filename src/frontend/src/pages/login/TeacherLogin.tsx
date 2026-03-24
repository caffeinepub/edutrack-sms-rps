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

export default function TeacherLogin() {
  const { actor } = useActor();
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      const teacherId = await actor.loginTeacher(
        username.trim(),
        password.trim(),
      );
      if (teacherId !== null && teacherId !== undefined) {
        // Use getTeacherSelf (update call) to avoid stale-read issues with query calls
        const teacher = await actor.getTeacherSelf();
        const schoolId = teacher ? teacher.schoolId.toString() : null;
        login({
          role: "teacher",
          userId: teacherId.toString(),
          schoolId,
          displayName: teacher?.fullName ?? username.trim(),
        });
        router.navigate({ to: "/teacher/dashboard" });
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
      title="Teacher Login"
      description="Access your teaching portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="t.johnson"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            data-ocid="teacher_login.username_input"
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
            data-ocid="teacher_login.password_input"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          data-ocid="teacher_login.submit_button"
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
