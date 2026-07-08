'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  LandingHeader,
  HeroPoster,
  ProcessLines,
  FeaturesIndex,
  StatsGrid,
  TotalCta,
  Marquee,
  CustomCursor,
  Footer,
} from '@/components/landing';

export default function Home() {
  const t = useTranslations('landing');
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'es';

  // Redirigir al dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(`/${locale}/dashboard`);
    }
  }, [status, router, locale]);

  return (
    <div className="tk-root tk-grain relative overflow-x-clip">
      <CustomCursor />
      <LandingHeader />

      <HeroPoster />

      {/* Cinta de caja registradora entre hero y proceso */}
      <Marquee
        text={t('marquee')}
        duration={32}
        className="tk-condensed border-y-[3px] border-ink bg-ink py-3 text-xl text-paper sm:text-2xl"
      />

      <ProcessLines />
      <FeaturesIndex />
      <StatsGrid />
      <TotalCta />
      <Footer />
    </div>
  );
}
