import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, CheckCircle, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Session } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

export default function Sessions() {
  const { schoolId } = useAuth();
  const { actor } = useActor();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !schoolId || !newName.trim()) return;
    setSaving(true);
    try {
      const id = await actor.addSession(BigInt(schoolId), newName.trim());
      setSessions((p) => [
        ...p,
        {
          id,
          name: newName.trim(),
          isActive: false,
          schoolId: BigInt(schoolId),
        },
      ]);
      setNewName("");
      toast.success("Session created");
    } catch {
      toast.error("Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (sessionId: bigint) => {
    if (!actor) return;
    setActivating(sessionId.toString());
    try {
      await actor.activateSession(sessionId);
      setSessions((p) =>
        p.map((s) => ({ ...s, isActive: s.id === sessionId })),
      );
      toast.success("Session activated. Student scores have been reset.");
    } catch {
      toast.error("Failed to activate session");
    } finally {
      setActivating(null);
    }
  };

  return (
    <Layout title="Sessions">
      <div className="space-y-5">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Create New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label>Session Name</Label>
                <Input
                  placeholder="2025/2026"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-ocid="sessions.name_input"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="gap-1.5"
                data-ocid="sessions.submit_button"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}{" "}
                Create
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">All Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sessions.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="sessions.empty_state"
              >
                <CalendarDays size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-[13px]">No sessions created yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((session, i) => (
                  <div
                    key={session.id.toString()}
                    className="flex items-center justify-between px-5 py-3"
                    data-ocid={`sessions.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="font-medium text-[13px]">
                        {session.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isActive ? (
                        <Badge className="bg-success/10 text-success border-0 gap-1 text-[11px]">
                          <CheckCircle size={10} /> Active
                        </Badge>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[12px] h-7"
                              data-ocid={`sessions.activate_button.${i + 1}`}
                            >
                              Activate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="sessions.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Activate Session "{session.name}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Activating this session will{" "}
                                <strong>reset all student scores</strong> in
                                your school. This action cannot be undone.
                                Teacher and subject assignments will remain.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="sessions.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleActivate(session.id)}
                                disabled={activating === session.id.toString()}
                                data-ocid="sessions.confirm_button"
                              >
                                {activating === session.id.toString() ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin mr-1"
                                  />
                                ) : null}{" "}
                                Yes, Activate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
