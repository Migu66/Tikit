'use client';

export function StatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overview Cards Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
