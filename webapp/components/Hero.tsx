import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Users, Sparkles, ArrowRight } from "lucide-react";

const Hero = () => {
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
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, textAlign: "center", paddingTop: 100 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold tracking-tight"
      >
        Welcome to the social internet.
        <span className="text-sky-600"> for people</span>, not platforms
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mt-6 max-w-2xl text-lg text-slate-600"
      >
        Connect, share, and discover in an open, modern network designed to put
        users first.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-8 flex gap-4"
      >
        <Button href="auth/signup">
          Get started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        {/* <Button href="/about" variant="outline">
            Learn more
          </Button> */}
      </motion.div>
    </section>
  );
};

export default Hero;
