import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Subject } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import {
  useSearchClasses,
  useSearchSubjects,
  useSearchTeachers,
} from "../../hooks/useQueries";

export default function Subjects() {
  const { schoolId } = useAuth();
  const { data: subjects = [], isLoading } = useSearchSubjects(schoolId ?? "");
  const { data: classes = [] } = useSearchClasses(schoolId ?? "");
  const { data: teachers = [] } = useSearchTeachers(schoolId ?? "");
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    teacherId: "",
    assignedClassIds: [] as string[],
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleClass = (id: string) => {
    setForm((p) => ({
      ...p,
      assignedClassIds: p.assignedClassIds.includes(id)
        ? p.assignedClassIds.filter((x) => x !== id)
        : [...p.assignedClassIds, id],
    }));
  };

  const openAdd = () => {
    setEditingSubject(null);
    setForm({ name: "", code: "", teacherId: "", assignedClassIds: [] });
    setOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingSubject(s);
    setForm({
      name: s.name,
      code: s.code,
      teacherId: s.teacherId != null ? s.teacherId.toString() : "",
      assignedClassIds: s.assignedClasses.map((id) => id.toString()),
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !schoolId) return;
    setSaving(true);
    try {
      const teacherIdVal =
        form.teacherId && form.teacherId !== "none"
          ? BigInt(form.teacherId)
          : null;
      if (editingSubject) {
        await actor.updateSubject(
          editingSubject.id,
          form.name,
          form.code,
          form.assignedClassIds.map((id) => BigInt(id)),
          teacherIdVal,
        );
        toast.success("Subject updated");
      } else {
        await actor.addSubject(
          BigInt(schoolId),
          form.name,
          form.code,
          form.assignedClassIds.map((id) => BigInt(id)),
          teacherIdVal,
        );
        toast.success("Subject added");
      }
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setOpen(false);
      setEditingSubject(null);
      setForm({ name: "", code: "", teacherId: "", assignedClassIds: [] });
    } catch {
      toast.error(
        editingSubject ? "Failed to update subject" : "Failed to add subject",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeleting(true);
    try {
      await actor.deleteSubject(id);
      toast.success("Subject deleted");
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete subject");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Subjects">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px]">Subject Management</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1.5 text-[12px]"
                  onClick={openAdd}
                  data-ocid="subjects.open_modal_button"
                >
                  <Plus size={14} /> Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" data-ocid="subjects.dialog">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubject ? "Edit Subject" : "Add New Subject"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label>Subject Name</Label>
                      <Input
                        placeholder="Mathematics"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        data-ocid="subjects.name_input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Subject Code (optional)</Label>
                      <Input
                        placeholder="MTH101"
                        value={form.code}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, code: e.target.value }))
                        }
                        data-ocid="subjects.code_input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Assign Teacher</Label>
                      <Select
                        value={form.teacherId}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, teacherId: v }))
                        }
                      >
                        <SelectTrigger data-ocid="subjects.teacher_select">
                          <SelectValue placeholder="(None)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {teachers.map((t) => (
                            <SelectItem
                              key={t.id.toString()}
                              value={t.id.toString()}
                            >
                              {t.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {classes.length > 0 && (
                      <div className="col-span-2 space-y-2">
                        <Label>Assign to Classes</Label>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 border rounded-md p-2">
                          {classes.map((c) => (
                            <div
                              key={c.id.toString()}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={`cls-${c.id}`}
                                checked={form.assignedClassIds.includes(
                                  c.id.toString(),
                                )}
                                onCheckedChange={() =>
                                  toggleClass(c.id.toString())
                                }
                                data-ocid="subjects.class_checkbox"
                              />
                              <label
                                htmlFor={`cls-${c.id}`}
                                className="text-[12px] cursor-pointer"
                              >
                                {c.className} {c.arm} ({c.classLevel})
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                      data-ocid="subjects.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={saving}
                      data-ocid="subjects.submit_button"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : null}{" "}
                      {editingSubject ? "Save Changes" : "Add Subject"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="flex justify-center py-10"
              data-ocid="subjects.loading_state"
            >
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : subjects.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="subjects.empty_state"
            >
              <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">No subjects added yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Classes Assigned</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((s, i) => (
                  <TableRow
                    key={s.id.toString()}
                    data-ocid={`subjects.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-[13px]">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-[12px] font-mono text-muted-foreground">
                      {s.code || "\u2014"}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {s.assignedClasses.length} class(es)
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => openEdit(s)}
                          data-ocid={`subjects.edit_button.${i + 1}`}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                          data-ocid={`subjects.delete_button.${i + 1}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete this subject? This action cannot be
            undone.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleting}
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {deleting ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
