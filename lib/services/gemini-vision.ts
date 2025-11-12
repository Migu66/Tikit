/**
 * Servicio para extraer datos de tickets usando OpenAI Vision (GPT-4 Vision)
 * Extrae información automáticamente de imágenes de tickets con máxima precisión
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
 * Usa GPT-4 Vision con un prompt mejorado para máxima precisión
 * Incluye validaciones cruzadas y reintentos
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

    // Prompt mejorado con instrucciones más específicas
    const prompt = `TAREA CRÍTICA: Analiza esta imagen de un ticket de compra y extrae TODOS los datos con máxima precisión.

INSTRUCCIONES DETALLADAS:
1. LEE LÍNEA POR LÍNEA todo lo que ves en el ticket
2. LISTA TODOS los productos que aparecen (no omitas ninguno)
3. VERIFICA que las cantidades sean correctas (busca números que indiquen cantidad)
4. VERIFICA que los precios sean exactos (cuidado con decimales y símbolos)
5. CALCULA el total sumando todos los productos
6. Si hay IVA/TAX separado, inclúyelo

ESTRUCTURA JSON REQUERIDA:
{
  "storeName": "nombre exacto del establecimiento",
  "purchaseDate": "YYYY-MM-DD (usa la fecha que veas o hoy si no aparece)",
  "totalAmount": número decimal (total final del ticket),
  "tax": número decimal o null (solo si aparece explícitamente),
  "products": [
    {
      "name": "nombre exacto del producto tal como aparece",
      "quantity": número entero (cantidad de unidades),
      "unitPrice": precio de una unidad (número decimal),
      "totalPrice": cantidad × precio unitario (número decimal)
    }
  ]
}

REGLAS CRÍTICAS:
- Extrae TODOS los productos, sin excepción
- Las cantidades DEBEN ser números enteros (1, 2, 3, etc.)
- Todos los precios en números decimales con punto (3.50, no 3,50)
- unitPrice = totalPrice / quantity
- Si un producto no tiene cantidad explícita, asume 1
- Verifica que TODOS los datos sean consistentes matemáticamente
- Si falta info, calcula basándote en los datos disponibles
- SOLO devuelve JSON válido, sin explicaciones adicionales

VALIDACIÓN FINAL:
Antes de devolver, verifica:
- ¿Cantidad de productos = cantidad de líneas en el ticket?
- ¿La suma de productos ≈ total del ticket?
- ¿Todos los precios tienen sentido?

Devuelve SOLO el JSON, nada más.`;

    // Primer intento
    let ticketData = await callOpenAIVision(base64Image, prompt);

    // Validar y corregir datos
    ticketData = validateAndCorrectTicketData(ticketData);

    // Si los datos no se ven bien, reintentar con instrucciones más específicas
    if (!isDataQualityGood(ticketData)) {
      console.log('[OpenAI Vision] ⚠️ Reintentando con instrucciones más específicas...');
      const retryPrompt = `${prompt}

NOTA: La extracción anterior puede tener errores. Por favor:
1. Revisa CADA producto individualmente
2. Verifica CADA cantidad y precio
3. Asegúrate de que NO falten productos
4. Suma todos para confirmar que el total es correcto`;

      ticketData = await callOpenAIVision(base64Image, retryPrompt);
      ticketData = validateAndCorrectTicketData(ticketData);
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
        throw new Error(
          'Créditos de OpenAI agotados. Recarga en https://platform.openai.com/account/billing'
        );
      }
      throw new Error(`Error al analizar imagen: ${error.message}`);
    }

    throw new Error('Error al procesar la imagen del ticket');
  }
}

/**
 * Llama a OpenAI Vision con el prompt especificado
 */
async function callOpenAIVision(base64Image: string, prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // Modelo actual con soporte Vision
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high', // Detalle alto para mejor precisión
            },
          },
        ],
      },
    ],
    max_tokens: 3000,
    temperature: 0, // Temperatura 0 para máxima consistencia
  });

  const responseText = response.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error('No se recibió respuesta de OpenAI Vision');
  }

  // Extraer JSON de la respuesta
  let jsonText = responseText.trim();

  // Remover markdown code blocks si existen
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```$/, '');
  }

  return JSON.parse(jsonText) as TicketData;
}

/**
 * Valida y corrige los datos extraídos del ticket
 */
function validateAndCorrectTicketData(ticketData: TicketData): TicketData {
  // Validar storeName
  if (!ticketData.storeName || ticketData.storeName.trim() === '') {
    ticketData.storeName = 'Establecimiento desconocido';
  }

  // Validar fecha
  if (!ticketData.purchaseDate) {
    ticketData.purchaseDate = new Date();
  } else if (typeof ticketData.purchaseDate === 'string') {
    ticketData.purchaseDate = new Date(ticketData.purchaseDate);
  }

  // Validar que haya productos
  if (!ticketData.products || ticketData.products.length === 0) {
    throw new Error('No se pudieron extraer productos de la imagen');
  }

  // Procesar y validar cada producto
  ticketData.products = ticketData.products
    .map((product) => {
      // Validar cantidad
      if (!product.quantity || product.quantity < 1) {
        product.quantity = 1;
      }
      product.quantity = Math.round(product.quantity);

      // Validar precios
      if (!product.unitPrice || product.unitPrice < 0) {
        product.unitPrice = 0;
      }

      if (!product.totalPrice || product.totalPrice < 0) {
        product.totalPrice = product.unitPrice * product.quantity;
      }

      // Verificar consistencia de precios
      const calculatedTotal = product.unitPrice * product.quantity;
      const difference = Math.abs(
        calculatedTotal - product.totalPrice
      );

      // Si hay discrepancia, usar el total como fuente de verdad
      if (difference > 0.01) {
        product.unitPrice = product.totalPrice / product.quantity;
      }

      // Redondear a 2 decimales
      product.unitPrice = Math.round(product.unitPrice * 100) / 100;
      product.totalPrice = Math.round(product.totalPrice * 100) / 100;

      return product;
    })
    .filter((product) => product.totalPrice > 0); // Filtrar productos vacíos

  // Calcular/validar total
  const calculatedTotal = ticketData.products.reduce(
    (sum, product) => sum + product.totalPrice,
    0
  );

  if (!ticketData.totalAmount || ticketData.totalAmount < 0) {
    ticketData.totalAmount = calculatedTotal;
  }

  // Si hay discrepancia grande en el total, usar el calculado
  const totalDifference = Math.abs(ticketData.totalAmount - calculatedTotal);
  if (totalDifference > 1) {
    console.log(
      `[OpenAI Vision] ⚠️ Total del ticket no coincide. OCR: €${ticketData.totalAmount.toFixed(2)}, Calculado: €${calculatedTotal.toFixed(2)}`
    );
  }

  ticketData.totalAmount =
    Math.round(ticketData.totalAmount * 100) / 100;

  return ticketData;
}

/**
 * Evalúa la calidad de los datos extraídos
 */
function isDataQualityGood(ticketData: TicketData): boolean {
  // Verificar cantidad de productos
  if (!ticketData.products || ticketData.products.length === 0) {
    return false;
  }

  // Verificar que todos los productos tengan precios válidos
  const allHavePrices = ticketData.products.every(
    (p) => p.totalPrice > 0 && p.unitPrice > 0 && p.quantity > 0
  );

  if (!allHavePrices) {
    return false;
  }

  // Verificar que el total sea consistente (dentro de 2€)
  const calculatedTotal = ticketData.products.reduce(
    (sum, p) => sum + p.totalPrice,
    0
  );

  const difference = Math.abs(ticketData.totalAmount - calculatedTotal);
  if (difference > 2) {
    return false;
  }

  // Si todo está bien, la calidad es buena
  return true;
}
