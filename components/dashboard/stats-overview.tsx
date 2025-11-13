'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Receipt, ShoppingBag } from 'lucide-react';

interface StatsOverviewProps {
  totalSpent: number;
  ticketsCount: number;
  monthTicketsCount: number;
  averagePerTicket: number;
}

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
      value: `€${totalSpent.toFixed(2)}`,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('ticketsCount'),
      value: monthTicketsCount.toString(),
      icon: Receipt,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('averageTicket'),
      value: `€${averagePerTicket.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
