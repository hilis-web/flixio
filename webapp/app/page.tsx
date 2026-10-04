"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-slate-900">
      {/* Header */}
      <Header />
      {/* Hero */}
      <Hero />
      {/* Features */}
      <Features />
      {/* Call to action */}
      <CallToAction />
      {/* Footer */}
      <Footer />
    </main>
  );
}
