/**
 * Servicio de IA usando Groq para estructurar y clasificar datos de tickets
 * Groq es gratuito y muy rápido
 */

import Groq from 'groq-sdk';
import type { TicketData } from '@/types/ticket';
import { TicketCategory } from '@/types/ticket';

// Validar que la API Key esté configurada
if (!process.env.GROQ_API_KEY) {
  console.error(
    '❌ ERROR: GROQ_API_KEY no está configurada en las variables de entorno.'
  );
  console.error('Por favor, añade tu API Key de Groq al archivo .env');
  console.error('Obtén una clave gratuita en: https://console.groq.com/');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key', // Evitar que falle al importar
});

/**
 * Estructura los datos extraídos por OCR usando IA
 * @param ocrText - Texto extraído del ticket por OCR
 * @returns Datos estructurados del ticket
 */
export async function structureTicketData(
  ocrText: string
): Promise<TicketData> {
  // Validar que la API Key esté configurada
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'GROQ_API_KEY no está configurada. Por favor, añade tu API Key de Groq al archivo .env. Obtén una clave gratuita en: https://console.groq.com/'
    );
  }

  const prompt = `Eres un experto en procesar tickets de compra. Analiza el siguiente texto de un ticket y extrae la información en formato JSON.

Texto del ticket:
${ocrText}

Debes devolver ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "storeName": "nombre del establecimiento",
  "totalAmount": número decimal del importe total,
  "tax": número decimal del IVA (si aparece, sino null),
  "purchaseDate": fecha en formato ISO 8601,
  "products": [
    {
      "name": "nombre del producto",
      "quantity": número entero,
      "unitPrice": número decimal,
      "totalPrice": número decimal
    }
  ]
}

Reglas importantes:
- Si no encuentras la fecha exacta, usa la fecha actual
- Si no encuentras productos individuales, crea un producto genérico con el total
- Todos los precios deben ser números decimales
- Las cantidades deben ser números enteros
- NO incluyas texto adicional, solo el JSON
- Si un campo no está disponible, usa valores por defecto razonables`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Modelo gratuito y rápido
      temperature: 0.1, // Baja temperatura para respuestas más deterministas
      max_tokens: 2048,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';

    // Extraer JSON del texto (por si la IA añade texto adicional)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : responseText;

    const parsedData = JSON.parse(jsonText);

    // Validar y normalizar los datos
    return {
      storeName: parsedData.storeName || 'Establecimiento desconocido',
      totalAmount: parseFloat(parsedData.totalAmount) || 0,
      tax: parsedData.tax ? parseFloat(parsedData.tax) : undefined,
      purchaseDate: parsedData.purchaseDate
        ? new Date(parsedData.purchaseDate)
        : new Date(),
      products: Array.isArray(parsedData.products)
        ? parsedData.products.map((p: any) => ({
            name: p.name || 'Producto',
            quantity: parseInt(p.quantity) || 1,
            unitPrice: parseFloat(p.unitPrice) || 0,
            totalPrice: parseFloat(p.totalPrice) || 0,
          }))
        : [
            {
              name: 'Compra',
              quantity: 1,
              unitPrice: parseFloat(parsedData.totalAmount) || 0,
              totalPrice: parseFloat(parsedData.totalAmount) || 0,
            },
          ],
    };
  } catch (error) {
    console.error('Error al estructurar datos con IA:', error);
    
    // Si es un error de API Key
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error(
        'API Key de Groq inválida o no configurada. Verifica tu .env y obtén una clave en https://console.groq.com/'
      );
    }
    
    throw new Error('Error al procesar los datos del ticket con IA');
  }
}

/**
 * Clasifica un ticket en una categoría usando IA
 * @param storeName - Nombre del establecimiento
 * @param products - Lista de productos comprados
 * @returns Categoría asignada al ticket
 */
export async function classifyTicket(
  storeName: string,
  products: { name: string }[]
): Promise<TicketCategory> {
  // Validar que la API Key esté configurada
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY no configurada, usando categoría por defecto');
    return TicketCategory.OTROS;
  }

  const productNames = products.map((p) => p.name).join(', ');

  const prompt = `Clasifica el siguiente ticket en UNA de estas categorías: alimentacion, ocio, transporte, salud, hogar, otros.

Establecimiento: ${storeName}
Productos: ${productNames}

Responde ÚNICAMENTE con el nombre de la categoría en minúsculas, sin puntuación ni texto adicional.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 50,
    });

    const category =
      chatCompletion.choices[0]?.message?.content?.trim().toLowerCase() ||
      'otros';

    // Validar que sea una categoría válida
    const validCategories = Object.values(TicketCategory);
    if (validCategories.includes(category as TicketCategory)) {
      return category as TicketCategory;
    }

    return TicketCategory.OTROS;
  } catch (error) {
    console.error('Error al clasificar ticket:', error);
    return TicketCategory.OTROS;
  }
}
