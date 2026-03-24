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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Term } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

const TERM_NAMES = ["First Term", "Second Term", "Third Term"];

export default function Terms() {
  const { schoolId } = useAuth();
  const { actor } = useActor();
  const [terms, setTerms] = useState<Term[]>([]);
  const [newName, setNewName] = useState("First Term");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !schoolId) return;
    setSaving(true);
    try {
      const id = await actor.addTerm(BigInt(schoolId), newName);
      setTerms((p) => [
        ...p,
        { id, name: newName, isActive: false, schoolId: BigInt(schoolId) },
      ]);
      toast.success("Term created");
    } catch {
      toast.error("Failed to create term");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (termId: bigint) => {
    if (!actor) return;
    setActivating(termId.toString());
    try {
      await actor.activateTerm(termId);
      setTerms((p) => p.map((t) => ({ ...t, isActive: t.id === termId })));
      toast.success("Term activated. Student scores have been reset.");
    } catch {
      toast.error("Failed to activate term");
    } finally {
      setActivating(null);
    }
  };

  return (
    <Layout title="Terms">
      <div className="space-y-5">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Create New Term</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label>Term Name</Label>
                <Select value={newName} onValueChange={setNewName}>
                  <SelectTrigger data-ocid="terms.name_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERM_NAMES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="gap-1.5"
                data-ocid="terms.submit_button"
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
            <CardTitle className="text-[15px]">All Terms</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {terms.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="terms.empty_state"
              >
                <Clock size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-[13px]">No terms created yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {terms.map((term, i) => (
                  <div
                    key={term.id.toString()}
                    className="flex items-center justify-between px-5 py-3"
                    data-ocid={`terms.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="font-medium text-[13px]">
                        {term.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {term.isActive ? (
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
                              data-ocid={`terms.activate_button.${i + 1}`}
                            >
                              Activate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="terms.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Activate "{term.name}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Activating this term will{" "}
                                <strong>reset all student scores</strong>. This
                                cannot be undone. Teacher and subject
                                assignments are preserved.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="terms.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleActivate(term.id)}
                                disabled={activating === term.id.toString()}
                                data-ocid="terms.confirm_button"
                              >
                                {activating === term.id.toString() ? (
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
