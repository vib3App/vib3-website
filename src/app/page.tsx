/**
 * Landing page
 * Composes all landing page sections
 */
import { Header, Hero, Features, Creators, Footer } from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Creators />
      </main>
      <Footer />
    </div>
  );
}
