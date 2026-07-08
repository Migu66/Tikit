'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import {
    StatsOverview,
    CategoryChart,
    TrendsChart,
    TopStoresChart,
    StatsSkeleton,
    StatsPeriodFilter,
    ExportButtons,
    type PeriodFilter,
} from '@/components/dashboard'
import type { PeriodType } from '@/components/dashboard/stats-period-filter'
import { AlertCircle, Upload } from 'lucide-react'

interface StatsData {
    overview: {
        totalSpent: number
        ticketsCount: number
        periodTicketsCount: number
        averagePerTicket: number
    }
    byCategory: Array<{
        category: string
        amount: number
        percentage: number
    }>
    monthlyTrends: Array<{
        month: string
        amount: number
        ticketsCount: number
    }>
    topStores: Array<{
        store: string
        visits: number
        total: number
    }>
    availableYears: number[]
    periodInfo: {
        type: string
        startDate: string
        endDate: string
    }
}

function StatsContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = useLocale()
    const t = useTranslations('dashboard.stats')
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // Inicializar filtro desde URL o usar valor por defecto
    const getInitialFilter = (): PeriodFilter => {
        const periodType = searchParams.get('periodType') as PeriodType | null
        const year = searchParams.get('year')
        const month = searchParams.get('month')

        if (periodType === 'custom' && year && month !== null) {
            return {
                type: 'custom',
                year: parseInt(year),
                month: parseInt(month),
            }
        } else if (
            periodType &&
            ['allTime', 'currentMonth', 'currentYear'].includes(periodType)
        ) {
            return { type: periodType as PeriodType }
        }

        return { type: 'currentMonth' }
    }

    const [currentFilter, setCurrentFilter] = useState<PeriodFilter>(
        getInitialFilter()
    )
    const [hasInitialLoad, setHasInitialLoad] = useState(false)

    // Función para generar la etiqueta del período
    const getPeriodLabel = (
        filter: PeriodFilter,
        periodInfo: StatsData['periodInfo']
    ): string => {
        const months = [
            t('filters.month.january'),
            t('filters.month.february'),
            t('filters.month.march'),
            t('filters.month.april'),
            t('filters.month.may'),
            t('filters.month.june'),
            t('filters.month.july'),
            t('filters.month.august'),
            t('filters.month.september'),
            t('filters.month.october'),
            t('filters.month.november'),
            t('filters.month.december'),
        ]

        switch (filter.type) {
            case 'allTime':
                return t('filters.period.allTime')
            case 'currentMonth':
                return t('filters.period.currentMonth')
            case 'currentYear':
                return t('filters.period.currentYear')
            case 'custom':
                if (filter.month !== undefined && filter.year) {
                    return `${months[filter.month]} ${filter.year}`
                }
                return t('filters.period.custom')
            default:
                return ''
        }
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/${locale}/login`)
        }
    }, [status, router, locale])

    const fetchStats = async (filter: PeriodFilter) => {
        try {
            setLoading(true)
            setError(false)

            // Construir URL con parámetros de filtrado
            const params = new URLSearchParams()
            params.append('periodType', filter.type)
            if (filter.year) params.append('year', filter.year.toString())
            if (filter.month !== undefined)
                params.append('month', filter.month.toString())

            const response = await fetch(
                `/api/dashboard/stats?${params.toString()}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch stats')
            }

            const data = await response.json()
            setStats(data)
        } catch (err) {
            console.error('Error fetching stats:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session && !hasInitialLoad) {
            fetchStats(currentFilter)
            setHasInitialLoad(true)
        }
    }, [session, hasInitialLoad])

    const handleFilterChange = (filter: PeriodFilter) => {
        setCurrentFilter(filter)

        // Actualizar URL con los parámetros del filtro
        const params = new URLSearchParams()
        params.set('periodType', filter.type)
        if (filter.year) params.set('year', filter.year.toString())
        if (filter.month !== undefined)
            params.set('month', filter.month.toString())

        router.push(`/${locale}/dashboard/stats?${params.toString()}`, {
            scroll: false,
        })

        fetchStats(filter)
    }

    const pageHeader = (
        <header className="tk-rise mb-8">
            <p className="font-mono text-[10px] tracking-[0.4em] text-ash">
                TIKIT / PANEL — /03
            </p>
            <h1 className="tk-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">
                {t('title')}
                <span className="text-thermal">.</span>
            </h1>
            <p className="mt-3 max-w-xl font-mono text-sm text-ink-2">
                {t('subtitle')}
            </p>
        </header>
    )

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="font-mono text-xs font-bold tracking-[0.4em]">
                    ▮▮▮<span className="tk-blink text-thermal">▮</span>
                </p>
            </div>
        )
    }

    if (!session) {
        return null
    }

    if (loading) {
        return (
            <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
                {pageHeader}
                <StatsSkeleton />
            </div>
        )
    }

    if (error) {
        return (
            <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
                {pageHeader}
                <div className="animate-shake border-[3px] border-danger p-8 text-center">
                    <AlertCircle className="mx-auto mb-4 h-10 w-10 text-danger" />
                    <p className="tk-condensed text-2xl text-danger">
                        {t('error')}
                    </p>
                    <button
                        onClick={() => fetchStats(currentFilter)}
                        className="tk-btn tk-btn-thermal mt-6"
                    >
                        ↻ {t('retry')}
                    </button>
                </div>
            </div>
        )
    }

    if (!stats || stats.overview.ticketsCount === 0) {
        return (
            <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
                {pageHeader}
                <div className="border-[3px] border-dashed border-ink/30 p-10 text-center">
                    <Upload className="mx-auto mb-4 h-12 w-12 text-ink/40" />
                    <h3 className="tk-condensed text-2xl">
                        {t('noTickets')}
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm font-mono text-xs leading-relaxed text-ash">
                        {t('uploadFirst')}
                    </p>
                    <button
                        onClick={() =>
                            router.push(`/${locale}/dashboard/tickets`)
                        }
                        className="tk-btn tk-btn-ink mt-6"
                    >
                        {t('uploadFirst')} <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-10">
            {/* Header con filtros */}
            <div className="mb-8">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <header className="tk-rise">
                            <p className="font-mono text-[10px] tracking-[0.4em] text-ash">
                                TIKIT / PANEL — /03
                            </p>
                            <h1 className="tk-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">
                                {t('title')}
                                <span className="text-thermal">.</span>
                            </h1>
                            <p className="mt-3 max-w-xl font-mono text-sm text-ink-2">
                                {t('subtitle')}
                            </p>
                        </header>

                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                            <StatsPeriodFilter
                                onFilterChange={handleFilterChange}
                                availableYears={stats.availableYears}
                                initialFilter={currentFilter}
                            />
                            <ExportButtons
                                stats={stats}
                                periodLabel={getPeriodLabel(
                                    currentFilter,
                                    stats.periodInfo
                                )}
                                periodType={currentFilter.type}
                                year={currentFilter.year}
                                month={currentFilter.month}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Overview Cards */}
                <div className="tk-rise" style={{ animationDelay: '0.1s' }}>
                    <StatsOverview
                        totalSpent={stats.overview.totalSpent}
                        ticketsCount={stats.overview.ticketsCount}
                        monthTicketsCount={stats.overview.periodTicketsCount}
                        averagePerTicket={stats.overview.averagePerTicket}
                    />
                </div>

                {/* Charts Grid */}
                <div
                    className="tk-rise grid gap-8 lg:grid-cols-2"
                    style={{ animationDelay: '0.2s' }}
                >
                    <CategoryChart data={stats.byCategory} />
                    <TrendsChart data={stats.monthlyTrends} />
                </div>

                {/* Top Stores Full Width */}
                <div
                    className="tk-rise grid gap-8 lg:grid-cols-1"
                    style={{ animationDelay: '0.3s' }}
                >
                    <TopStoresChart data={stats.topStores} />
                </div>
            </div>
        </div>
    )
}

export default function StatsPage() {
    return (
        <Suspense fallback={<StatsSkeleton />}>
            <StatsContent />
        </Suspense>
    )
}
