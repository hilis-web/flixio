import Link from "next/link";
const CallToAction = () => {
  function Button({
    children,
    href,
    variant = "primary",
  }: {
    children: React.ReactNode;
    href?: string;
    variant?: "primary" | "secondary" | "outline";
  }) {
    const base =
      "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition";

    const styles = {
      primary: "bg-sky-600 text-white hover:bg-sky-700",
      secondary: "bg-white text-slate-900 hover:bg-slate-100",
      outline: "border border-slate-300 text-slate-900 hover:bg-slate-100",
    };

    const className = `${base} ${styles[variant]}`;

    if (href) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }

    return <button className={className}>{children}</button>;
  }
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold">Ready to join?</h2>
        <p className="mt-4 text-slate-300">
          Create an account and start exploring today.
        </p>
        <div className="mt-8">
          <Button href="/signup" variant="secondary">
            Create account
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
