/**
 * Componente para mostrar lista de recomendaciones con estado de carga
 */

'use client'

import { useEffect, useState } from 'react'
import { RecommendationCard } from './recommendation-card'
import { RecommendationsSkeleton } from './recommendations-skeleton'
import { RefreshCwIcon } from 'lucide-react'

interface Recommendation {
    id: string
    type: string
    category?: string | null
    message: string
    severity: string
    percentage?: number | null
    amount?: number | null
    createdAt: string
}

interface RecommendationsListProps {
    locale: string
    translations: {
        title: string
        subtitle: string
        loading: string
        error: string
        retry: string
        noRecommendations: string
        noData: string
        regenerate: string
        regenerating: string
    }
}

export function RecommendationsList({
    locale,
    translations,
}: RecommendationsListProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [regenerating, setRegenerating] = useState(false)

    const fetchRecommendations = async (forceRegenerate = false) => {
        try {
            setLoading(true)
            setError(null)

            const url = forceRegenerate
                ? '/api/recommendations?regenerate=true'
                : '/api/recommendations'

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Error al cargar recomendaciones')
            }

            const data = await response.json()
            setRecommendations(data.recommendations || [])
        } catch (err) {
            console.error('Error fetching recommendations:', err)
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    const handleRegenerate = async () => {
        try {
            setRegenerating(true)
            setError(null)

            const response = await fetch('/api/recommendations', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Error al regenerar recomendaciones')
            }

            const data = await response.json()
            setRecommendations(data.recommendations || [])
        } catch (err) {
            console.error('Error regenerating recommendations:', err)
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setRegenerating(false)
        }
    }

    useEffect(() => {
        fetchRecommendations()
    }, [])

    if (loading) {
        return <RecommendationsSkeleton />
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2">
                    {translations.error}
                </p>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => fetchRecommendations()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    {translations.retry}
                </button>
            </div>
        )
    }

    if (recommendations.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {translations.noRecommendations}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    {translations.noData}
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {translations.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {translations.subtitle}
                    </p>
                </div>

                <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCwIcon
                        className={`w-4 h-4 ${
                            regenerating ? 'animate-spin' : ''
                        }`}
                    />
                    <span className="hidden sm:inline">
                        {regenerating
                            ? translations.regenerating
                            : translations.regenerate}
                    </span>
                </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {recommendations.map((rec) => (
                    <RecommendationCard
                        key={rec.id}
                        type={rec.type}
                        category={rec.category}
                        message={rec.message}
                        severity={rec.severity}
                        percentage={rec.percentage}
                        amount={rec.amount}
                        createdAt={new Date(rec.createdAt)}
                    />
                ))}
            </div>
        </div>
    )
}
