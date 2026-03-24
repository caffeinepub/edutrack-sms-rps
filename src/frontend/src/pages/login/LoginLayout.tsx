import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

export default function LoginLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "oklch(0.97 0.01 240)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.26 0.11 264), oklch(0.42 0.14 264))",
              }}
            >
              <GraduationCap size={20} className="text-white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ color: "oklch(0.26 0.11 264)" }}
            >
              EduTrack
            </span>
          </Link>
        </div>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[17px]">{title}</CardTitle>
            <CardDescription className="text-[12px]">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-[12px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft size={11} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
