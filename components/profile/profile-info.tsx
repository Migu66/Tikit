'use client';

import { useTranslations } from 'next-intl';

interface User {
  id?: string;
  email?: string;
  name?: string | null;
  image?: string | null;
}

interface ProfileInfoProps {
  user: User;
}

/** Datos del titular impresos como los conceptos de un recibo. */
export function ProfileInfo({ user }: ProfileInfoProps) {
  const t = useTranslations('profile');

  return (
    <div className="space-y-8">
      {/* Name Section */}
      <div>
        <p className="tk-label mb-2">{t('fullName')}</p>
        <p className="tk-condensed text-3xl sm:text-4xl">
          {user.name || t('notSet')}
        </p>
      </div>

      <div className="border-t-2 border-dashed border-ink/25" />

      {/* Email Section */}
      <div>
        <p className="tk-label mb-2">{t('email')}</p>
        <p className="break-all font-mono text-sm text-ink-2 sm:text-base">
          {user.email}
        </p>
      </div>

      <p className="font-mono text-[9px] tracking-[0.4em] text-ash" aria-hidden="true">
        ★ TIKIT — {new Date().getFullYear()} ★
      </p>
    </div>
  );
}
