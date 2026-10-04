import Link from "next/link";
import CategorySelect from "./CategorySelect";

interface FooterProps {
  variant?: "default" | "sidebar";
}

const Footer = ({ variant = "default" }: FooterProps) => {
  if (variant === "sidebar") {
    return (
      <div className="bg-white rounded-xl border p-4 text-sm text-slate-600 shadow w-64">
        {/* <h3 className="font-semibold mb-3">Flixio</h3> */}
        <CategorySelect /> {/* هنا نضيف الـ component */}
        {/* Links horizontal */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} Flixio
        </p>
        <span className="text-xs">
          Powered by{" "}
          <a
            href="http://www.google.com"
            target="_blank"
            className="text-sky-600"
          >
            NeoDevHub
          </a>
        </span>
      </div>
    );
  }

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between gap-4">
        <span>
          Powered by{" "}
          <a
            href="http://www.google.com"
            target="_blank"
            className="text-sky-600"
          >
            NeoDevHub
          </a>
        </span>
        <span>
          © {new Date().getFullYear()} <Link href="/">Flixio</Link>
        </span>
        <div className="flex gap-4">
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
