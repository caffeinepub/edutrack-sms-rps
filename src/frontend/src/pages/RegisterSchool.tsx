import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function RegisterSchool() {
  const { actor } = useActor();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setLoading(true);
    try {
      await actor.registerSchool(
        form.name,
        form.email,
        form.phone,
        form.address,
        form.username,
        form.password,
      );
      toast.success("School registered! Awaiting approval.");
      router.navigate({ to: "/login/admin" });
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.42 0.14 264)" }}
            >
              <GraduationCap size={22} className="text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: "oklch(0.26 0.11 264)" }}
            >
              EduTrack
            </span>
          </div>
        </div>
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px]">Register Your School</CardTitle>
            <CardDescription>
              Create your school account on EduTrack SMS+RPS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="name">School Name</Label>
                  <Input
                    id="name"
                    placeholder="Greenfield Academy"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    data-ocid="register.school_name_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">School Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@school.edu"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    data-ocid="register.email_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+234 800 000 0000"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    data-ocid="register.phone_input"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="address">School Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Education Avenue, Lagos"
                    required
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    data-ocid="register.address_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="greenfield"
                    required
                    value={form.username}
                    onChange={(e) => update("username", e.target.value)}
                    data-ocid="register.username_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    data-ocid="register.password_input"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-ocid="register.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register School"
                )}
              </Button>
              <p className="text-center text-[12px] text-muted-foreground">
                Already registered?{" "}
                <Link
                  to="/login/admin"
                  className="text-primary hover:underline"
                >
                  Login as Admin
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-[12px] text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
          >
            <ArrowLeft size={12} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
