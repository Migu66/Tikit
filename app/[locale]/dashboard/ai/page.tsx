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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 lg:mt-12 md:mt-12">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
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
