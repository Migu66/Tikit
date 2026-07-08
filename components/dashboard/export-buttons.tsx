'use client'

import { FileDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { StatsData } from '@/types/stats'
import { exportToPDF } from '@/lib/export-utils'

interface ExportButtonsProps {
    stats: StatsData | null
    periodLabel: string
    periodType: string
    year?: number
    month?: number
    disabled?: boolean
}

export function ExportButtons({
    stats,
    periodLabel,
    periodType,
    year,
    month,
    disabled = false,
}: ExportButtonsProps) {
    const t = useTranslations('dashboard.stats')
    const [loading, setLoading] = useState(false)

    const handleExportPDF = async () => {
        if (!stats) return

        try {
            setLoading(true)

            // Construir URL con parámetros de filtrado
            const params = new URLSearchParams()
            params.append('periodType', periodType)
            if (year) params.append('year', year.toString())
            if (month !== undefined) params.append('month', month.toString())

            // Obtener tickets del período
            const response = await fetch(
                `/api/dashboard/stats/tickets?${params.toString()}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch tickets')
            }

            const { tickets } = await response.json()

            const translations = {
                title: t('title'),
                period: t('export.period'),
                overview: {
                    title: t('overview.title'),
                    totalSpent: t('overview.totalSpent'),
                    ticketsCount: t('overview.ticketsCount'),
                    averageTicket: t('overview.averageTicket'),
                },
                byCategory: {
                    title: t('byCategory.title'),
                    category: t('byCategory.category'),
                    amount: t('byCategory.amount'),
                    percentage: t('byCategory.percentage'),
                },
                trends: {
                    title: t('trends.title'),
                    month: t('trends.month'),
                    spending: t('trends.spending'),
                    tickets: t('export.tickets'),
                },
                topStores: {
                    title: t('topStores.title'),
                    store: t('topStores.store'),
                    visits: t('topStores.visits'),
                    total: t('topStores.total'),
                },
                ticketsDetail: {
                    title: t('export.ticketsDetail.title'),
                    date: t('export.ticketsDetail.date'),
                    store: t('export.ticketsDetail.store'),
                    category: t('export.ticketsDetail.category'),
                    total: t('export.ticketsDetail.total'),
                    products: t('export.ticketsDetail.products'),
                    quantity: t('export.ticketsDetail.quantity'),
                    unitPrice: t('export.ticketsDetail.unitPrice'),
                    price: t('export.ticketsDetail.price'),
                },
            }

            exportToPDF({ stats, periodLabel, tickets, translations })
        } catch (error) {
            console.error('Error exporting PDF:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleExportPDF}
                disabled={disabled || !stats || loading}
                className="tk-btn tk-btn-ink px-4! py-2.5! text-[11px]"
                title={t('export.pdfTooltip')}
            >
                <FileDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                    {loading ? t('export.loading') : t('export.pdf')}
                </span>
            </button>
        </div>
    )
}
