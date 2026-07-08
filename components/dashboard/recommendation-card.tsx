/**
 * Componente para mostrar una tarjeta de recomendación individual
 */

'use client';

import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

interface RecommendationCardProps {
  type: string;
  category?: string | null;
  message: string;
  severity: string;
  percentage?: number | null;
  amount?: number | null;
  createdAt: Date;
}

/**
 * Cada recomendación es una nota impresa: marca tipográfica según el tipo,
 * y el borde izquierdo dice la severidad (termal = aviso, tinta = ok).
 */
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

  // Marca tipográfica según el tipo de recomendación
  const getMark = () => {
    switch (type) {
      case 'category_increase':
        return '↑';
      case 'category_decrease':
        return '↓';
      case 'saving_suggestion':
        return '✳';
      case 'monthly_comparison':
        return '≈';
      default:
        return 'ℹ';
    }
  };

  // Severidad → color del filo y del sello
  const getSeverityStyles = () => {
    switch (severity) {
      case 'success':
        return { edge: 'border-l-ink', mark: 'text-ink', stamp: 'OK' };
      case 'warning':
        return { edge: 'border-l-thermal', mark: 'text-thermal', stamp: '!' };
      case 'info':
      default:
        return { edge: 'border-l-ash', mark: 'text-ash', stamp: 'i' };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      className={`group border-2 border-ink border-l-[6px] bg-receipt p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[6px_8px_0_0_rgba(20, 27, 24,0.14)] sm:p-5 ${styles.edge}`}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className={`tk-display shrink-0 text-3xl leading-none transition-transform duration-300 group-hover:-rotate-6 ${styles.mark}`}
        >
          {getMark()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-bold leading-snug text-ink">
            {message}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-ash">
            {category && (
              <span className="tk-chip text-ink">
                {tCategories(category)}
              </span>
            )}

            {percentage !== null && percentage !== undefined && (
              <span
                className={`font-bold tabular-nums ${
                  percentage > 0 ? 'text-thermal' : 'text-ink'
                }`}
              >
                {percentage > 0 ? '▲ +' : '▼ '}
                {percentage.toFixed(1)}%
              </span>
            )}

            {amount !== null && amount !== undefined && (
              <span className="font-bold tabular-nums text-ink">
                €{formatCurrency(amount)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
