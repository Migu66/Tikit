// Tipos para el módulo de estadísticas

export interface StatsOverview {
  totalSpent: number;
  ticketsCount: number;
  periodTicketsCount: number;
  averagePerTicket: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface TrendData {
  month: string;
  amount: number;
  ticketsCount: number;
}

export interface StoreData {
  store: string;
  visits: number;
  total: number;
}

export interface PeriodInfo {
  type: string;
  startDate: string;
  endDate: string;
}

export interface StatsData {
  overview: StatsOverview;
  byCategory: CategoryData[];
  monthlyTrends: TrendData[];
  topStores: StoreData[];
  availableYears: number[];
  periodInfo: PeriodInfo;
}

export interface StatsResponse {
  overview: StatsOverview;
  byCategory: CategoryData[];
  monthlyTrends: TrendData[];
  topStores: StoreData[];
  availableYears: number[];
  periodInfo: PeriodInfo;
}

export type PeriodType = 'allTime' | 'currentMonth' | 'currentYear' | 'custom';

export interface PeriodFilter {
  type: PeriodType;
  year?: number;
  month?: number;
}
