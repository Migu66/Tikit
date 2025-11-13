import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param locale - Locale para el formato (default: 'es-ES')
 * @returns String formateado con 2 decimales
 */
export function formatCurrency(amount: number | undefined | null, locale: string = 'es-ES'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00';
  }
  
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
