import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Users,
  Target,
  Sparkles,
  Layers3,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Learn actively",
    description:
      "Create and review flashcards to practice what you learn and strengthen your understanding over time.",
  },
  {
    icon: Users,
    title: "Learn together",
    description:
      "Discover study groups, share useful learning materials, and learn from the knowledge of others.",
  },
  {
    icon: Layers3,
    title: "Organize your knowledge",
    description:
      "Keep learning materials organized in groups that make studying easier to manage.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Flixio
        </Link>

        <section className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 px-6 py-16 text-white sm:px-12 sm:py-20">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              <Sparkles size={16} />A new way to learn together
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Learning is better when we share it.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Flixio is a learning platform built to help people organize
              knowledge, practice with flashcards, and share study resources
              with a community of learners.
            </p>

            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 transition hover:bg-blue-50"
            >
              Start learning
              <ArrowLeft className="rotate-180" size={18} />
            </Link>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Target size={28} />
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Our mission
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              We want to make learning more organized, engaging, and
              collaborative. Our long-term vision is to build a place where
              learners can create, discover, discuss, and improve their
              knowledge together.
            </p>
          </div>
        </section>

        <section className="grid gap-5 pb-16 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center sm:px-12">
          <BookOpen className="mx-auto text-indigo-600" size={32} />

          <h2 className="mt-4 text-2xl font-bold">
            Build your learning journey.
          </h2>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
            Whether you study independently or with others, Flixio aims to help
            you turn information into lasting knowledge.
          </p>

          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Create your account
          </Link>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Flixio. Learn together.</p>

          <nav className="flex flex-wrap justify-center gap-5">
            <Link className="hover:text-indigo-600" href="/about">
              About
            </Link>
            <Link className="hover:text-indigo-600" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-indigo-600" href="/terms">
              Terms
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
