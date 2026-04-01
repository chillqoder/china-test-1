import AnimatedBackground from '@/components/welcome/animated-background';
import Hero from '@/components/welcome/hero';

export default function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <Hero />
    </main>
  );
}
