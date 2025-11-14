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

export function TopStoresChart({ data }: TopStoresChartProps) {
    const t = useTranslations('dashboard.stats.topStores')

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('title')}
                </h3>
                <p className="text-sm text-gray-600 mb-6">{t('subtitle')}</p>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <p>{t('noData')}</p>
                </div>
            </div>
        )
    }

    // Limitar a los 5 primeros comercios para mejor visualización
    const topFive = data.slice(0, 5)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('title')}
            </h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                {t('subtitle')}
            </p>

            <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topFive} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            stroke="#6b7280"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <YAxis
                            dataKey="store"
                            type="category"
                            stroke="#6b7280"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={70}
                        />
                        <Tooltip
                            formatter={(value: number) =>
                                `€${value.toFixed(2)}`
                            }
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                            }}
                        />
                        <Bar
                            dataKey="total"
                            fill="#10b981"
                            radius={[0, 4, 4, 0]}
                            barSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
                {topFive.map((store, index) => (
                    <div
                        key={store.store}
                        className="flex items-center justify-between text-xs sm:text-sm"
                    >
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-gray-500 font-medium">
                                #{index + 1}
                            </span>
                            <span className="text-gray-700 truncate">
                                {store.store}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-gray-500 hidden sm:inline">
                                {store.visits} {t('visits')}
                            </span>
                            <span className="font-semibold text-gray-900">
                                €{store.total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
