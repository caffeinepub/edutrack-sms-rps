import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  Loader2,
  UserCheck,
  Users2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Class, Subject, Teacher } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import {
  useSearchClasses,
  useSearchSubjects,
  useSearchTeachers,
} from "../../hooks/useQueries";

// ──────────────────────────────────────────────────────────
// Teacher → Subject assignment panel
// ──────────────────────────────────────────────────────────
function TeacherAssignment({
  subjects,
  teachers,
  onSaved,
}: {
  subjects: Subject[];
  teachers: Teacher[];
  onSaved: () => void;
}) {
  const { actor } = useActor();
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const openDialog = (s: Subject) => {
    setEditSubject(s);
    setSelectedTeacherId(s.teacherId != null ? s.teacherId.toString() : "none");
  };

  const handleSave = async () => {
    if (!actor || !editSubject) return;
    setSaving(true);
    try {
      const teacherIdVal =
        selectedTeacherId && selectedTeacherId !== "none"
          ? BigInt(selectedTeacherId)
          : null;
      await actor.updateSubject(
        editSubject.id,
        editSubject.name,
        editSubject.code,
        editSubject.assignedClasses,
        teacherIdVal,
      );
      toast.success("Teacher assignment saved");
      onSaved();
      setEditSubject(null);
    } catch {
      toast.error("Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const teacherMap = new Map(teachers.map((t) => [t.id.toString(), t]));

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList size={32} className="mx-auto mb-3 opacity-25" />
        <p className="text-[13px]">No subjects found. Add subjects first.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Assigned Teacher</TableHead>
            <TableHead className="w-32">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((s, i) => {
            const teacher =
              s.teacherId != null
                ? teacherMap.get(s.teacherId.toString())
                : null;
            return (
              <TableRow
                key={s.id.toString()}
                data-ocid={`assignments.teacher_row.${i + 1}`}
              >
                <TableCell className="font-medium text-[13px]">
                  {s.name}
                </TableCell>
                <TableCell className="text-[12px] font-mono text-muted-foreground">
                  {s.code || "—"}
                </TableCell>
                <TableCell>
                  {teacher ? (
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-green-50 text-green-700 border-green-200"
                    >
                      <UserCheck size={10} className="mr-1" />
                      {teacher.fullName}
                    </Badge>
                  ) : (
                    <span className="text-[12px] text-muted-foreground italic">
                      Not assigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-7 px-3"
                    onClick={() => openDialog(s)}
                    data-ocid={`assignments.assign_teacher_btn.${i + 1}`}
                  >
                    {teacher ? "Change" : "Assign"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Assign teacher dialog */}
      <Dialog
        open={editSubject !== null}
        onOpenChange={(o) => !o && setEditSubject(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="assignments.teacher_dialog"
        >
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <p className="text-[12px] text-muted-foreground mb-1">Subject</p>
              <p className="text-[14px] font-semibold">{editSubject?.name}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium">Select Teacher</p>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger data-ocid="assignments.teacher_select">
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground italic">
                      None (unassign)
                    </span>
                  </SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id.toString()} value={t.id.toString()}>
                      {t.fullName}
                      {t.username ? (
                        <span className="text-muted-foreground ml-1 text-[11px]">
                          @{t.username}
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teachers.length === 0 && (
                <p className="text-[11px] text-amber-600">
                  No teachers found. Add teachers first.
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditSubject(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={saving}
                onClick={handleSave}
                data-ocid="assignments.save_teacher_btn"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Save Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Subject → Class assignment panel
// ──────────────────────────────────────────────────────────
function ClassAssignment({
  subjects,
  classes,
  onSaved,
}: {
  subjects: Subject[];
  classes: Class[];
  onSaved: () => void;
}) {
  const { actor } = useActor();
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const openDialog = (s: Subject) => {
    setEditSubject(s);
    setSelectedClassIds(s.assignedClasses.map((id) => id.toString()));
  };

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!actor || !editSubject) return;
    setSaving(true);
    try {
      await actor.updateSubject(
        editSubject.id,
        editSubject.name,
        editSubject.code,
        selectedClassIds.map((id) => BigInt(id)),
        editSubject.teacherId != null ? editSubject.teacherId : null,
      );
      toast.success("Class assignment saved");
      onSaved();
      setEditSubject(null);
    } catch {
      toast.error("Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const classMap = new Map(classes.map((c) => [c.id.toString(), c]));

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList size={32} className="mx-auto mb-3 opacity-25" />
        <p className="text-[13px]">No subjects found. Add subjects first.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Assigned Classes</TableHead>
            <TableHead className="w-32">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((s, i) => {
            const assignedNames = s.assignedClasses
              .map((id) => {
                const c = classMap.get(id.toString());
                return c ? `${c.className} ${c.arm}` : null;
              })
              .filter(Boolean);
            return (
              <TableRow
                key={s.id.toString()}
                data-ocid={`assignments.class_row.${i + 1}`}
              >
                <TableCell className="font-medium text-[13px]">
                  {s.name}
                </TableCell>
                <TableCell className="text-[12px] font-mono text-muted-foreground">
                  {s.code || "—"}
                </TableCell>
                <TableCell>
                  {assignedNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {assignedNames.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[12px] text-muted-foreground italic">
                      No classes assigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-7 px-3"
                    onClick={() => openDialog(s)}
                    data-ocid={`assignments.assign_class_btn.${i + 1}`}
                  >
                    {s.assignedClasses.length > 0 ? "Edit" : "Assign"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Assign classes dialog */}
      <Dialog
        open={editSubject !== null}
        onOpenChange={(o) => !o && setEditSubject(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="assignments.class_dialog"
        >
          <DialogHeader>
            <DialogTitle>Assign Classes to Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <p className="text-[12px] text-muted-foreground mb-1">Subject</p>
              <p className="text-[14px] font-semibold">{editSubject?.name}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium">Select Classes</p>
              {classes.length === 0 ? (
                <p className="text-[11px] text-amber-600">
                  No classes found. Add classes first.
                </p>
              ) : (
                <div className="max-h-52 overflow-y-auto border rounded-md p-2 space-y-2">
                  {classes.map((c) => (
                    <div
                      key={c.id.toString()}
                      className="flex items-center gap-2.5"
                    >
                      <Checkbox
                        id={`cls-${c.id}`}
                        checked={selectedClassIds.includes(c.id.toString())}
                        onCheckedChange={() => toggleClass(c.id.toString())}
                        data-ocid="assignments.class_checkbox"
                      />
                      <label
                        htmlFor={`cls-${c.id}`}
                        className="text-[12px] cursor-pointer leading-tight"
                      >
                        <span className="font-medium">
                          {c.className} {c.arm}
                        </span>
                        <span className="text-muted-foreground ml-1.5 text-[11px]">
                          ({c.classLevel})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditSubject(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={saving}
                onClick={handleSave}
                data-ocid="assignments.save_class_btn"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Save Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Main Assignments page
// ──────────────────────────────────────────────────────────
export default function Assignments() {
  const { schoolId } = useAuth();
  const { data: subjects = [], isLoading: loadingSubjects } = useSearchSubjects(
    schoolId ?? "",
  );
  const { data: teachers = [], isLoading: loadingTeachers } = useSearchTeachers(
    schoolId ?? "",
    "",
  );
  const { data: classes = [], isLoading: loadingClasses } = useSearchClasses(
    schoolId ?? "",
  );
  const qc = useQueryClient();

  const isLoading = loadingSubjects || loadingTeachers || loadingClasses;

  const onSaved = () => {
    qc.invalidateQueries({ queryKey: ["subjects"] });
  };

  return (
    <Layout title="Assignments">
      <div className="space-y-4">
        {/* Info banner */}
        <div className="rounded-lg border bg-amber-50 border-amber-200 px-4 py-3">
          <p className="text-[12px] text-amber-800 font-medium">
            Use this page to assign teachers to subjects and subjects to
            classes. Create your teachers, subjects, and classes first — then
            come here to link them together.
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-[15px]">Assignment Manager</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="teachers">
                <TabsList className="mb-4 w-full grid grid-cols-2">
                  <TabsTrigger
                    value="teachers"
                    className="gap-1.5 text-[12px]"
                    data-ocid="assignments.teacher_tab"
                  >
                    <Users2 size={13} />
                    Assign Teachers to Subjects
                  </TabsTrigger>
                  <TabsTrigger
                    value="classes"
                    className="gap-1.5 text-[12px]"
                    data-ocid="assignments.class_tab"
                  >
                    <BookOpen size={13} />
                    Assign Subjects to Classes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="teachers">
                  <div className="mb-3">
                    <p className="text-[12px] text-muted-foreground">
                      Each subject can have one teacher responsible for entering
                      scores. Click <strong>Assign</strong> or{" "}
                      <strong>Change</strong> next to a subject to set its
                      teacher.
                    </p>
                  </div>
                  <TeacherAssignment
                    subjects={subjects}
                    teachers={teachers}
                    onSaved={onSaved}
                  />
                </TabsContent>

                <TabsContent value="classes">
                  <div className="mb-3">
                    <p className="text-[12px] text-muted-foreground">
                      A subject must be assigned to classes for students in
                      those classes to have that subject on their results. Click{" "}
                      <strong>Assign</strong> or <strong>Edit</strong> next to a
                      subject to pick its classes.
                    </p>
                  </div>
                  <ClassAssignment
                    subjects={subjects}
                    classes={classes}
                    onSaved={onSaved}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
