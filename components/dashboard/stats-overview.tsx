'use client';

import { useTranslations } from 'next-intl';

interface StatsOverviewProps {
  totalSpent: number;
  ticketsCount: number;
  monthTicketsCount: number;
  averagePerTicket: number;
}

/**
 * Tres totales como bloques de recibo: etiqueta en mono, cifra enorme
 * en display y una marca de sección numerada. El primero lleva el acento
 * termal, como el TOTAL de un ticket.
 */
export function StatsOverview({
  totalSpent,
  ticketsCount,
  monthTicketsCount,
  averagePerTicket,
}: StatsOverviewProps) {
  const t = useTranslations('dashboard.stats.overview');

  const stats = [
    {
      label: t('totalSpent'),
      value: `${totalSpent.toFixed(2)} €`,
      accent: true,
    },
    {
      label: t('ticketsCount'),
      value: monthTicketsCount.toString(),
      accent: false,
    },
    {
      label: t('averageTicket'),
      value: `${averagePerTicket.toFixed(2)} €`,
      accent: false,
    },
  ];

  return (
    <div className="tk-card-flat grid md:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`group px-6 py-6 transition-colors duration-300 hover:bg-ink ${
            index > 0 ? 'border-t-2 border-ink md:border-l-2 md:border-t-0' : ''
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
              {stat.label}
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-ash">
              /0{index + 1}
            </p>
          </div>
          <p
            className={`tk-display mt-3 text-4xl tabular-nums transition-colors duration-300 sm:text-5xl ${
              stat.accent
                ? 'text-thermal'
                : 'text-ink group-hover:text-paper'
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
