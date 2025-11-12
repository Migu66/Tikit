/**
 * Tipos relacionados con el procesamiento y gestión de tickets
 */

export interface TicketProduct {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TicketData {
  storeName: string;
  totalAmount: number;
  tax?: number;
  purchaseDate: Date;
  products: TicketProduct[];
  category?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ProcessedTicket {
  ticketData: TicketData;
  imageUrl: string;
  ocrText: string;
}

export enum TicketCategory {
  ALIMENTACION = 'alimentacion',
  OCIO = 'ocio',
  TRANSPORTE = 'transporte',
  SALUD = 'salud',
  HOGAR = 'hogar',
  OTROS = 'otros',
}
