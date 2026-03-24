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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Teacher } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import { useSearchTeachers } from "../../hooks/useQueries";

interface TeacherForm {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

const emptyForm: TeacherForm = {
  fullName: "",
  username: "",
  phone: "",
  email: "",
  address: "",
  password: "",
};

export default function Teachers() {
  const { schoolId } = useAuth();
  const [search, setSearch] = useState("");
  const { data: teachers = [], isLoading } = useSearchTeachers(
    schoolId ?? "",
    search,
  );
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const update = (k: keyof TeacherForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditingTeacher(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setForm({
      fullName: t.fullName,
      username: t.username,
      phone: t.phone,
      email: t.email,
      address: t.address,
      password: "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !schoolId) return;
    setSaving(true);
    try {
      if (editingTeacher) {
        await actor.updateTeacher(
          editingTeacher.id,
          form.fullName,
          form.username,
          form.phone,
          form.email,
          form.address,
        );
        toast.success("Teacher updated");
      } else {
        await actor.addTeacher(
          BigInt(schoolId),
          form.fullName,
          form.username,
          form.phone,
          form.email,
          form.address,
          form.password,
        );
        toast.success("Teacher added successfully");
      }
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setOpen(false);
      setForm(emptyForm);
      setEditingTeacher(null);
    } catch {
      toast.error(
        editingTeacher ? "Failed to update teacher" : "Failed to add teacher",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeleting(true);
    try {
      await actor.deleteTeacher(id);
      toast.success("Teacher deleted");
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete teacher");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Teachers">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px]">Teacher Management</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1.5 text-[12px]"
                  onClick={openAdd}
                  data-ocid="teachers.open_modal_button"
                >
                  <Plus size={14} /> Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" data-ocid="teachers.dialog">
                <DialogHeader>
                  <DialogTitle>
                    {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="John Smith"
                        required
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        data-ocid="teachers.fullname_input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Username</Label>
                      <Input
                        placeholder="j.smith"
                        required
                        value={form.username}
                        onChange={(e) => update("username", e.target.value)}
                        data-ocid="teachers.username_input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Phone</Label>
                      <Input
                        placeholder="+234..."
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        data-ocid="teachers.phone_input"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="j.smith@school.edu"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        data-ocid="teachers.email_input"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Address</Label>
                      <Input
                        placeholder="Residential address"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        data-ocid="teachers.address_input"
                      />
                    </div>
                    {!editingTeacher && (
                      <div className="col-span-2 space-y-1">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          required
                          value={form.password}
                          onChange={(e) => update("password", e.target.value)}
                          data-ocid="teachers.password_input"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                      data-ocid="teachers.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={saving}
                      data-ocid="teachers.submit_button"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : null}{" "}
                      {editingTeacher ? "Save Changes" : "Add Teacher"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search teachers..."
              className="pl-8 h-8 text-[12px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="teachers.search_input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="flex justify-center py-10"
              data-ocid="teachers.loading_state"
            >
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="teachers.empty_state"
            >
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">
                {search ? "No teachers found" : "No teachers added yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t, i) => (
                  <TableRow
                    key={t.id.toString()}
                    data-ocid={`teachers.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-[13px]">
                      {t.fullName}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {t.username}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {t.email}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {t.phone}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => openEdit(t)}
                          data-ocid={`teachers.edit_button.${i + 1}`}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(t.id)}
                          data-ocid={`teachers.delete_button.${i + 1}`}
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
            <DialogTitle>Delete Teacher</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete this teacher? This action cannot be
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
