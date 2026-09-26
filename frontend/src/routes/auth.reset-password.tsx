import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { authApi } from "@/api";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPage,
});

const schema = z.object({
  password: z.string().min(6, "At least 6 characters"),
  confirm: z.string().min(6, "At least 6 characters"),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

function ResetPage() {
  const { token } = useSearch({ from: "/auth/reset-password" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token missing — request a new link");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const raw = {
      password: String(fd.get("password") || ""),
      confirm: String(fd.get("confirm") || ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const key = String(iss.path[0] ?? "");
        if (key) fe[key] = iss.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword(token, parsed.data.password);
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate({ to: "/auth/login" }), 1500);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose something you'll remember.</p>

      {!token ? (
        <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
          Missing reset token. Please request a new link.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">New password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
          />
          {errors.password ? <p className="mt-1.5 text-xs text-destructive">{errors.password}</p> : null}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Confirm password</span>
          <input
            name="confirm"
            type="password"
            required
            className="w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
          />
          {errors.confirm ? <p className="mt-1.5 text-xs text-destructive">{errors.confirm}</p> : null}
        </label>
        <button
          type="submit"
          disabled={loading || !token}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-primary transition-transform hover:-translate-y-0.5 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update password
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
