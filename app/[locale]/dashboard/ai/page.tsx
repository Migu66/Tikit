'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { RecommendationsList } from '@/components/dashboard';

export default function AIRecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.ai');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-xs font-bold tracking-[0.4em]">
          ▮▮▮<span className="tk-blink text-thermal">▮</span>
        </p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
      <header className="tk-rise mb-8">
        <p className="font-mono text-[10px] tracking-[0.4em] text-ash">
          TIKIT / PANEL — /04 — AI
        </p>
        <h1 className="tk-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">
          {t('title')}
          <span className="text-thermal">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-mono text-sm text-ink-2">{t('subtitle')}</p>
      </header>

      <div className="tk-rise tk-card p-4 sm:p-6 lg:p-8" style={{ animationDelay: '0.12s' }}>
        <RecommendationsList
          locale={locale}
          translations={{
            title: t('recommendations'),
            subtitle: t('recommendationsSubtitle'),
            loading: t('loading'),
            error: t('error'),
            retry: t('retry'),
            noRecommendations: t('noRecommendations'),
            noData: t('noData'),
            regenerate: t('regenerate'),
            regenerating: t('regenerating'),
          }}
        />
      </div>
    </div>
  );
}
