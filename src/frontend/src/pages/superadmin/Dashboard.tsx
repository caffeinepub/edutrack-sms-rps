import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Layout from "../../components/Layout";
import { useActor } from "../../hooks/useActor";
import { useListSchools } from "../../hooks/useQueries";

export default function SuperAdminDashboard() {
  const { data: schools = [], isLoading } = useListSchools();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [approving, setApproving] = useState<string | null>(null);

  const pending = schools.filter((s) => !s.isApproved);
  const approved = schools.filter((s) => s.isApproved);

  const handleApprove = async (schoolId: bigint) => {
    if (!actor) return;
    setApproving(schoolId.toString());
    try {
      await actor.approveSchool(schoolId);
      toast.success("School approved successfully");
      qc.invalidateQueries({ queryKey: ["schools"] });
    } catch {
      toast.error("Failed to approve school");
    } finally {
      setApproving(null);
    }
  };

  return (
    <Layout title="Super Admin Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Schools",
              value: schools.length,
              icon: <Building2 size={20} />,
              color: "oklch(0.54 0.20 264)",
            },
            {
              label: "Approved",
              value: approved.length,
              icon: <CheckCircle size={20} />,
              color: "oklch(0.73 0.18 142)",
            },
            {
              label: "Pending Approval",
              value: pending.length,
              icon: <Clock size={20} />,
              color: "oklch(0.75 0.18 55)",
            },
          ].map((kpi) => (
            <Card key={kpi.label} className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${kpi.color}20`, color: kpi.color }}
                  >
                    {kpi.icon}
                  </div>
                </div>
                <p className="text-[26px] font-extrabold text-foreground leading-none">
                  {kpi.value}
                </p>
                <p className="text-muted-foreground text-[12px] mt-1">
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Schools table */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Registered Schools</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="schools.loading_state"
              >
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : schools.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="schools.empty_state"
              >
                <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-[13px]">No schools registered yet</p>
              </div>
            ) : (
              <Table data-ocid="schools.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school, idx) => (
                    <TableRow
                      key={school.id.toString()}
                      data-ocid={`schools.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium text-[13px]">
                        {school.name}
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {school.email}
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {school.phone}
                      </TableCell>
                      <TableCell>
                        {school.isApproved ? (
                          <Badge className="bg-success/10 text-success border-0 text-[11px]">
                            Approved
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-amber-600 border-amber-200 bg-amber-50 text-[11px]"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!school.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(school.id)}
                            disabled={approving === school.id.toString()}
                            className="text-[12px] h-7"
                            data-ocid={`schools.approve_button.${idx + 1}`}
                          >
                            {approving === school.id.toString() ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
