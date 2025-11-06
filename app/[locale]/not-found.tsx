'use client';

import { useTranslations } from 'next-intl';
import NotFoundContent from '@/components/not-found/not-found-content';

export default function NotFound() {
  const t = useTranslations();

  return (
    <NotFoundContent
      title={t('notFound.title')}
      description={t('notFound.description')}
      buttonText={t('notFound.homePage')}
      buttonBackText={t('notFound.goBack')}
    />
  );
}
