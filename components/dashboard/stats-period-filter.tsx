'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

export type PeriodType = 'allTime' | 'currentMonth' | 'currentYear' | 'custom';

export interface PeriodFilter {
  type: PeriodType;
  year?: number;
  month?: number;
}

interface StatsPeriodFilterProps {
  onFilterChange: (filter: PeriodFilter) => void;
  availableYears: number[];
  initialFilter?: PeriodFilter;
}

export function StatsPeriodFilter({ onFilterChange, availableYears, initialFilter }: StatsPeriodFilterProps) {
  const t = useTranslations('dashboard.stats.filters');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [periodType, setPeriodType] = useState<PeriodType>(initialFilter?.type || 'currentMonth');
  const [selectedYear, setSelectedYear] = useState<number>(initialFilter?.year || currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialFilter?.month ?? currentMonth);
  const [isOpen, setIsOpen] = useState(false);
  
  // Sincronizar estado cuando cambia initialFilter
  useEffect(() => {
    if (initialFilter) {
      setPeriodType(initialFilter.type);
      if (initialFilter.year) setSelectedYear(initialFilter.year);
      if (initialFilter.month !== undefined) setSelectedMonth(initialFilter.month);
    }
  }, [initialFilter]);

  const months = [
    { value: 0, label: t('month.january') },
    { value: 1, label: t('month.february') },
    { value: 2, label: t('month.march') },
    { value: 3, label: t('month.april') },
    { value: 4, label: t('month.may') },
    { value: 5, label: t('month.june') },
    { value: 6, label: t('month.july') },
    { value: 7, label: t('month.august') },
    { value: 8, label: t('month.september') },
    { value: 9, label: t('month.october') },
    { value: 10, label: t('month.november') },
    { value: 11, label: t('month.december') },
  ];

  const handleApplyFilters = () => {
    const filter: PeriodFilter = {
      type: periodType,
    };

    if (periodType === 'custom') {
      filter.year = selectedYear;
      filter.month = selectedMonth;
    }

    onFilterChange(filter);
    setIsOpen(false);
  };

  const handleReset = () => {
    setPeriodType('currentMonth');
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    onFilterChange({ type: 'currentMonth' });
    setIsOpen(false);
  };

  const getActiveFilterLabel = () => {
    switch (periodType) {
      case 'allTime':
        return t('period.allTime');
      case 'currentMonth':
        return t('period.currentMonth');
      case 'currentYear':
        return t('period.currentYear');
      case 'custom':
        return `${months[selectedMonth].label} ${selectedYear}`;
      default:
        return t('period.currentMonth');
    }
  };

  return (
    <div className="relative">
      {/* Botón de filtro */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex cursor-pointer items-center gap-2 border-2 border-ink bg-receipt px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-shadow duration-200 ${
          isOpen
            ? 'shadow-[4px_4px_0_0_var(--color-thermal)]'
            : 'hover:shadow-[4px_4px_0_0_rgba(20, 27, 24,0.35)]'
        }`}
      >
        <Filter className="h-3.5 w-3.5" />
        <span>{getActiveFilterLabel()}</span>
        <span aria-hidden="true" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Panel de filtros */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Contenido del panel */}
          <div className="tk-card absolute right-0 z-20 mt-3 w-80 animate-fade-in p-4">
            <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-ink/25 pb-3">
              <h3 className="tk-condensed flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                {t('title')}
              </h3>
            </div>

            {/* Tipo de período */}
            <div className="mb-4 space-y-3">
              <label className="tk-label mb-2">
                {t('period.label')}
              </label>

              <div className="space-y-1.5">
                {(
                  [
                    ['currentMonth', t('period.currentMonth')],
                    ['currentYear', t('period.currentYear')],
                    ['allTime', t('period.allTime')],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => {
                      setPeriodType(type);
                      onFilterChange({ type });
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                      periodType === type
                        ? 'bg-ink text-paper'
                        : 'text-ink-2 hover:bg-paper-2'
                    }`}
                  >
                    {label}
                    {periodType === type && (
                      <span aria-hidden="true" className="text-thermal">●</span>
                    )}
                  </button>
                ))}

                <button
                  onClick={() => setPeriodType('custom')}
                  className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                    periodType === 'custom'
                      ? 'bg-ink text-paper'
                      : 'text-ink-2 hover:bg-paper-2'
                  }`}
                >
                  {t('period.custom')}
                  {periodType === 'custom' && (
                    <span aria-hidden="true" className="text-thermal">●</span>
                  )}
                </button>
              </div>
            </div>

            {/* Selectores personalizados */}
            {periodType === 'custom' && (
              <div className="mb-4 space-y-3 border-t-2 border-dashed border-ink/25 pt-3">
                {/* Selector de año */}
                <div>
                  <label className="tk-label mb-1.5">
                    {t('year.label')}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="tk-input"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de mes */}
                <div>
                  <label className="tk-label mb-1.5">
                    {t('month.label')}
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="tk-input"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2 border-t-2 border-dashed border-ink/25 pt-3">
              <button
                onClick={handleReset}
                className="tk-btn tk-btn-ghost flex-1 px-3! py-2! text-[11px]"
              >
                {t('reset')}
              </button>
              {periodType === 'custom' && (
                <button
                  onClick={handleApplyFilters}
                  className="tk-btn tk-btn-thermal flex-1 px-3! py-2! text-[11px]"
                >
                  {t('apply')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
