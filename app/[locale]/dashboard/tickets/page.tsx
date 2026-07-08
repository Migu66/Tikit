'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { TicketUpload, TicketList } from '@/components/dashboard';

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.tickets');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleUploadSuccess = () => {
    // Incrementar el trigger para refrescar la lista
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
      {/* Cabecera de documento */}
      <header className="tk-rise">
        <p className="font-mono text-[10px] tracking-[0.4em] text-ash">
          TIKIT / PANEL — /02
        </p>
        <h1 className="tk-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">
          {t('title')}
          <span className="text-thermal">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-mono text-sm text-ink-2">
          {t('subtitle')}
        </p>
      </header>

      {/* Subida: bandeja de escaneo */}
      <section className="tk-rise mt-10" style={{ animationDelay: '0.12s' }}>
        <div className="tk-card">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink px-6 py-4">
            <h2 className="tk-condensed text-2xl">{t('upload.title')}</h2>
            <p className="font-mono text-[10px] tracking-[0.3em] text-ash">
              SCAN — OCR — OK
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <TicketUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      </section>

      {/* Archivo de tickets */}
      <section className="tk-rise mt-10" style={{ animationDelay: '0.24s' }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-[3px] border-ink pb-3">
          <h2 className="tk-condensed text-2xl">{t('list.title')}</h2>
          <p className="font-mono text-[10px] tracking-[0.3em] text-ash">
            ARCHIVO ▤
          </p>
        </div>
        <div className="mt-6">
          <TicketList refreshTrigger={refreshTrigger} />
        </div>
      </section>
    </div>
  );
}
