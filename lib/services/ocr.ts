/**
 * Servicio de OCR usando OCR.space API (alternativa gratuita y confiable)
 * OCR.space es una API gratuita que funciona perfectamente con Next.js
 */

import type { OCRResult } from '@/types/ticket';
import axios from 'axios';

/**
 * Procesa una imagen y extrae el texto usando OCR.space API
 * @param imageBuffer - Buffer de la imagen a procesar
 * @returns Objeto con el texto extraído y el nivel de confianza
 */
export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<OCRResult> {
  try {
    console.log('[OCR] Iniciando reconocimiento de texto con OCR.space...');

    // Convertir el buffer a base64
    const base64Image = imageBuffer.toString('base64');

    // Llamar a OCR.space API usando axios con configuración optimizada
    const response = await axios.post('https://api.ocr.space/parse/image', 
      {
        base64Image: base64Image,
        language: 'spa',
        isOverlayRequired: false,
        detectOrientation: true,
        scale: true,
        OCREngine: 1, // Engine 1 es más rápido que Engine 2
        filetype: 'JPG', // Especificar el tipo de archivo explícitamente
      },
      {
        headers: {
          'apikey': process.env.OCR_SPACE_API_KEY || 'K87899142388957',
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos de timeout
      }
    );

    const data = response.data;

    if (data.IsErroredOnProcessing) {
      console.error('[OCR] Error procesando:', data.ErrorMessage);
      throw new Error(Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(', ') : data.ErrorMessage);
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('No se pudo extraer texto de la imagen');
    }

    const text = data.ParsedResults[0].ParsedText || '';
    
    if (!text || text.trim().length === 0) {
      throw new Error('No se encontró texto en la imagen');
    }

    console.log(`[OCR] ✓ Texto extraído exitosamente (${text.length} caracteres)`);

    return {
      text: text.trim(),
      confidence: 85,
    };
  } catch (error) {
    console.error('[OCR] Error:', error);
    if (error instanceof Error) {
      throw new Error(`Error al procesar la imagen con OCR: ${error.message}`);
    }
    throw new Error('Error al procesar la imagen con OCR');
  }
}

/**
 * Preprocesa el texto OCR para mejorar la calidad
 * @param text - Texto extraído por OCR
 * @returns Texto limpio y normalizado
 */
export function preprocessOCRText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalizar espacios en blanco
    .replace(/[|]/g, 'I') // Corregir | por I
    .trim();
}
