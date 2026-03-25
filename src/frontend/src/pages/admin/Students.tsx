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
import { Progress } from "@/components/ui/progress";
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
import {
  Loader2,
  Pencil,
  Plus,
  School,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../../backend.d";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import { useSearchClasses, useSearchStudents } from "../../hooks/useQueries";

interface StudentForm {
  fullName: string;
  gender: string;
  classId: string;
  admissionNumber: string;
  parentName: string;
  parentPhone: string;
  password: string;
}

const emptyForm: StudentForm = {
  fullName: "",
  gender: "Male",
  classId: "",
  admissionNumber: "",
  parentName: "",
  parentPhone: "",
  password: "",
};

interface CsvRow {
  rowKey: string;
  fullName: string;
  gender: string;
  className: string;
  admissionNumber: string;
  parentName: string;
  parentPhone: string;
  password: string;
  classId?: bigint;
  error?: string;
}

export default function Students() {
  const { schoolId } = useAuth();
  const [search, setSearch] = useState("");
  const { data: students = [], isLoading } = useSearchStudents(
    schoolId ?? "",
    search,
  );
  const { data: classes = [] } = useSearchClasses(schoolId ?? "");
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);

  // CSV upload state
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvStep, setCsvStep] = useState<"upload" | "preview" | "done">(
    "upload",
  );
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof StudentForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({
      fullName: s.fullName,
      gender: s.gender,
      classId: s.classId.toString(),
      admissionNumber: s.admissionNumber,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      password: "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !schoolId || !form.classId) {
      toast.error("Please select a class");
      return;
    }
    setSaving(true);
    try {
      if (editingStudent) {
        await actor.updateStudent(
          editingStudent.id,
          form.fullName,
          form.gender,
          BigInt(form.classId),
          form.admissionNumber,
          form.parentName,
          form.parentPhone,
        );
        toast.success("Student updated");
      } else {
        await actor.addStudent(
          BigInt(schoolId),
          form.fullName,
          form.gender,
          BigInt(form.classId),
          form.admissionNumber,
          form.parentName,
          form.parentPhone,
          form.password,
        );
        toast.success("Student added successfully");
      }
      qc.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setForm(emptyForm);
      setEditingStudent(null);
    } catch {
      toast.error(
        editingStudent ? "Failed to update student" : "Failed to add student",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeleting(true);
    try {
      await actor.deleteStudent(id);
      toast.success("Student deleted");
      qc.invalidateQueries({ queryKey: ["students"] });
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const getClassName = (classId: bigint) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? `${cls.className} ${cls.arm}` : classId.toString();
  };

  // CSV handling
  const resetCsv = () => {
    setCsvStep("upload");
    setCsvRows([]);
    setImportProgress(0);
    setImportTotal(0);
    setImportResults(null);
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast.error("CSV file is empty or has no data rows");
        return;
      }
      // Skip header row
      const dataLines = lines.slice(1);
      const parsed: CsvRow[] = dataLines.map((line, lineIndex) => {
        const parts = line.split(",").map((p) => p.trim());
        const [
          fullName,
          gender,
          className,
          admissionNumber,
          parentName,
          parentPhone,
          password,
        ] = parts;
        const row: CsvRow = {
          rowKey: `row-${lineIndex}-${admissionNumber ?? lineIndex}`,
          fullName: fullName ?? "",
          gender: gender ?? "Male",
          className: className ?? "",
          admissionNumber: admissionNumber ?? "",
          parentName: parentName ?? "",
          parentPhone: parentPhone ?? "",
          password: password ?? "",
        };
        // Validate
        if (!row.fullName) {
          row.error = "Missing full name";
          return row;
        }
        if (!row.admissionNumber) {
          row.error = "Missing admission number";
          return row;
        }
        if (!row.password) {
          row.error = "Missing password";
          return row;
        }
        // Match class (case-insensitive)
        const matchedClass = classes.find(
          (c) => c.className.toLowerCase() === row.className.toLowerCase(),
        );
        if (!matchedClass) {
          row.error = `Class "${row.className}" not found`;
          return row;
        }
        row.classId = matchedClass.id;
        return row;
      });
      setCsvRows(parsed);
      setCsvStep("preview");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!actor || !schoolId) return;
    const validRows = csvRows.filter(
      (r) => !r.error && r.classId !== undefined,
    );
    setImporting(true);
    setImportTotal(validRows.length);
    setImportProgress(0);
    let success = 0;
    let failed = 0;
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await actor.addStudent(
          BigInt(schoolId),
          row.fullName,
          row.gender,
          row.classId!,
          row.admissionNumber,
          row.parentName,
          row.parentPhone,
          row.password,
        );
        success++;
      } catch {
        failed++;
      }
      setImportProgress(i + 1);
    }
    setImportResults({ success, failed });
    setImporting(false);
    setCsvStep("done");
    qc.invalidateQueries({ queryKey: ["students"] });
  };

  const validCount = csvRows.filter((r) => !r.error).length;
  const errorCount = csvRows.filter((r) => !!r.error).length;

  return (
    <Layout title="Students">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px]">Student Management</CardTitle>
            <div className="flex gap-2">
              {/* CSV Upload Dialog */}
              <Dialog
                open={csvOpen}
                onOpenChange={(o) => {
                  setCsvOpen(o);
                  if (!o) resetCsv();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-[12px]"
                    data-ocid="students.upload_button"
                  >
                    <Upload size={14} /> Upload CSV
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-2xl"
                  data-ocid="students.csv_modal"
                >
                  <DialogHeader>
                    <DialogTitle>Bulk Student Upload (CSV)</DialogTitle>
                  </DialogHeader>

                  {csvStep === "upload" && (
                    <div className="space-y-4">
                      <div className="rounded-md border border-dashed border-border bg-muted/40 p-5 text-center">
                        <Upload
                          size={28}
                          className="mx-auto mb-2 text-muted-foreground"
                        />
                        <p className="text-[13px] text-muted-foreground mb-3">
                          Select a CSV file to upload students in bulk
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          className="hidden"
                          data-ocid="students.dropzone"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCsvFile(file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          data-ocid="students.upload_button"
                        >
                          Choose File
                        </Button>
                      </div>
                      <div className="rounded-md bg-muted/60 p-3">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                          Expected CSV format (first row = headers):
                        </p>
                        <code className="text-[11px] text-foreground block font-mono">
                          fullName,gender,className,admissionNumber,parentName,parentPhone,password
                        </code>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          Example: Jane Doe,Female,JSS1,GFA/2025/001,Mr.
                          Doe,+2348012345678,pass123
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          <strong>className</strong> must match an existing
                          class name exactly (case-insensitive).
                        </p>
                      </div>
                    </div>
                  )}

                  {csvStep === "preview" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] text-green-600 font-semibold">
                          {validCount} valid
                        </span>
                        {errorCount > 0 && (
                          <span className="text-[13px] text-destructive font-semibold">
                            {errorCount} errors
                          </span>
                        )}
                        <span className="text-[12px] text-muted-foreground">
                          ({csvRows.length} total rows)
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[11px]">
                                Name
                              </TableHead>
                              <TableHead className="text-[11px]">
                                Gender
                              </TableHead>
                              <TableHead className="text-[11px]">
                                Class
                              </TableHead>
                              <TableHead className="text-[11px]">
                                Adm. No.
                              </TableHead>
                              <TableHead className="text-[11px]">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvRows.map((row, i) => (
                              <TableRow
                                key={row.rowKey}
                                className={row.error ? "bg-destructive/5" : ""}
                                data-ocid={`students.csv_preview.item.${i + 1}`}
                              >
                                <TableCell className="text-[12px]">
                                  {row.fullName || (
                                    <span className="text-muted-foreground italic">
                                      &mdash;
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-[12px]">
                                  {row.gender}
                                </TableCell>
                                <TableCell className="text-[12px]">
                                  {row.className}
                                </TableCell>
                                <TableCell className="text-[12px] font-mono">
                                  {row.admissionNumber}
                                </TableCell>
                                <TableCell className="text-[11px]">
                                  {row.error ? (
                                    <span className="text-destructive font-medium">
                                      {row.error}
                                    </span>
                                  ) : (
                                    <span className="text-green-600 font-medium">
                                      &#10003; OK
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={resetCsv}
                          data-ocid="students.csv_back_button"
                        >
                          Back
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={validCount === 0 || importing}
                          onClick={handleImport}
                          data-ocid="students.csv_import_button"
                        >
                          {importing ? (
                            <>
                              <Loader2
                                size={13}
                                className="animate-spin mr-1"
                              />
                              Importing {importProgress}/{importTotal}...
                            </>
                          ) : (
                            `Import ${validCount} Student${
                              validCount !== 1 ? "s" : ""
                            }`
                          )}
                        </Button>
                      </div>
                      {importing && (
                        <div data-ocid="students.csv_import.loading_state">
                          <Progress
                            value={
                              importTotal > 0
                                ? (importProgress / importTotal) * 100
                                : 0
                            }
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {csvStep === "done" && importResults && (
                    <div
                      className="space-y-4 py-2"
                      data-ocid="students.csv_import.success_state"
                    >
                      <div className="rounded-md border border-border p-5 text-center space-y-2">
                        <p className="text-[15px] font-bold text-green-600">
                          Import Complete
                        </p>
                        <p className="text-[13px] text-muted-foreground">
                          <span className="text-green-600 font-semibold">
                            {importResults.success} imported successfully
                          </span>
                          {importResults.failed > 0 && (
                            <>
                              ,{" "}
                              <span className="text-destructive font-semibold">
                                {importResults.failed} failed
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setCsvOpen(false);
                          resetCsv();
                        }}
                        data-ocid="students.csv_done_button"
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Add Student Dialog */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="gap-1.5 text-[12px]"
                    onClick={openAdd}
                    data-ocid="students.open_modal_button"
                  >
                    <Plus size={14} /> Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" data-ocid="students.dialog">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStudent ? "Edit Student" : "Add New Student"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label>Full Name</Label>
                        <Input
                          placeholder="Jane Doe"
                          required
                          value={form.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                          data-ocid="students.fullname_input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Gender</Label>
                        <Select
                          value={form.gender}
                          onValueChange={(v) => update("gender", v)}
                        >
                          <SelectTrigger data-ocid="students.gender_select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Class</Label>
                        <Select
                          value={form.classId}
                          onValueChange={(v) => update("classId", v)}
                        >
                          <SelectTrigger data-ocid="students.class_select">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((c) => (
                              <SelectItem
                                key={c.id.toString()}
                                value={c.id.toString()}
                              >
                                {c.className} {c.arm} ({c.classLevel})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Admission Number</Label>
                        <Input
                          placeholder="GFA/2025/001"
                          required
                          value={form.admissionNumber}
                          onChange={(e) =>
                            update("admissionNumber", e.target.value)
                          }
                          data-ocid="students.admission_input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Parent/Guardian Name</Label>
                        <Input
                          placeholder="Mr. John Doe"
                          value={form.parentName}
                          onChange={(e) => update("parentName", e.target.value)}
                          data-ocid="students.parent_name_input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Parent Phone</Label>
                        <Input
                          placeholder="+234..."
                          value={form.parentPhone}
                          onChange={(e) =>
                            update("parentPhone", e.target.value)
                          }
                          data-ocid="students.parent_phone_input"
                        />
                      </div>
                      {!editingStudent && (
                        <div className="col-span-2 space-y-1">
                          <Label>Password</Label>
                          <Input
                            type="password"
                            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                            required
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            data-ocid="students.password_input"
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
                        data-ocid="students.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={saving}
                        data-ocid="students.submit_button"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin mr-1" />
                        ) : null}{" "}
                        {editingStudent ? "Save Changes" : "Add Student"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative mt-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search students..."
              className="pl-8 h-8 text-[12px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="students.search_input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="flex justify-center py-10"
              data-ocid="students.loading_state"
            >
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="students.empty_state"
            >
              <School size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">
                {search ? "No students found" : "No students added yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s, i) => (
                  <TableRow
                    key={s.id.toString()}
                    data-ocid={`students.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-[13px]">
                      {s.fullName}
                    </TableCell>
                    <TableCell className="text-[12px] font-mono text-muted-foreground">
                      {s.admissionNumber}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {s.gender}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {getClassName(s.classId)}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {s.parentName}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => openEdit(s)}
                          data-ocid={`students.edit_button.${i + 1}`}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                          data-ocid={`students.delete_button.${i + 1}`}
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
            <DialogTitle>Delete Student</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Are you sure you want to delete this student? This action cannot be
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
