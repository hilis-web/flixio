import { Shield, Users, Sparkles, ArrowRight } from "lucide-react";

const Features = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-6 md:grid-cols-3">
        <Feature
          icon={<Users className="h-6 w-6" />}
          title="Community-first"
          text="Designed to help communities grow with healthier conversations."
        />
        <Feature
          icon={<Shield className="h-6 w-6" />}
          title="Open & transparent"
          text="Built on open standards so users stay in control."
        />
        <Feature
          icon={<Sparkles className="h-6 w-6" />}
          title="Modern experience"
          text="Fast, simple, and enjoyable on any device."
        />
      </div>
    </section>
  );
};

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{text}</p>
    </div>
  );
}

export default Features;
