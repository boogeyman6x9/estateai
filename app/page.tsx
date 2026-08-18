import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Solution } from "@/components/landing/solution";
import { Features } from "@/components/landing/features";
import { HowItWorks, Pricing, FinalCta, Footer } from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
