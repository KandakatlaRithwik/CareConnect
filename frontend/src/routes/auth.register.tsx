import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, HeartHandshake, Loader2, Users, ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { caregiversApi } from "@/api";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

// No password complexity rules — any non-empty password is fine
const baseSchema = z.object({
  name:     z.string().min(2, "Name is too short").max(80),
  email:    z.string().email("Enter a valid email"),
  phone:    z.string().optional(),
  password: z.string().min(1, "Password is required"),
});

const CAREGIVER_TYPES = [
  { value: "Nurse",               label: "Nurse" },
  { value: "Physiotherapist",     label: "Physiotherapist" },
  { value: "Attendant",           label: "Attendant" },
  { value: "CompanionCaregiver",  label: "Companion Caregiver" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>("FamilyMember");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  // Caregiver-specific state
  const [cgType,        setCgType]        = useState("Nurse");
  const [cgExp,         setCgExp]         = useState("1");
  const [cgRate,        setCgRate]        = useState("300");
  const [cgLangs,       setCgLangs]       = useState("English");
  const [cgDesc,        setCgDesc]        = useState("");
  const [cgCity,        setCgCity]        = useState("");
  const [cgQual,        setCgQual]        = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd  = new FormData(e.currentTarget);
    const raw = {
      name:     String(fd.get("name")     || "").trim(),
      email:    String(fd.get("email")    || "").trim(),
      phone:    String(fd.get("phone")    || "").trim() || undefined,
      password: String(fd.get("password") || ""),
    };
    const parsed = baseSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const key = String(iss.path[0] ?? "");
        if (key) fieldErrors[key] = iss.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const payload: any = {
        ...parsed.data,
        role,
        city:  String(fd.get("city")  || "").trim() || cgCity,
        state: String(fd.get("state") || "").trim(),
      };

      // If caregiver, include caregiver profile fields
      if (role === "Caregiver") {
        payload.caregiverType    = cgType;
        payload.experienceYears  = parseInt(cgExp) || 1;
        payload.hourlyRate       = parseInt(cgRate) || 300;
        payload.languages        = cgLangs.split(",").map(s => s.trim()).filter(Boolean);
        payload.profileDescription = cgDesc;
        payload.qualifications   = cgQual.split(",").map(s => s.trim()).filter(Boolean);
        payload.serviceAreas     = cgCity ? [cgCity] : [];
      }

      const user = await register(payload);
      toast.success(`Welcome to CareConnect, ${user.name.split(" ")[0]}! 🎉`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose the role that best describes you.</p>

      {/* Role selector */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <RoleTile selected={role === "FamilyMember"} onSelect={() => setRole("FamilyMember")}
          icon={Users} title="Patient / Family" subtitle="Manage care for a loved one" />
        <RoleTile selected={role === "Caregiver"} onSelect={() => setRole("Caregiver")}
          icon={HeartHandshake} title="Caregiver" subtitle="Offer nursing or care services" />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* ── Basic fields ─────────────────────────────────────────── */}
        <Field label="Full name" error={errors.name}>
          <input name="name" required placeholder="e.g. Anita Krishnan"
            className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email}>
            <input name="email" type="email" autoComplete="email" required placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2" />
          </Field>
          <Field label="Phone (optional)" error={errors.phone}>
            <input name="phone" inputMode="tel" placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" error={errors.city}>
            <input name="city" placeholder="e.g. Bangalore"
              onChange={e => cgCity === "" && setCgCity(e.target.value)}
              className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2" />
          </Field>
          <Field label="State" error={errors.state}>
            <input name="state" placeholder="e.g. Karnataka"
              className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2" />
          </Field>
        </div>

        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input name="password" type={showPw ? "text" : "password"} autoComplete="new-password" required
              placeholder="Choose any password"
              className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 pr-10 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2" />
            <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? "Hide" : "Show"}
              className="absolute inset-y-0 right-2 flex items-center px-1.5 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* ── Caregiver-specific fields ─────────────────────────────── */}
        {role === "Caregiver" && (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/20 p-5 space-y-4">
            <p className="text-sm font-semibold text-primary">Professional Details</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Caregiver Type">
                <select value={cgType} onChange={e => setCgType(e.target.value)}
                  className="w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
                  {CAREGIVER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Years of Experience">
                <input type="number" min="0" max="50" value={cgExp} onChange={e => setCgExp(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hourly Rate (₹)">
                <input type="number" min="0" value={cgRate} onChange={e => setCgRate(e.target.value)}
                  placeholder="e.g. 400"
                  className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </Field>
              <Field label="Languages (comma separated)">
                <input value={cgLangs} onChange={e => setCgLangs(e.target.value)}
                  placeholder="e.g. English, Hindi, Kannada"
                  className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </Field>
            </div>

            <Field label="Qualifications / Certifications (comma separated)">
              <input value={cgQual} onChange={e => setCgQual(e.target.value)}
                placeholder="e.g. BSc Nursing, BPT, First Aid Certified"
                className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
            </Field>

            <Field label="Service City / Area">
              <input value={cgCity} onChange={e => setCgCity(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
            </Field>

            <Field label="About You / Profile Description">
              <textarea value={cgDesc} onChange={e => setCgDesc(e.target.value)} rows={3}
                placeholder="Brief description of your expertise and care approach…"
                className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
            </Field>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-primary transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create account
        </button>

        <p className="text-center text-xs text-muted-foreground">By continuing you agree to our Terms &amp; Privacy Policy.</p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

function RoleTile({ selected, onSelect, icon: Icon, title, subtitle }: {
  selected: boolean; onSelect: () => void; icon: React.ElementType; title: string; subtitle: string;
}) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={`rounded-xl border p-4 text-left transition-all ${selected
        ? "border-primary bg-primary-soft shadow-soft"
        : "border-border bg-surface hover:border-primary/40"}`}>
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </label>
  );
}
