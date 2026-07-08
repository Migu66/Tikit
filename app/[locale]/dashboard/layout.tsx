'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tk-root flex min-h-screen bg-paper text-ink">
      <Sidebar />
      <main className="tk-grain relative flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
