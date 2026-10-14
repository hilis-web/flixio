import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

const sections = [
  {
    title: "1. Accepting these terms",
    paragraphs: [
      "These Terms of Service govern your access to and use of Flixio. By using the platform, you agree to follow these terms and applicable laws.",
      "If you do not agree with these terms, you should not use the service. Additional terms may apply to specific features when clearly presented.",
    ],
  },
  {
    title: "2. Eligibility and accounts",
    paragraphs: [
      "You must be legally permitted to use Flixio under the laws that apply to you and must meet the age requirements established by the service.",
      "You are responsible for providing accurate registration information, keeping your login credentials secure, and taking reasonable steps to protect your account.",
      "You must not impersonate another person, create accounts for fraudulent purposes, or use another person's account without authorization.",
    ],
  },
  {
    title: "3. Educational content",
    paragraphs: [
      "Flixio allows users to create and organize educational materials, including flashcards and study groups, and may provide features for sharing and discussing learning resources.",
      "You are responsible for the content you submit and for ensuring that you have the rights and permissions needed to upload or share it.",
      "Learning materials are provided for educational purposes. Unless expressly stated otherwise, Flixio does not guarantee that every user-submitted card, answer, explanation, or resource is accurate, complete, or suitable for a particular purpose.",
    ],
  },
  {
    title: "4. Community standards",
    paragraphs: [
      "You may not use Flixio to threaten, harass, defraud, or unlawfully discriminate against others; distribute unlawful content; violate another person's privacy; or interfere with the security or operation of the platform.",
      "You must not upload malicious code, attempt unauthorized access, exploit vulnerabilities, spam users, or disrupt the service.",
      "You must not use the platform to infringe intellectual property rights or to distribute content you are not authorized to share.",
    ],
  },
  {
    title: "5. Ownership and permission to use content",
    paragraphs: [
      "You retain any rights you hold in content you create, subject to the rights of other people and any third-party materials included in that content.",
      "By submitting content to Flixio, you grant the service the limited permissions reasonably necessary to host, store, display, and process that content to provide the features you choose to use.",
      "For example, content shared in a public study group may need to be displayed to other users so they can access that group. The exact visibility depends on the sharing features and settings available.",
      "You must not copy, redistribute, or commercially exploit another user's content in ways that violate applicable law or the rights of its owner.",
    ],
  },
  {
    title: "6. Public and private study groups",
    paragraphs: [
      "Where Flixio provides public and private groups, you are responsible for selecting the appropriate visibility before sharing materials.",
      "Do not assume that content is private unless the available settings clearly indicate that it is. Other users may copy or retain material that they are permitted to access.",
      "We may develop additional sharing, reporting, and moderation tools as the platform evolves. Their availability is determined by the features actually released.",
    ],
  },
  {
    title: "7. Intellectual property complaints",
    paragraphs: [
      "If you believe that material on Flixio infringes your rights, contact the service operator with enough information to identify the material and explain the concern.",
      "The operator should establish and publish a suitable contact process for intellectual property complaints and respond in accordance with applicable law.",
    ],
  },
  {
    title: "8. Service availability and changes",
    paragraphs: [
      "We aim to maintain a useful and reliable learning service, but we cannot promise uninterrupted access or that every feature will always be available.",
      "Features may be updated, improved, suspended, or discontinued. Where required by law, we will provide appropriate notice of significant changes.",
      "Nothing in these terms excludes rights or remedies that cannot legally be excluded.",
    ],
  },
  {
    title: "9. Account restrictions and termination",
    paragraphs: [
      "Where legally permitted, the service may take proportionate action against accounts that seriously or repeatedly violate these terms, compromise security, or create unlawful risks.",
      "Depending on the circumstances, action may include a warning, restriction of a feature, suspension, or termination. Applicable notice, explanation, and appeal requirements must be respected.",
      "You may stop using the service and request account deletion through the mechanisms made available by the operator. Data handling after deletion remains subject to the Privacy Policy and applicable law.",
    ],
  },
  {
    title: "10. Disclaimers and liability",
    paragraphs: [
      "To the extent permitted by applicable law, Flixio is provided on an as-available basis. We do not guarantee that the service will always be error-free or that user-generated educational content will be accurate.",
      "Nothing in these terms excludes or limits liability where such exclusion or limitation is prohibited by law, including any mandatory consumer rights that apply to you.",
    ],
  },
  {
    title: "11. Changes to these terms",
    paragraphs: [
      "We may update these terms as Flixio develops. The current version should display its effective date. Where a change requires notice or renewed agreement, the service will follow the applicable requirements.",
    ],
  },
  {
    title: "12. Applicable law and contact",
    paragraphs: [
      "The applicable law and competent courts will be determined in accordance with the rules that apply to the service operator and the user. Mandatory consumer protections remain unaffected.",
      "Before publication, the operator must provide its legal identity, an appropriate contact address, and any other business information required by applicable law.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Flixio
        </Link>

        <header className="mt-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 p-7 text-white sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Scale size={30} />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-indigo-100">
            Clear expectations help create a respectful learning community.
            These terms explain the basic rules for using Flixio and sharing
            educational content.
          </p>

          <p className="mt-5 text-sm text-indigo-200">
            Effective date: October 13, 2026
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Before publication:</strong> The service operator must
          complete its legal and contact details and review these terms for the
          actual business model, audience, moderation procedures, and applicable
          consumer laws.
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="leading-8 text-slate-600">
            Flixio is a learning platform intended to help users organize
            educational materials and learn independently or with others. These
            terms apply to your use of the website and the features made
            available through it.
          </p>

          <div className="mt-8 space-y-9">
            {sections.map((section) => (
              <section
                key={section.title}
                className="border-b border-slate-100 pb-8 last:border-0 last:pb-0"
              >
                <h2 className="text-xl font-bold tracking-tight">
                  {section.title}
                </h2>

                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="leading-8 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Flixio</p>

          <nav className="flex flex-wrap justify-center gap-5">
            <Link className="hover:text-indigo-600" href="/about">
              About
            </Link>
            <Link className="hover:text-indigo-600" href="/privacy">
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
