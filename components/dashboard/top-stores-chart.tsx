'use client'

import { useTranslations } from 'next-intl'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface StoreData {
    store: string
    visits: number
    total: number
}

interface TopStoresChartProps {
    data: StoreData[]
}

const TOOLTIP_STYLE = {
    backgroundColor: '#f1f4ee',
    border: '2px solid #141b18',
    borderRadius: 0,
    fontFamily: 'var(--font-plex-mono), monospace',
    fontSize: 12,
} as const

export function TopStoresChart({ data }: TopStoresChartProps) {
    const t = useTranslations('dashboard.stats.topStores')

    if (!data || data.length === 0) {
        return (
            <div className="tk-card p-6">
                <h3 className="tk-condensed text-2xl">{t('title')}</h3>
                <p className="mt-1 font-mono text-xs text-ash">{t('subtitle')}</p>
                <div className="mt-6 flex h-64 items-center justify-center border-2 border-dashed border-ink/25 font-mono text-xs tracking-[0.2em] text-ash">
                    <p>{t('noData')}</p>
                </div>
            </div>
        )
    }

    // Limitar a los 5 primeros comercios para mejor visualización
    const topFive = data.slice(0, 5)

    return (
        <div className="tk-card p-4 sm:p-6">
            <div className="flex items-baseline justify-between gap-2">
                <h3 className="tk-condensed text-2xl">{t('title')}</h3>
                <p className="font-mono text-[10px] tracking-[0.25em] text-ash">▮▮▮</p>
            </div>
            <p className="mt-1 font-mono text-xs text-ash">{t('subtitle')}</p>

            <div className="mt-4 h-64 w-full sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topFive} layout="vertical">
                        <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="rgba(20, 27, 24,0.18)"
                        />
                        <XAxis
                            type="number"
                            stroke="#74847a"
                            fontSize={11}
                            fontFamily="var(--font-plex-mono), monospace"
                            tickLine={false}
                            axisLine={{ stroke: '#141b18', strokeWidth: 2 }}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <YAxis
                            dataKey="store"
                            type="category"
                            stroke="#74847a"
                            fontSize={11}
                            fontFamily="var(--font-plex-mono), monospace"
                            tickLine={false}
                            axisLine={false}
                            width={70}
                        />
                        <Tooltip
                            formatter={(value: number) =>
                                `€${value.toFixed(2)}`
                            }
                            cursor={{ fill: 'rgba(20, 27, 24,0.06)' }}
                            contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar
                            dataKey="total"
                            fill="#141b18"
                            stroke="#141b18"
                            radius={0}
                            barSize={26}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Ranking como conceptos de ticket */}
            <div className="mt-4 space-y-2 border-t-2 border-dashed border-ink/25 pt-4 sm:mt-6">
                {topFive.map((store, index) => (
                    <div
                        key={store.store}
                        className="flex items-baseline gap-2 font-mono text-xs sm:text-sm"
                    >
                        <span
                            className={`font-bold tabular-nums ${
                                index === 0 ? 'text-thermal' : 'text-ash'
                            }`}
                        >
                            #{index + 1}
                        </span>
                        <span className="truncate text-ink-2">
                            {store.store}
                        </span>
                        <span className="tk-dots-thin" aria-hidden="true" />
                        <span className="hidden shrink-0 text-ash sm:inline">
                            {store.visits} {t('visits')}
                        </span>
                        <span className="shrink-0 font-bold tabular-nums text-ink">
                            €{store.total.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
