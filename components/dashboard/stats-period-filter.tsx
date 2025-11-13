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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{getActiveFilterLabel()}</span>
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
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('title')}
              </h3>
            </div>

            {/* Tipo de período */}
            <div className="space-y-3 mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {t('period.label')}
              </label>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPeriodType('currentMonth');
                    onFilterChange({ type: 'currentMonth' });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    periodType === 'currentMonth'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('period.currentMonth')}
                </button>

                <button
                  onClick={() => {
                    setPeriodType('currentYear');
                    onFilterChange({ type: 'currentYear' });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    periodType === 'currentYear'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('period.currentYear')}
                </button>

                <button
                  onClick={() => {
                    setPeriodType('allTime');
                    onFilterChange({ type: 'allTime' });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    periodType === 'allTime'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('period.allTime')}
                </button>

                <button
                  onClick={() => setPeriodType('custom')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    periodType === 'custom'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('period.custom')}
                </button>
              </div>
            </div>

            {/* Selectores personalizados */}
            {periodType === 'custom' && (
              <div className="space-y-3 mb-4 pt-3 border-t border-gray-200">
                {/* Selector de año */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('year.label')}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('month.label')}
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {t('reset')}
              </button>
              {periodType === 'custom' && (
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
