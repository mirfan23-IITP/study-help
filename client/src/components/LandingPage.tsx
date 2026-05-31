import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Moon,
  PlayCircle,
  Sparkles,
  Sun
} from "lucide-react";
import heroImage from "../assets/study-help-hero.png";
import { audienceModes, faqs, features, successStories } from "../data/content";
import { Badge, IconButton, PrimaryButton, SecondaryButton } from "./Primitives";

export function LandingPage({
  onAuth,
  darkMode,
  onToggleTheme
}: {
  onAuth: (mode: "login" | "signup") => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <main className="bg-white text-ink dark:bg-slate-950 dark:text-white">
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Study Help</span>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              icon={darkMode ? Sun : Moon}
              onClick={onToggleTheme}
            />
            <SecondaryButton
              onClick={() => onAuth("login")}
              className="hidden sm:inline-flex"
            >
              Login
            </SecondaryButton>
            <PrimaryButton onClick={() => onAuth("signup")}>Get Started</PrimaryButton>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.14),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.12),transparent_28%),linear-gradient(180deg,#ffffff,#f8fafc)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.14),transparent_28%),linear-gradient(180deg,#020617,#0f172a)]">
        <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge tone="sea">AI preparation manager for India</Badge>
            <h1 className="mt-5 text-5xl font-black leading-[1.02] text-ink dark:text-white sm:text-6xl lg:text-7xl">
              Your Personal Study Manager
            </h1>
            <p className="mt-5 max-w-xl text-xl font-semibold text-slate-700 dark:text-slate-200">
              Track. Learn. Revise. Succeed.
            </p>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Plan exam preparation, job-readiness, daily goals, revisions,
              notes, mock tests, and interviews from one calm command center.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={() => onAuth("signup")}>
                Start Free <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton onClick={() => onAuth("login")}>
                <PlayCircle className="h-4 w-4" /> Try Demo
              </SecondaryButton>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["30k+", "study blocks"],
                ["92%", "planner adherence"],
                ["6x", "revision cadence"]
              ].map(([value, label]) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="rounded-lg border border-slate-200 bg-white/75 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="text-2xl font-black text-ink dark:text-white">
                    {value}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase text-slate-500">
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <img
              src={heroImage}
              alt="Study Help dashboard shown on student devices"
              className="aspect-[16/11] w-full rounded-lg object-cover shadow-soft"
            />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 rounded-lg border border-white/70 bg-white/85 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
              {["Roadmap", "Streak", "Readiness"].map((label, index) => (
                <div key={label}>
                  <div className="text-xs font-semibold text-slate-500">
                    {label}
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sea"
                      style={{ width: `${[72, 88, 64][index]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="border-b border-slate-200 py-16 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge tone="cobalt">Features</Badge>
            <h2 className="mt-4 text-3xl font-black text-ink dark:text-white sm:text-4xl">
              Everything needed to move from intention to consistency.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <feature.icon className="h-6 w-6 text-sea" />
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-b border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {audienceModes.map((mode) => (
            <article key={mode.title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <mode.icon className="h-6 w-6 text-flame" />
              <h3 className="mt-4 font-bold">{mode.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {mode.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-sea" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200 py-16 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {successStories.map((story) => (
              <article
                key={story.name}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <Badge tone="flame">{story.outcome}</Badge>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  "{story.quote}"
                </p>
                <div className="mt-4 font-bold">{story.name}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {[
            {
              name: "Free",
              price: "₹0",
              perks: ["Basic tracking", "Planner", "Progress dashboard"]
            },
            {
              name: "Premium",
              price: "₹299/mo",
              perks: [
                "AI Study Coach",
                "AI Interview Coach",
                "Advanced analytics",
                "Unlimited subjects"
              ]
            }
          ].map((plan) => (
            <article
              key={plan.name}
              className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
            >
              <h3 className="text-2xl font-black">{plan.name}</h3>
              <div className="mt-3 text-4xl font-black">{plan.price}</div>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-sea" />
                    {perk}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="border-b border-slate-200 py-5 dark:border-slate-800"
            >
              <summary className="cursor-pointer text-lg font-bold">{faq.q}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
        Study Help prepares students with plans, revision, analytics, and coaching.
      </footer>
    </main>
  );
}
