import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
