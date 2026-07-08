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
            <div className="animate-shake border-[3px] border-danger p-8 text-center">
                <p className="tk-display text-4xl text-danger">▲</p>
                <p className="tk-condensed mt-3 text-2xl text-danger">
                    {translations.error}
                </p>
                <p className="mt-2 font-mono text-xs text-ink-2">{error}</p>
                <button
                    onClick={() => fetchRecommendations()}
                    className="tk-btn tk-btn-thermal mt-6"
                >
                    ↻ {translations.retry}
                </button>
            </div>
        )
    }

    if (recommendations.length === 0) {
        return (
            <div className="border-[3px] border-dashed border-ink/30 py-14 text-center">
                <p className="tk-display text-5xl text-ink/15">✳</p>
                <h3 className="tk-condensed mt-4 text-2xl">
                    {translations.noRecommendations}
                </h3>
                <p className="mx-auto mt-2 max-w-sm font-mono text-xs leading-relaxed text-ash">
                    {translations.noData}
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-dashed border-ink/25 pb-4">
                <div>
                    <h2 className="tk-condensed text-2xl">
                        {translations.title}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-ash">
                        {translations.subtitle}
                    </p>
                </div>

                <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="tk-btn tk-btn-ink"
                >
                    <RefreshCwIcon
                        className={`h-3.5 w-3.5 ${
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
                {recommendations.map((rec, i) => (
                    <div
                        key={rec.id}
                        className="tk-rise"
                        style={{ animationDelay: `${i * 0.06}s` }}
                    >
                        <RecommendationCard
                            type={rec.type}
                            category={rec.category}
                            message={rec.message}
                            severity={rec.severity}
                            percentage={rec.percentage}
                            amount={rec.amount}
                            createdAt={new Date(rec.createdAt)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
