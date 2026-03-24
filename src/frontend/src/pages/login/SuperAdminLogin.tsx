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

export default function SuperAdminLogin() {
  const { actor } = useActor();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
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
      const ok = await actor.loginSuperAdmin(email.trim(), password.trim());
      if (ok) {
        login({
          role: "superAdmin",
          userId: "0",
          schoolId: null,
          displayName: "Super Admin",
        });
        router.navigate({ to: "/superadmin/dashboard" });
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
      title="Super Admin Login"
      description="Platform management portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@platform.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-ocid="superadmin_login.email_input"
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
            data-ocid="superadmin_login.password_input"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          data-ocid="superadmin_login.submit_button"
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
