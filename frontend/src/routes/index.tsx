import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  Brain,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  MessageCircle,
  Phone,
  Pill,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <StatsStrip />
        <Services />
        <Categories />
        <WhyUs />
        <AIRecommend />
        <RiskAssessment />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Nav                                                          */
/* ────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#why-us", label: "Why CareConnect" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-base font-semibold tracking-tight">CareConnect</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth/login"
            className="hidden h-10 items-center rounded-lg px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/auth/register"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-primary transition-transform hover:-translate-y-0.5"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary">
      <HeartPulse className="h-5 w-5" strokeWidth={2.4} />
    </span>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Hero                                                          */
/* ────────────────────────────────────────────────────────────── */

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-28">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Trusted by 12,000+ families across India
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Compassionate care,
            <br />
            <span className="text-editorial text-primary">delivered to their door.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            CareConnect matches your loved ones with verified nurses, caregivers and
            physiotherapists — so families can be present without being on-call.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-primary transition-transform hover:-translate-y-0.5"
            >
              Find a caregiver
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-6 text-sm font-semibold text-foreground shadow-soft hover:bg-muted"
            >
              How it works
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
            {[
              { k: "4.9★", v: "Family rating" },
              { k: "100%", v: "Verified staff" },
              { k: "24/7", v: "SOS response" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-semibold text-foreground">{s.k}</dt>
                <dd className="text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 30 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="relative"
    >
      {/* Floating soft blob backdrop, understated */}
      <div className="absolute -inset-4 -z-10 rounded-[36px] bg-primary-soft blur-2xl" />
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-elevated">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Priya Menon, RN</p>
            <p className="text-xs text-muted-foreground">Geriatric Nurse · 8 yrs · Bangalore</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { icon: Star, label: "4.98", sub: "142 reviews" },
            { icon: HeartPulse, label: "320+", sub: "Patients" },
            { icon: ShieldCheck, label: "ICU", sub: "Trained" },
          ].map((s) => (
            <div key={s.sub} className="rounded-xl bg-muted/60 p-3 text-center">
              <s.icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1.5 text-sm font-semibold">{s.label}</p>
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <TimelineRow icon={CalendarClock} title="Morning visit" time="8:30 AM · Today" tone="primary" />
          <TimelineRow icon={Pill} title="Medication given" time="Amlodipine · 9:00 AM" tone="secondary" />
          <TimelineRow icon={ClipboardList} title="Care note added" time="BP 128/82 — stable" tone="accent" />
        </div>

        <button
          type="button"
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-primary"
        >
          <MessageCircle className="h-4 w-4" />
          Message Priya
        </button>
      </div>
    </motion.div>
  );
}

function TimelineRow({
  icon: Icon,
  title,
  time,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  time: string;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-soft text-primary"
      : tone === "secondary"
        ? "bg-secondary-soft text-secondary"
        : "bg-accent-soft text-accent";
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Stats strip                                                   */
/* ────────────────────────────────────────────────────────────── */

function StatsStrip() {
  const stats = [
    { k: "12,400+", v: "Families served" },
    { k: "3,200+", v: "Verified caregivers" },
    { k: "84,000", v: "Home visits completed" },
    { k: "26", v: "Cities across India" },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.v} className="text-center md:text-left">
            <p className="text-3xl font-semibold tracking-tight text-foreground">{s.k}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Services                                                      */
/* ────────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: Stethoscope,
    title: "Skilled nursing",
    body:
      "Wound care, injections, IV therapy, post-operative recovery — delivered by RNs with hospital experience.",
    tone: "primary" as const,
  },
  {
    icon: HeartPulse,
    title: "Elderly caregiving",
    body:
      "Bathing, mobility, meal support and companionship from vetted caregivers matched to your loved one.",
    tone: "secondary" as const,
  },
  {
    icon: Activity,
    title: "Physiotherapy at home",
    body:
      "Structured rehab plans for post-stroke, orthopaedic and geriatric recovery — no waiting rooms.",
    tone: "accent" as const,
  },
  {
    icon: Brain,
    title: "Dementia & memory care",
    body:
      "Specially trained attendants with structured routines for Alzheimer's and cognitive decline.",
    tone: "primary" as const,
  },
  {
    icon: Pill,
    title: "Medication management",
    body:
      "Smart reminders, adherence tracking and refill alerts — synced across every family member.",
    tone: "secondary" as const,
  },
  {
    icon: ShieldCheck,
    title: "24/7 SOS support",
    body:
      "One tap alerts family, caregiver and emergency response. Every alert is logged and audited.",
    tone: "accent" as const,
  },
];

function Services() {
  return (
    <Section id="services" eyebrow="Services" title="Every kind of care they need — under one roof." lead="From short-term recovery to long-term companionship, our network covers the full spectrum of home healthcare.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => (
          <RevealCard key={s.title} delay={i * 0.05}>
            <ServiceCard {...s} />
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-soft text-primary"
      : tone === "secondary"
        ? "bg-secondary-soft text-secondary"
        : "bg-accent-soft text-accent";
  return (
    <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Learn more <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Categories                                                    */
/* ────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { title: "Post-surgery recovery", count: "184 caregivers" },
  { title: "Parkinson's & neuro care", count: "72 specialists" },
  { title: "Cardiac care", count: "96 RNs" },
  { title: "Diabetes management", count: "212 caregivers" },
  { title: "Palliative care", count: "58 specialists" },
  { title: "Companionship visits", count: "410 attendants" },
];

function Categories() {
  return (
    <Section eyebrow="Healthcare categories" title="Specialised care, precisely matched." lead="Filter by condition, language, gender, availability and location — every profile is verified and reviewed.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <RevealCard key={c.title} delay={i * 0.04}>
            <a
              href="#"
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-soft transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.count}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Why us                                                        */
/* ────────────────────────────────────────────────────────────── */

function WhyUs() {
  const items = [
    {
      icon: BadgeCheck,
      title: "Verified & background-checked",
      body:
        "Every caregiver clears qualification, ID, criminal record and reference checks before joining the network.",
    },
    {
      icon: Bell,
      title: "Real-time visibility",
      body: "Live visit tracking, care notes and medication logs so the whole family stays in sync.",
    },
    {
      icon: ShieldCheck,
      title: "24/7 SOS & support",
      body: "Round-the-clock emergency response with escalation to your on-call clinician.",
    },
    {
      icon: Sparkles,
      title: "Smart matching",
      body: "Our recommendation engine surfaces caregivers based on medical needs and personality fit.",
    },
  ];
  return (
    <Section id="why-us" eyebrow="Why CareConnect" title="Built for families who don't compromise on care." lead="A modern operating system for home healthcare — clinical rigor, consumer-grade design.">
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((it, i) => (
          <RevealCard key={it.title} delay={i * 0.06}>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <it.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">{it.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
              </div>
            </div>
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  AI recommend                                                  */
/* ────────────────────────────────────────────────────────────── */

function AIRecommend() {
  return (
    <Section eyebrow="AI caregiver recommendation" title={<>The right caregiver, <span className="text-editorial text-primary">on the first try.</span></>} lead="Tell us about your loved one — condition, routine, preferences. Our matching engine ranks the best-fit caregivers from our verified pool.">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <RevealCard>
          <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Match input</p>
            <div className="mt-4 space-y-3 text-sm">
              {["Age 78, post-stroke recovery", "Speaks Tamil & English", "Female caregiver preferred", "Weekday mornings, 4 hrs"].map((v) => (
                <div key={v} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {v}
                </div>
              ))}
            </div>
          </div>
        </RevealCard>
        <RevealCard delay={0.1}>
          <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top match · 96% fit</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold">Meera Krishnan, RN</p>
                <p className="text-xs text-muted-foreground">Stroke rehab · 6 yrs · 4.97★</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-accent" /> Speaks Tamil, English, Malayalam</li>
              <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-accent" /> Certified in neuro rehabilitation</li>
              <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-accent" /> Available weekday mornings</li>
            </ul>
          </div>
        </RevealCard>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Risk assessment                                               */
/* ────────────────────────────────────────────────────────────── */

function RiskAssessment() {
  const rows = [
    { label: "Blood pressure", value: "128/82", status: "Stable", tone: "success" as const },
    { label: "Blood sugar (fasting)", value: "112 mg/dL", status: "Watch", tone: "warning" as const },
    { label: "BMI", value: "24.1", status: "Healthy", tone: "success" as const },
    { label: "Resting heart rate", value: "76 bpm", status: "Stable", tone: "success" as const },
  ];
  return (
    <Section eyebrow="Health risk assessment" title="A living health record for every patient." lead="Vitals, medications and observations feed a rolling risk score — surfacing changes before they become emergencies.">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-sm font-semibold">Ashok Menon, 74</p>
            <p className="text-xs text-muted-foreground">Weekly summary · updated 2h ago</p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Overall risk · Low
          </span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">Auto-logged from caregiver visits</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold">{r.value}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    r.tone === "success"
                      ? "bg-success/10 text-success"
                      : "bg-warning/15 text-warning-foreground"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  How it works                                                  */
/* ────────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell us about your loved one", body: "Share their condition, routine and preferences in under 3 minutes." },
    { n: "02", title: "Meet vetted caregivers", body: "Browse ranked matches, read reviews, and shortlist your favourites." },
    { n: "03", title: "Book, track and manage", body: "Schedule visits, monitor care notes and adjust plans anytime." },
  ];
  return (
    <Section id="how-it-works" eyebrow="How it works" title="From first search to first visit — often within 24 hours.">
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <RevealCard key={s.n} delay={i * 0.08}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-sm font-semibold text-primary">{s.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Testimonials                                                  */
/* ────────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    quote:
      "CareConnect gave us back our evenings. Knowing Amma is with a nurse we trust — and seeing every visit logged — is priceless.",
    name: "Sneha R.",
    meta: "Daughter · Chennai",
  },
  {
    quote:
      "The matching engine is genuinely good. Our first caregiver understood dad's Parkinson's routine within two visits.",
    name: "Rahul M.",
    meta: "Son · Mumbai",
  },
  {
    quote:
      "We've tried three agencies before. CareConnect is the first one that feels like a real product, not a call centre.",
    name: "Anita K.",
    meta: "Daughter-in-law · Bangalore",
  },
];

function Testimonials() {
  return (
    <Section eyebrow="Testimonials" title="Families who chose CareConnect.">
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <RevealCard key={t.name} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4 text-sm">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.meta}</p>
              </figcaption>
            </figure>
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  FAQ                                                           */
/* ────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "How are caregivers verified?",
    a: "We verify qualifications, government ID, criminal record and at least three professional references. Every caregiver is also interviewed by our clinical team.",
  },
  {
    q: "Can I switch caregivers if it's not the right fit?",
    a: "Yes, at any time. We'll rematch you within 24 hours at no extra cost.",
  },
  {
    q: "What areas do you serve?",
    a: "CareConnect operates in 26 cities across India, with new locations added every month.",
  },
  {
    q: "Is my family's data secure?",
    a: "All medical records are encrypted at rest and in transit. Access is scoped strictly to your family and assigned caregivers.",
  },
  {
    q: "How does billing work?",
    a: "Transparent per-visit or monthly plans — no lock-in, no hidden fees. Invoices are shared after each visit.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered.">
      <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
              >
                <span className="text-sm font-medium sm:text-base">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen ? (
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Footer                                                        */
/* ────────────────────────────────────────────────────────────── */

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold">CareConnect</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Trusted home healthcare for the people who raised us.
            </p>
          </div>
          <FooterCol title="Services" items={["Nursing", "Caregiving", "Physiotherapy", "Dementia care"]} />
          <FooterCol title="Company" items={["About", "Careers", "Press", "Contact"]} />
          <FooterCol title="Support" items={["Help centre", "SOS", "Privacy", "Terms"]} />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CareConnect Health Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="tel:+911800000000" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Phone className="h-3.5 w-3.5" />
              1800 000 000
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:text-foreground">
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Shared bits                                                   */
/* ────────────────────────────────────────────────────────────── */

function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h2>
        {lead ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{lead}</p> : null}
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}

function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
