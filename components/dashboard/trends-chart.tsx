'use client';

import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
  month: string;
  amount: number;
  ticketsCount: number;
}

interface TrendsChartProps {
  data: TrendData[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#f1f4ee',
  border: '2px solid #141b18',
  borderRadius: 0,
  fontFamily: 'var(--font-plex-mono), monospace',
  fontSize: 12,
} as const;

export function TrendsChart({ data }: TrendsChartProps) {
  const t = useTranslations('dashboard.stats.trends');

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

  return (
    <div className="tk-card p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="tk-condensed text-2xl">{t('title')}</h3>
        <p className="font-mono text-[10px] tracking-[0.25em] text-ash">↗</p>
      </div>

      <div className="mt-4 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(20, 27, 24,0.18)" />
            <XAxis
              dataKey="month"
              stroke="#74847a"
              fontSize={11}
              fontFamily="var(--font-plex-mono), monospace"
              tickLine={false}
              axisLine={{ stroke: '#141b18', strokeWidth: 2 }}
            />
            <YAxis
              stroke="#74847a"
              fontSize={11}
              fontFamily="var(--font-plex-mono), monospace"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`€${value.toFixed(2)}`, t('spending')]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Line
              type="linear"
              dataKey="amount"
              stroke="#1f6e4f"
              strokeWidth={3}
              dot={{ fill: '#141b18', stroke: '#141b18', strokeWidth: 2, r: 3.5 }}
              activeDot={{ r: 6, fill: '#1f6e4f', stroke: '#141b18', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
