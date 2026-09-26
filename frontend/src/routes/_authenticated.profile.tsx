import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";
import { usersApi, authApi } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      await usersApi.updateProfile(fd);
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) { toast.error(extractErrorMessage(err, "Failed")); }
    finally { setSaving(false); }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChanging(true);
    try {
      const fd = new FormData(e.currentTarget);
      await authApi.changePassword(String(fd.get("current")), String(fd.get("next")));
      toast.success("Password changed");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) { toast.error(extractErrorMessage(err, "Failed")); }
    finally { setChanging(false); }
  }

  return (
    <div>
      <PageHeader eyebrow="Account" title="Your profile" description="Update your details and security settings." />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? <User className="h-6 w-6" />}
            </span>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email} · {user?.role}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Field label="Full name" name="name" defaultValue={user?.name} />
            <Field label="Phone" name="phone" defaultValue={user?.phone} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Profile image</span>
              <input type="file" name="profileImage" accept="image/*" className="text-sm" />
            </label>
          </div>
          <button disabled={saving} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </button>
        </form>

        <form onSubmit={changePassword} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold">Security</h3>
          <p className="text-sm text-muted-foreground">Update your password regularly.</p>
          <div className="mt-6 space-y-3">
            <Field label="Current password" name="current" type="password" required />
            <Field label="New password" name="next" type="password" required />
          </div>
          <button disabled={changing} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            {changing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Change password
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue, required }: any) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required}
        className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}
