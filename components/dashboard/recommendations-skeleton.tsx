/**
 * Componente skeleton para las recomendaciones de IA
 */

export function RecommendationsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-6 flex items-end justify-between border-b-2 border-dashed border-ink/25 pb-4">
                <div className="flex-1">
                    <div className="mb-2 h-6 w-48 bg-paper-2" />
                    <div className="h-3 w-64 bg-paper-2" />
                </div>
                <div className="h-10 w-32 bg-paper-2" />
            </div>

            {/* Recommendation cards skeleton */}
            <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((index) => (
                    <div
                        key={index}
                        className="border-2 border-ink/20 border-l-[6px] border-l-ink/30 bg-receipt p-4 sm:p-5"
                    >
                        <div className="flex items-start gap-4">
                            {/* Marca skeleton */}
                            <div className="h-8 w-8 shrink-0 bg-paper-2" />

                            {/* Content skeleton */}
                            <div className="min-w-0 flex-1">
                                <div className="mb-3 space-y-2">
                                    <div className="h-3.5 w-full bg-paper-2" />
                                    <div className="h-3.5 w-5/6 bg-paper-2" />
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="h-5 w-24 bg-paper-2" />
                                    <div className="h-4 w-16 bg-paper-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
