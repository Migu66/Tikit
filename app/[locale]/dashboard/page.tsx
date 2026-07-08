'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { StatsResponse } from '@/types/stats';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    const fetchStats = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/dashboard/stats');
          if (response.ok) {
            const data: StatsResponse = await response.json();
            setStats(data);
          } else {
            console.error('Failed to fetch stats:', response.status);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
  }, [status]);

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

  const firstName = session.user?.name?.split(' ')[0] || '';
  const today = new Date().toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-GB',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  const lines = [
    {
      label: t('totalSpent'),
      value: `${formatCurrency(stats?.overview.totalSpent, locale)} €`,
      note: t('thisMonth'),
      accent: true,
    },
    {
      label: t('averagePerTicket'),
      value: `${formatCurrency(stats?.overview.averagePerTicket, locale)} €`,
      note: t('thisMonth'),
      accent: false,
    },
    {
      label: t('ticketsCount'),
      value: `${stats?.overview.ticketsCount ?? 0}`,
      note: t('totalTickets'),
      accent: false,
    },
  ];

  const steps = [
    { title: t('steps.step1Title'), desc: t('steps.step1Description') },
    { title: t('steps.step2Title'), desc: t('steps.step2Description') },
    { title: t('steps.step3Title'), desc: t('steps.step3Description') },
  ];

  return (
    <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
      {/* Cabecera de documento */}
      <header className="tk-rise">
        <p className="font-mono text-[10px] tracking-[0.4em] text-ash">
          TIKIT / PANEL — {today}
        </p>
        <h1 className="tk-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">
          {t('welcome')},{' '}
          <span className="tk-outline">{firstName}</span>
          <span className="text-thermal">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-mono text-sm text-ink-2">
          {t('home.subtitle')}
        </p>
      </header>

      {/* Resumen como líneas de recibo */}
      <section
        className="tk-rise mt-10 grid gap-6 lg:grid-cols-12"
        style={{ animationDelay: '0.12s' }}
      >
        <div className="tk-card p-0 lg:col-span-8">
          <p className="border-b-2 border-dashed border-ink/25 px-6 py-3 font-mono text-[10px] font-bold tracking-[0.35em] text-ash">
            TIKIT — Nº {String(stats?.overview.ticketsCount ?? 0).padStart(4, '0')} — {today}
          </p>

          <ul>
            {lines.map((line, i) => (
              <li
                key={line.label}
                className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-5 ${
                  i > 0 ? 'border-t-2 border-dashed border-ink/15' : ''
                }`}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-ash">
                  /0{i + 1}
                </span>
                <span className="tk-condensed text-lg sm:text-xl">
                  {line.label}
                </span>
                <span className="tk-dots" aria-hidden="true" />
                {loadingStats ? (
                  <span className="h-8 w-28 animate-pulse bg-paper-2" />
                ) : (
                  <span
                    className={`tk-display text-3xl tabular-nums sm:text-4xl ${
                      line.accent ? 'text-thermal' : ''
                    }`}
                  >
                    {line.value}
                  </span>
                )}
                <span className="w-full pl-10 font-mono text-[10px] tracking-[0.25em] text-ash sm:w-auto sm:pl-0">
                  {line.note.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tarjeta CTA lateral */}
        <div className="lg:col-span-4">
          <Link
            href={`/${locale}/dashboard/tickets?autoOpen=true`}
            className="group relative flex h-full min-h-52 flex-col justify-between overflow-hidden border-2 border-ink bg-ink p-6 text-paper shadow-[8px_10px_0_0_rgba(20, 27, 24,0.14)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom scale-y-0 bg-thermal transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
            />
            <span className="relative z-10 font-mono text-[10px] tracking-[0.35em] text-ash transition-colors group-hover:text-paper">
              {t('getStarted').toUpperCase()}
            </span>
            <span className="relative z-10">
              <span className="tk-condensed block text-3xl leading-tight">
                {t('uploadTicket')}
              </span>
              <span
                aria-hidden="true"
                className="mt-3 inline-block text-3xl transition-transform duration-500 group-hover:translate-x-3"
              >
                →
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Cómo funciona: índice numerado */}
      <section
        className="tk-rise mt-10"
        style={{ animationDelay: '0.24s' }}
      >
        <div className="tk-card-flat">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink px-6 py-4">
            <h2 className="tk-condensed text-2xl">{t('getStarted')}</h2>
            <p className="font-mono text-[10px] tracking-[0.3em] text-ash">
              {t('uploadFirstTicket').toUpperCase()}
            </p>
          </div>

          <div className="grid sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`group px-6 py-6 transition-colors duration-300 hover:bg-ink hover:text-paper ${
                  i > 0 ? 'border-t-2 border-ink sm:border-l-2 sm:border-t-0' : ''
                }`}
              >
                <p className="tk-display text-4xl text-thermal">
                  0{i + 1}
                </p>
                <h3 className="tk-condensed mt-3 text-xl">{step.title}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-ash transition-colors duration-300 group-hover:text-paper/70">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
