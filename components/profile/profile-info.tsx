'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';

interface User {
  id?: string;
  email?: string;
  name?: string | null;
  image?: string | null;
}

interface ProfileInfoProps {
  user: User;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const t = useTranslations('profile');

  return (
    <div className="space-y-8">
      {/* Name Section */}
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {t('fullName')}
        </p>
        <p className="text-2xl font-bold text-slate-900">{user.name || t('notSet')}</p>
      </div>

      {/* Email Section */}
      <div className="flex items-start gap-4">
        <Mail className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            {t('email')}
          </p>
          <p className="text-lg text-slate-700 break-all">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
