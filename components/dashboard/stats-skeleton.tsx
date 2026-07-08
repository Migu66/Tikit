'use client';

export function StatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Overview skeleton: bloque de recibo */}
      <div className="tk-card-flat grid md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`px-6 py-6 ${i > 1 ? 'border-t-2 border-ink md:border-l-2 md:border-t-0' : ''}`}
          >
            <div className="animate-pulse">
              <div className="mb-4 h-3 w-1/2 bg-paper-2" />
              <div className="h-10 w-3/4 bg-paper-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="tk-card p-6">
            <div className="animate-pulse">
              <div className="mb-2 h-6 w-1/3 bg-paper-2" />
              <div className="mb-6 h-3 w-1/2 bg-paper-2" />
              <div className="h-64 border-2 border-dashed border-ink/15 bg-paper" />
            </div>
          </div>
        ))}
      </div>

      <div className="tk-card p-6">
        <div className="animate-pulse">
          <div className="mb-2 h-6 w-1/4 bg-paper-2" />
          <div className="mb-6 h-3 w-1/3 bg-paper-2" />
          <div className="h-56 border-2 border-dashed border-ink/15 bg-paper" />
        </div>
      </div>
    </div>
  );
}
