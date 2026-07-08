'use client';

import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

/** Paleta de libro de cuentas: verde de interventor, tinta y tonos de piedra. */
const COLORS = [
  '#1f6e4f', // verde interventor
  '#141b18', // tinta
  '#a9812e', // latón
  '#3d5a63', // pizarra
  '#74847a', // ceniza
  '#c7cabf', // piedra clara
];

const TOOLTIP_STYLE = {
  backgroundColor: '#f1f4ee',
  border: '2px solid #141b18',
  borderRadius: 0,
  fontFamily: 'var(--font-plex-mono), monospace',
  fontSize: 12,
} as const;

export function CategoryChart({ data }: CategoryChartProps) {
  const t = useTranslations('dashboard.stats.byCategory');
  const tCategories = useTranslations('categories');

  if (!data || data.length === 0) {
    return (
      <div className="tk-card p-6">
        <h3 className="tk-condensed text-2xl">{t('title')}</h3>
        <p className="mt-1 font-mono text-xs text-ash">{t('subtitle')}</p>
        <div className="mt-6 flex h-64 items-center justify-center border-2 border-dashed border-ink/25 font-mono text-xs tracking-[0.2em] text-ash">
          <p>{t('noData')}</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: tCategories(item.category),
    value: item.amount,
    percentage: item.percentage,
  }));

  const renderLabel = (entry: any) => {
    return `${entry.percentage || 0}%`;
  };

  return (
    <div className="tk-card p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="tk-condensed text-2xl">{t('title')}</h3>
        <p className="font-mono text-[10px] tracking-[0.25em] text-ash">◔</p>
      </div>
      <p className="mt-1 font-mono text-xs text-ash">{t('subtitle')}</p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              innerRadius={46}
              paddingAngle={2}
              stroke="#f1f4ee"
              strokeWidth={2}
              fill="#141b18"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `€${value.toFixed(2)}`}
              contentStyle={TOOLTIP_STYLE}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda como conceptos de ticket */}
      <div className="mt-6 space-y-2 border-t-2 border-dashed border-ink/25 pt-4">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="flex items-baseline gap-2 font-mono text-xs sm:text-sm"
          >
            <span
              className="h-3 w-3 shrink-0 translate-y-0.5 border border-ink"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden="true"
            />
            <span className="truncate text-ink-2">{tCategories(item.category)}</span>
            <span className="tk-dots-thin" aria-hidden="true" />
            <span className="shrink-0 font-bold tabular-nums text-ink">
              €{item.amount.toFixed(2)}
            </span>
            <span className="w-12 shrink-0 text-right tabular-nums text-ash">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
