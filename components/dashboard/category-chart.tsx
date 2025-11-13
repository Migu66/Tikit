'use client';

import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function CategoryChart({ data }: CategoryChartProps) {
  const t = useTranslations('dashboard.stats.byCategory');
  const tCategories = useTranslations('categories');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('title')}</h3>
        <p className="text-sm text-gray-600 mb-6">{t('subtitle')}</p>
        <div className="flex items-center justify-center h-64 text-gray-400">
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('title')}</h3>
      <p className="text-sm text-gray-600 mb-6">{t('subtitle')}</p>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `€${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-700">{tCategories(item.category)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900">€{item.amount.toFixed(2)}</span>
              <span className="text-gray-500">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
