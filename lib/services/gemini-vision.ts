/**
 * Servicio para extraer datos de tickets usando OpenAI Vision (GPT-4o-mini)
 * Extrae información automáticamente de imágenes de tickets
 */

import OpenAI from 'openai';
import type { TicketData } from '@/types/ticket';

// Validar que la API Key esté configurada
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY no está configurada en .env');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Extrae datos estructurados de un ticket a partir de una imagen
 * Usa GPT-4o-mini Vision para analizar la imagen y extraer todos los datos
 * @param imageBuffer - Buffer de la imagen del ticket
 * @returns Datos estructurados del ticket
 */
export async function extractTicketDataFromImage(
  imageBuffer: Buffer
): Promise<TicketData> {
  try {
    // Validar API Key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Añádela al archivo .env'
      );
    }

    console.log('[OpenAI Vision] 📸 Analizando imagen del ticket...');

    // Convertir imagen a base64
    const base64Image = imageBuffer.toString('base64');

    // Llamar a OpenAI Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analiza esta imagen de un ticket de compra y extrae TODA la información en formato JSON.

IMPORTANTE: Extrae TODOS los productos que aparecen en el ticket con sus precios exactos.

Devuelve SOLO un objeto JSON válido con esta estructura:
{
  "storeName": "nombre del establecimiento",
  "purchaseDate": "YYYY-MM-DD",
  "totalAmount": número decimal del total,
  "tax": número decimal del IVA (o null si no aparece),
  "products": [
    {
      "name": "nombre exacto del producto",
      "quantity": cantidad (número entero),
      "unitPrice": precio unitario (número decimal),
      "totalPrice": precio total del producto (número decimal)
    }
  ]
}

Reglas:
- Extrae TODOS los productos visibles
- Si no ves la fecha, usa la fecha actual
- Todos los números deben ser decimales (usa punto, no coma)
- Si falta algún precio, calcula basándote en los datos disponibles
- NO añadas texto adicional, SOLO el JSON`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No se recibió respuesta de OpenAI Vision');
    }

    console.log('[OpenAI Vision] ✓ Imagen analizada');

    // Extraer JSON de la respuesta
    let jsonText = responseText.trim();

    // Remover markdown code blocks si existen
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```$/, '');
    }

    const ticketData: TicketData = JSON.parse(jsonText);

    // Validaciones y normalizaciones
    if (!ticketData.storeName) {
      ticketData.storeName = 'Establecimiento desconocido';
    }

    if (!ticketData.purchaseDate) {
      ticketData.purchaseDate = new Date();
    } else if (typeof ticketData.purchaseDate === 'string') {
      ticketData.purchaseDate = new Date(ticketData.purchaseDate);
    }

    if (!ticketData.products || ticketData.products.length === 0) {
      throw new Error('No se pudieron extraer productos de la imagen');
    }

    // Calcular precios faltantes
    ticketData.products = ticketData.products.map((product) => {
      if (!product.totalPrice && product.unitPrice && product.quantity) {
        product.totalPrice = product.unitPrice * product.quantity;
      }
      if (!product.unitPrice && product.totalPrice && product.quantity) {
        product.unitPrice = product.totalPrice / product.quantity;
      }
      if (!product.quantity) {
        product.quantity = 1;
      }
      return product;
    });

    // Validar/calcular total
    if (!ticketData.totalAmount) {
      ticketData.totalAmount = ticketData.products.reduce(
        (sum, product) => sum + (product.totalPrice || 0),
        0
      );
    }

    console.log('[OpenAI Vision] ✅ Ticket procesado exitosamente');
    console.log(`[OpenAI Vision] 🏪 Establecimiento: ${ticketData.storeName}`);
    console.log(`[OpenAI Vision] 🛒 Productos: ${ticketData.products.length}`);
    console.log(`[OpenAI Vision] 💰 Total: €${ticketData.totalAmount.toFixed(2)}`);

    return ticketData;
  } catch (error) {
    console.error('[OpenAI Vision] ❌ Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API Key de OpenAI inválida o no configurada');
      }
      if (error.message.includes('insufficient_quota')) {
        throw new Error('Créditos de OpenAI agotados. Recarga en https://platform.openai.com/account/billing');
      }
      throw new Error(`Error al analizar imagen: ${error.message}`);
    }
    
    throw new Error('Error al procesar la imagen del ticket');
  }
}
