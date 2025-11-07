'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ProfileContent } from '@/components/profile/profile-content';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const locale = useLocale();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (status === 'unauthenticated') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 mt-15">
        <ProfileContent user={session?.user} />
      </div>
    </div>
  );
}
