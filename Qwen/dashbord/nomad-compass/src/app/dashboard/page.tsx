import DashboardContent from '@/components/dashboard/dashboard-content';

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#1a1028] to-[#0a0f1e] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        <DashboardContent />
      </div>
    </main>
  );
}
