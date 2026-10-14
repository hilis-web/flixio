import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Information we collect",
    paragraphs: [
      "Account information: when you register, we may collect information such as your username, email address, and authentication-related information.",
      "Learning content: we process the flashcards, study groups, comments, and other content you choose to create or submit.",
      "Learning activity: information such as review history, progress, saved groups, and study activity may be processed to provide the learning features you use.",
      "Technical information: our hosting, database, and security services may process technical information needed to operate, maintain, and protect the platform. The exact information collected depends on the services and configuration in use.",
    ],
  },
  {
    title: "2. How we use information",
    paragraphs: [
      "We use information to create and manage accounts, provide learning and study-group features, save user preferences and progress, and make the platform work as intended.",
      "We may also use relevant technical information to diagnose errors, prevent abuse, maintain security, and improve reliability.",
      "We will explain any additional purposes that require separate notice or consent where applicable.",
    ],
  },
  {
    title: "3. Study groups and shared content",
    paragraphs: [
      "Content you create may be visible to other users depending on the features and visibility settings you select.",
      "Before sharing a study group, card, comment, or other material, review its visibility and avoid including sensitive personal information.",
      "We aim to respect your content and provide clear controls for shared material as the platform develops. The controls currently available in Flixio determine what you can make private, public, edit, or delete.",
    ],
  },
  {
    title: "4. Legal bases for processing",
    paragraphs: [
      "Where European data protection law applies, personal data must be processed under an appropriate legal basis. Depending on the activity, this may include providing the service you request, complying with a legal obligation, pursuing a legitimate interest, or obtaining consent when required.",
      "The applicable basis depends on the specific processing activity. We will provide further information where necessary.",
    ],
  },
  {
    title: "5. Service providers and data sharing",
    paragraphs: [
      "We do not sell personal information as a business model.",
      "To operate Flixio, we may rely on service providers for hosting, application delivery, databases, security, and technical operations. The current deployment may involve Vercel, Render, and Supabase.",
      "These providers may process information on our behalf or in accordance with their own roles and terms. Data may also be disclosed when legally required or when necessary to protect rights and security.",
      "Before launch, the actual providers, their roles, applicable agreements, and any international data transfers must be verified and documented.",
    ],
  },
  {
    title: "6. Data retention and security",
    paragraphs: [
      "We retain personal information for as long as reasonably necessary for the purposes described in this policy, subject to applicable legal requirements.",
      "We use technical and organizational measures intended to protect information. No website or electronic storage system can be guaranteed to be completely secure.",
      "Retention periods, backup practices, deletion procedures, and security measures should be documented and maintained as the service grows.",
    ],
  },
  {
    title: "7. Cookies and local storage",
    paragraphs: [
      "Flixio may use browser storage, including local storage, to keep information such as a login token or user preferences on your device.",
      "Hosting and application services may also use technical mechanisms necessary to deliver the site or maintain security. Any analytics, advertising, or non-essential tracking tools must be disclosed and handled in accordance with applicable consent requirements.",
      "The exact storage and cookie practices depend on the features enabled in the deployed application.",
    ],
  },
  {
    title: "8. Your privacy rights",
    paragraphs: [
      "Depending on your location and applicable law, you may have rights to access, correct, delete, restrict, or object to certain processing of your personal data, as well as rights to data portability and to withdraw consent where processing relies on consent.",
      "You may also have the right to lodge a complaint with your relevant data protection authority. In Spain, this may include the Agencia Española de Protección de Datos (AEPD).",
      "To exercise a right or ask a privacy question, contact the service using the privacy contact details published by its operator. Those details must be added before this policy is published as final.",
    ],
  },
  {
    title: "9. Children and young users",
    paragraphs: [
      "Flixio is a learning platform, but this policy does not mean that every age group is automatically permitted to use every feature.",
      "The operator must establish an appropriate age policy, consider parental or guardian requirements where applicable, and comply with relevant rules before offering the service to children.",
    ],
  },
  {
    title: "10. Changes to this policy",
    paragraphs: [
      "We may update this policy when the platform, its features, or applicable legal requirements change. The current version should display its effective date, and significant changes should be communicated where required.",
    ],
  },
];

export default function PrivacyPage() {
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

        <header className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-700 to-blue-700 p-7 text-white sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <ShieldCheck size={30} />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-blue-100">
            Your trust matters. This policy explains how Flixio may handle
            information when you use the platform and its learning features.
          </p>

          <p className="mt-5 text-sm text-blue-100">
            Effective date: October 13, 2026
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Before publication:</strong> The platform operator must
          complete the contact details and verify that this policy matches the
          data actually collected, the services used, and the current account,
          storage, and deletion procedures.
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="leading-8 text-slate-600">
            Flixio is designed to help people learn, organize study materials,
            and collaborate through learning resources. This policy applies to
            information processed through the Flixio website and related
            features operated by the service.
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
            <Link className="hover:text-indigo-600" href="/terms">
              Terms
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
