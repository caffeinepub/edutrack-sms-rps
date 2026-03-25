import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import LoginLayout from "./LoginLayout";

export default function AdminLogin() {
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
      const schoolId = await actor.loginSchoolAdmin(username, password);
      if (schoolId !== null) {
        const school = await actor.getSchoolSelf();
        login({
          role: "schoolAdmin",
          userId: schoolId.toString(),
          schoolId: schoolId.toString(),
          displayName: school?.name ?? username,
        });
        router.navigate({ to: "/admin/dashboard" });
      } else {
        toast.error("Invalid credentials or school not approved");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout
      title="School Admin Login"
      description="Manage your school on EduTrack"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="school_admin"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            data-ocid="admin_login.username_input"
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
            data-ocid="admin_login.password_input"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          data-ocid="admin_login.submit_button"
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
        <p className="text-center text-[12px] text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register School
          </Link>
        </p>
      </form>
    </LoginLayout>
  );
}
