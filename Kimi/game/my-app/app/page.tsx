import GameCanvas from '@/components/game/GameCanvas';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <GameCanvas width={1920} height={1080} />
    </main>
  );
}
