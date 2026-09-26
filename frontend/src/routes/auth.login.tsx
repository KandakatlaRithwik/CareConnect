import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const DEMO_ACCOUNTS = [
  { label: "👤 Patient", email: "patient@careconnect.com", password: "password123" },
  { label: "🩺 Caregiver (Anita)", email: "anita@careconnect.com", password: "password123" },
  { label: "🏃 Caregiver (David)", email: "david@careconnect.com", password: "password123" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrors({});
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">CareConnect</p>
          <p className="text-[11px] text-muted-foreground">Elderly Care Platform</p>
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to manage your loved one's care.
      </p>

      {/* Demo credential quick-fill */}
      <div className="mt-5 rounded-xl border border-dashed border-primary/40 bg-primary-soft/30 p-4">
        <p className="mb-3 text-xs font-semibold text-primary">⚡ Quick Demo Login</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${
                email === acc.email
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/60"
              }`}
            >
              {acc.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Password for all: <code className="rounded bg-muted px-1">password123</code></p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 transition-all focus:border-primary focus:ring-2"
          />
          {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Password</span>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 pr-10 text-sm outline-none ring-primary/30 transition-all focus:border-primary focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-2 flex items-center px-1.5 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-primary transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to CareConnect?{" "}
        <Link to="/auth/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
