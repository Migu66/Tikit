/**
 * Tipos para recomendaciones de IA
 */

export interface Recommendation {
  id: string;
  userId: string;
  type: 'category_increase' | 'category_decrease' | 'monthly_comparison' | 'saving_suggestion';
  category?: string | null;
  message: string;
  severity: 'info' | 'warning' | 'success';
  percentage?: number | null;
  amount?: number | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RecommendationType = Recommendation['type'];
export type RecommendationSeverity = Recommendation['severity'];
