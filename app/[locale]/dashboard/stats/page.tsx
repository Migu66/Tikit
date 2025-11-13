'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  StatsOverview,
  CategoryChart,
  TrendsChart,
  TopStoresChart,
  StatsSkeleton,
  StatsPeriodFilter,
  type PeriodFilter,
} from '@/components/dashboard';
import type { PeriodType } from '@/components/dashboard/stats-period-filter';
import { AlertCircle, Upload } from 'lucide-react';

interface StatsData {
  overview: {
    totalSpent: number;
    ticketsCount: number;
    periodTicketsCount: number;
    averagePerTicket: number;
  };
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    amount: number;
    ticketsCount: number;
  }>;
  topStores: Array<{
    store: string;
    visits: number;
    total: number;
  }>;
  availableYears: number[];
  periodInfo: {
    type: string;
    startDate: string;
    endDate: string;
  };
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('dashboard.stats');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Inicializar filtro desde URL o usar valor por defecto
  const getInitialFilter = (): PeriodFilter => {
    const periodType = searchParams.get('periodType') as PeriodType | null;
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    if (periodType === 'custom' && year && month !== null) {
      return {
        type: 'custom',
        year: parseInt(year),
        month: parseInt(month),
      };
    } else if (periodType && ['allTime', 'currentMonth', 'currentYear'].includes(periodType)) {
      return { type: periodType as PeriodType };
    }
    
    return { type: 'currentMonth' };
  };
  
  const [currentFilter, setCurrentFilter] = useState<PeriodFilter>(getInitialFilter());
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  const fetchStats = async (filter: PeriodFilter) => {
    try {
      setLoading(true);
      setError(false);
      
      // Construir URL con parámetros de filtrado
      const params = new URLSearchParams();
      params.append('periodType', filter.type);
      if (filter.year) params.append('year', filter.year.toString());
      if (filter.month !== undefined) params.append('month', filter.month.toString());

      const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && !hasInitialLoad) {
      fetchStats(currentFilter);
      setHasInitialLoad(true);
    }
  }, [session, hasInitialLoad]);

  const handleFilterChange = (filter: PeriodFilter) => {
    setCurrentFilter(filter);
    
    // Actualizar URL con los parámetros del filtro
    const params = new URLSearchParams();
    params.set('periodType', filter.type);
    if (filter.year) params.set('year', filter.year.toString());
    if (filter.month !== undefined) params.set('month', filter.month.toString());
    
    router.push(`/${locale}/dashboard/stats?${params.toString()}`, { scroll: false });
    
    fetchStats(filter);
  };

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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 mt-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{t('subtitle')}</p>
        </div>
        <StatsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 mt-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-800 font-medium mb-2">{t('error')}</p>
          <button
            onClick={() => fetchStats(currentFilter)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!stats || stats.overview.ticketsCount === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 mt-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noTickets')}</h3>
          <p className="text-gray-600 mb-6">{t('uploadFirst')}</p>
          <button
            onClick={() => router.push(`/${locale}/dashboard/tickets`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t('uploadFirst')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 lg:mt-12 md:mt-12">
      {/* Header con filtros */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">{t('subtitle')}</p>
          </div>
          <StatsPeriodFilter
            onFilterChange={handleFilterChange}
            availableYears={stats.availableYears}
            initialFilter={currentFilter}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview Cards */}
        <StatsOverview
          totalSpent={stats.overview.totalSpent}
          ticketsCount={stats.overview.ticketsCount}
          monthTicketsCount={stats.overview.periodTicketsCount}
          averagePerTicket={stats.overview.averagePerTicket}
        />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryChart data={stats.byCategory} />
          <TrendsChart data={stats.monthlyTrends} />
        </div>

        {/* Top Stores Full Width */}
        <div className="grid gap-6 lg:grid-cols-1">
          <TopStoresChart data={stats.topStores} />
        </div>
      </div>
    </div>
  );
}
