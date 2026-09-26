import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { HeartPulse, ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex flex-col px-6 py-8 sm:px-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary">
              <HeartPulse className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="text-base font-semibold">CareConnect</span>
          </Link>
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareConnect · Made for families
          </p>
        </div>

        {/* Right: pitch panel */}
        <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
          <div className="absolute inset-0 bg-noise opacity-40" aria-hidden />
          <div className="relative flex h-full flex-col justify-between p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
              CareConnect for families
            </p>
            <div>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                Care your parents deserve.
                <br />
                Peace of mind you deserve.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed opacity-90">
                Join 12,000+ families who trust CareConnect for verified caregivers,
                real-time visit tracking and 24/7 emergency response.
              </p>
              <ul className="mt-10 space-y-4 text-sm">
                {[
                  { icon: ShieldCheck, label: "100% background-verified caregivers" },
                  { icon: Users, label: "Whole-family access, one shared timeline" },
                  { icon: Sparkles, label: "AI matching for the right fit, faster" },
                ].map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/10">
                      <f.icon className="h-4 w-4" />
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
            <blockquote className="max-w-md text-sm leading-relaxed opacity-90">
              "CareConnect gave us back our evenings. Every visit is logged, every
              medication tracked — I finally feel like I'm not alone in this."
              <footer className="mt-3 text-xs opacity-70">Sneha R., Chennai</footer>
            </blockquote>
          </div>
        </aside>
      </div>
    </div>
  );
}
