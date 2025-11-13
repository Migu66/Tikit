/**
 * Componente para mostrar una tarjeta de recomendación individual
 */

'use client';

import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  LightbulbIcon,
  InfoIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from 'lucide-react';

interface RecommendationCardProps {
  type: string;
  category?: string | null;
  message: string;
  severity: string;
  percentage?: number | null;
  amount?: number | null;
  createdAt: Date;
}

export function RecommendationCard({
  type,
  category,
  message,
  severity,
  percentage,
  amount,
  createdAt,
}: RecommendationCardProps) {
  const tCategories = useTranslations('categories');

  // Determinar icono según el tipo
  const getIcon = () => {
    switch (type) {
      case 'category_increase':
        return <TrendingUpIcon className="w-6 h-6" />;
      case 'category_decrease':
        return <TrendingDownIcon className="w-6 h-6" />;
      case 'saving_suggestion':
        return <LightbulbIcon className="w-6 h-6" />;
      case 'monthly_comparison':
        return <InfoIcon className="w-6 h-6" />;
      default:
        return <InfoIcon className="w-6 h-6" />;
    }
  };

  // Determinar estilos según severidad
  const getSeverityStyles = () => {
    switch (severity) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-800',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      className={`${styles.bg} border rounded-lg p-4 sm:p-5 transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} shrink-0 mt-0.5`}>{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm sm:text-base font-medium text-gray-900 leading-snug">
              {message}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
            {category && (
              <span className={`${styles.badge} px-2 py-0.5 rounded-full font-medium`}>
                {tCategories(category)}
              </span>
            )}

            {percentage !== null && percentage !== undefined && (
              <span className="flex items-center gap-1">
                {percentage > 0 ? (
                  <TrendingUpIcon className="w-3 h-3" />
                ) : (
                  <TrendingDownIcon className="w-3 h-3" />
                )}
                <span className="font-medium">
                  {percentage > 0 ? '+' : ''}
                  {percentage.toFixed(1)}%
                </span>
              </span>
            )}

            {amount !== null && amount !== undefined && (
              <span className="font-semibold">€{formatCurrency(amount)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
