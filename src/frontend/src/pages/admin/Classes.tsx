import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Class } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import { useSearchClasses } from "../../hooks/useQueries";

const CLASS_LEVELS = [
  "Nursery",
  "Primary",
  "Junior Secondary",
  "Senior Secondary",
];
const LEVEL_COLORS: Record<string, string> = {
  Nursery: "bg-pink-50 text-pink-700 border-pink-200",
  Primary: "bg-blue-50 text-blue-700 border-blue-200",
  "Junior Secondary": "bg-amber-50 text-amber-700 border-amber-200",
  "Senior Secondary": "bg-green-50 text-green-700 border-green-200",
};

export default function Classes() {
  const { schoolId } = useAuth();
  const { data: classes = [], isLoading } = useSearchClasses(schoolId ?? "");
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    classLevel: "Primary",
    className: "",
    arm: "A",
  });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditingClass(null);
    setForm({ classLevel: "Primary", className: "", arm: "A" });
    setOpen(true);
  };

  const openEdit = (c: Class) => {
    setEditingClass(c);
    setForm({ classLevel: c.classLevel, className: c.className, arm: c.arm });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !schoolId) return;
    setSaving(true);
    try {
      if (editingClass) {
        await actor.updateClass(
          editingClass.id,
          form.classLevel,
          form.className,
          form.arm,
        );
        toast.success("Class updated");
      } else {
        await actor.addClass(
          BigInt(schoolId),
          form.classLevel,
          form.className,
          form.arm,
        );
        toast.success("Class created");
      }
      qc.invalidateQueries({ queryKey: ["classes"] });
      setOpen(false);
      setEditingClass(null);
      setForm({ classLevel: "Primary", className: "", arm: "A" });
    } catch {
      toast.error(
        editingClass ? "Failed to update class" : "Failed to create class",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeleting(true);
    try {
      await actor.deleteClass(id);
      toast.success("Class deleted");
      qc.invalidateQueries({ queryKey: ["classes"] });
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete class");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Classes">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px]">Class Management</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1.5 text-[12px]"
                  onClick={openAdd}
                  data-ocid="classes.open_modal_button"
                >
                  <Plus size={14} /> Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm" data-ocid="classes.dialog">
                <DialogHeader>
                  <DialogTitle>
                    {editingClass ? "Edit Class" : "Add New Class"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label>Class Level</Label>
                    <Select
                      value={form.classLevel}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, classLevel: v }))
                      }
                    >
                      <SelectTrigger data-ocid="classes.level_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Class Name</Label>
                    <Input
                      placeholder="e.g. Primary 5, JSS1, SSS2"
                      required
                      value={form.className}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, className: e.target.value }))
                      }
                      data-ocid="classes.name_input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Arm</Label>
                    <Input
                      placeholder="e.g. A, B, C"
                      required
                      value={form.arm}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, arm: e.target.value }))
                      }
                      data-ocid="classes.arm_input"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                      data-ocid="classes.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={saving}
                      data-ocid="classes.submit_button"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : null}{" "}
                      {editingClass ? "Save Changes" : "Create"}
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
              data-ocid="classes.loading_state"
            >
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : classes.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="classes.empty_state"
            >
              <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">No classes created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Arm</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c, i) => (
                  <TableRow
                    key={c.id.toString()}
                    data-ocid={`classes.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-[13px]">
                      {c.className}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {c.arm}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${LEVEL_COLORS[c.classLevel] ?? ""}`}
                      >
                        {c.classLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => openEdit(c)}
                          data-ocid={`classes.edit_button.${i + 1}`}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(c.id)}
                          data-ocid={`classes.delete_button.${i + 1}`}
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
            <DialogTitle>Delete Class</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete this class? This action cannot be
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
