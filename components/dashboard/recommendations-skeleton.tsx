/**
 * Componente skeleton para las recomendaciones de IA
 */

export function RecommendationsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Recommendation cards skeleton */}
            <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6"
                    >
                        <div className="flex items-start gap-3 sm:gap-4">
                            {/* Icon skeleton */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
                            </div>

                            {/* Content skeleton */}
                            <div className="flex-1 min-w-0">
                                {/* Category badge skeleton */}
                                <div className="h-5 bg-gray-200 rounded-full w-24 mb-2"></div>

                                {/* Message skeleton */}
                                <div className="space-y-2 mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                </div>

                                {/* Metadata skeleton */}
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
