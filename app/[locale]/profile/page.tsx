'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ProfileContent } from '@/components/profile/profile-content';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const locale = useLocale();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="font-mono text-xs font-bold tracking-[0.4em] text-ink">
          ▮▮▮<span className="tk-blink text-thermal">▮</span>
        </p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="tk-root tk-grain relative min-h-screen overflow-x-clip">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
        <ProfileContent user={session?.user} />
      </div>
    </div>
  );
}
