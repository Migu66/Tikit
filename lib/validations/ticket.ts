/**
 * Validaciones con Zod para tickets
 */

import { z } from 'zod';

// Validación para producto individual
export const ticketProductSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es requerido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  unitPrice: z.number().nonnegative('El precio unitario debe ser positivo o cero'),
  totalPrice: z.number().nonnegative('El precio total debe ser positivo o cero'),
});

// Validación para datos del ticket
export const ticketDataSchema = z.object({
  storeName: z.string().min(1, 'El nombre del establecimiento es requerido'),
  totalAmount: z.number().positive('El total debe ser mayor que cero'),
  tax: z.number().nonnegative().nullable().optional(),
  purchaseDate: z.date(),
  products: z.array(ticketProductSchema).min(1, 'Debe haber al menos un producto'),
  category: z.enum([
    'alimentacion',
    'ocio',
    'transporte',
    'salud',
    'hogar',
    'otros',
  ]).optional(),
});

// Validación para archivo subido
export const uploadFileSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) return false;
    
    // Validar tipo MIME
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    return validTypes.includes(file.type);
  }, {
    message: 'El archivo debe ser una imagen (JPEG, PNG, WebP) o PDF de máximo 10MB',
  }),
});

export type TicketProductInput = z.infer<typeof ticketProductSchema>;
export type TicketDataInput = z.infer<typeof ticketDataSchema>;
