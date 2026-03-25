import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Palette, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

interface BrandingForm {
  motto: string;
  websiteUrl: string;
  logoBase64: string;
  stampBase64: string;
  signatureBase64: string;
}

function ImageUploadField({
  label,
  value,
  onChange,
  ocid,
}: {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  ocid: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1] ?? "";
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-semibold">{label}</Label>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {value ? (
            <img
              src={`data:image/*;base64,${value}`}
              alt={label}
              className="w-20 h-20 object-contain rounded-lg border border-border bg-muted"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
              <Upload size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="text-[12px]"
            data-ocid={`${ocid}.upload_button`}
          >
            <Upload size={13} className="mr-1.5" />
            {value ? "Change Image" : "Upload Image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="text-[12px] text-destructive hover:text-destructive ml-2"
              data-ocid={`${ocid}.delete_button`}
            >
              Remove
            </Button>
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5">
            PNG, JPG, SVG up to 2MB
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Branding() {
  const { schoolId } = useAuth();
  const { actor } = useActor();
  const [form, setForm] = useState<BrandingForm>({
    motto: "",
    websiteUrl: "",
    logoBase64: "",
    stampBase64: "",
    signatureBase64: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!actor || !schoolId) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any)
      .getSchoolBranding(BigInt(schoolId))
      .then((result: any) => {
        if (result) {
          setForm({
            motto: result.motto ?? "",
            websiteUrl: result.websiteUrl ?? "",
            logoBase64: result.logoBase64 ?? "",
            stampBase64: result.stampBase64 ?? "",
            signatureBase64: result.signatureBase64 ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, schoolId]);

  const handleSave = async () => {
    if (!actor || !schoolId) return;
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).updateSchoolBranding(
        BigInt(schoolId),
        form.motto,
        form.websiteUrl,
        form.logoBase64,
        form.stampBase64,
        form.signatureBase64,
      );
      toast.success("School branding saved successfully!");
    } catch {
      toast.error("Failed to save branding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="School Branding">
      <div className="max-w-2xl space-y-6">
        {loading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="branding.loading_state"
          >
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : (
          <>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Palette size={16} className="text-primary" />
                  School Identity Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUploadField
                  label="School Logo"
                  value={form.logoBase64}
                  onChange={(v) => setForm((p) => ({ ...p, logoBase64: v }))}
                  ocid="branding.logo"
                />
                <ImageUploadField
                  label="School Stamp"
                  value={form.stampBase64}
                  onChange={(v) => setForm((p) => ({ ...p, stampBase64: v }))}
                  ocid="branding.stamp"
                />
                <ImageUploadField
                  label="Principal's Signature"
                  value={form.signatureBase64}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, signatureBase64: v }))
                  }
                  ocid="branding.signature"
                />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="motto" className="text-[13px] font-semibold">
                    School Motto
                  </Label>
                  <Input
                    id="motto"
                    placeholder="e.g. Knowledge is Power"
                    value={form.motto}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, motto: e.target.value }))
                    }
                    data-ocid="branding.motto.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="websiteUrl"
                    className="text-[13px] font-semibold"
                  >
                    School Website URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourschool.edu.ng"
                    value={form.websiteUrl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, websiteUrl: e.target.value }))
                    }
                    data-ocid="branding.website.input"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              data-ocid="branding.save_button"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saving ? "Saving..." : "Save Branding"}
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
