	/**
 * Servicio de recomendaciones inteligentes con IA
 * Analiza patrones de gasto y genera insights personalizados
 */

import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
});

export interface SpendingAnalysis {
  currentMonth: {
    total: number;
    byCategory: Record<string, number>;
    topStores: Array<{ store: string; amount: number; visits: number }>;
  };
  previousMonth: {
    total: number;
    byCategory: Record<string, number>;
  };
  changes: {
    totalChange: number;
    totalChangePercentage: number;
    categoryChanges: Array<{
      category: string;
      currentAmount: number;
      previousAmount: number;
      change: number;
      changePercentage: number;
    }>;
  };
}

export interface RecommendationData {
  type: 'category_increase' | 'category_decrease' | 'monthly_comparison' | 'saving_suggestion';
  category?: string;
  message: string;
  severity: 'info' | 'warning' | 'success';
  percentage?: number;
  amount?: number;
}

/**
 * Analiza los patrones de gasto del usuario
 */
export async function analyzeSpendingPatterns(userId: string): Promise<SpendingAnalysis> {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // Obtener tickets del mes actual
  const currentMonthTickets = await prisma.ticket.findMany({
    where: {
      userId,
      purchaseDate: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    select: {
      totalAmount: true,
      category: true,
      storeName: true,
    },
  });

  // Obtener tickets del mes anterior
  const previousMonthTickets = await prisma.ticket.findMany({
    where: {
      userId,
      purchaseDate: {
        gte: previousMonthStart,
        lte: previousMonthEnd,
      },
    },
    select: {
      totalAmount: true,
      category: true,
    },
  });

  // Calcular totales y por categoría del mes actual
  const currentTotal = currentMonthTickets.reduce((sum, t) => sum + Number(t.totalAmount), 0);
  const currentByCategory: Record<string, number> = {};
  const storeData: Record<string, { amount: number; visits: number }> = {};

  currentMonthTickets.forEach((ticket) => {
    const category = ticket.category || 'otros';
    currentByCategory[category] = (currentByCategory[category] || 0) + Number(ticket.totalAmount);

    const store = ticket.storeName;
    if (!storeData[store]) {
      storeData[store] = { amount: 0, visits: 0 };
    }
    storeData[store].amount += Number(ticket.totalAmount);
    storeData[store].visits += 1;
  });

  // Calcular totales del mes anterior
  const previousTotal = previousMonthTickets.reduce((sum, t) => sum + Number(t.totalAmount), 0);
  const previousByCategory: Record<string, number> = {};

  previousMonthTickets.forEach((ticket) => {
    const category = ticket.category || 'otros';
    previousByCategory[category] = (previousByCategory[category] || 0) + Number(ticket.totalAmount);
  });

  // Top comercios
  const topStores = Object.entries(storeData)
    .map(([store, data]) => ({
      store,
      amount: data.amount,
      visits: data.visits,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Calcular cambios
  const totalChange = currentTotal - previousTotal;
  const totalChangePercentage = previousTotal > 0 ? (totalChange / previousTotal) * 100 : 0;

  // Cambios por categoría
  const allCategories = new Set([
    ...Object.keys(currentByCategory),
    ...Object.keys(previousByCategory),
  ]);

  const categoryChanges = Array.from(allCategories)
    .map((category) => {
      const currentAmount = currentByCategory[category] || 0;
      const previousAmount = previousByCategory[category] || 0;
      const change = currentAmount - previousAmount;
      const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

      return {
        category,
        currentAmount,
        previousAmount,
        change,
        changePercentage,
      };
    })
    .filter((c) => c.currentAmount > 0 || c.previousAmount > 0)
    .sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage));

  return {
    currentMonth: {
      total: currentTotal,
      byCategory: currentByCategory,
      topStores,
    },
    previousMonth: {
      total: previousTotal,
      byCategory: previousByCategory,
    },
    changes: {
      totalChange,
      totalChangePercentage,
      categoryChanges,
    },
  };
}

/**
 * Genera recomendaciones usando IA basadas en el análisis de gasto
 */
export async function generateRecommendations(
  userId: string,
  analysis: SpendingAnalysis
): Promise<RecommendationData[]> {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY no configurada, generando recomendaciones básicas');
    return generateBasicRecommendations(analysis);
  }

  const recommendations: RecommendationData[] = [];

  try {
    // Preparar contexto para la IA
    const context = `
Analiza estos datos de gasto del usuario y genera recomendaciones personalizadas en español:

MES ACTUAL:
- Gasto total: €${analysis.currentMonth.total.toFixed(2)}
- Por categoría: ${Object.entries(analysis.currentMonth.byCategory)
      .map(([cat, amount]) => `${cat}: €${amount.toFixed(2)}`)
      .join(', ')}
- Comercios principales: ${analysis.currentMonth.topStores
      .map((s) => `${s.store} (€${s.amount.toFixed(2)}, ${s.visits} visitas)`)
      .join(', ')}

MES ANTERIOR:
- Gasto total: €${analysis.previousMonth.total.toFixed(2)}
- Por categoría: ${Object.entries(analysis.previousMonth.byCategory)
      .map(([cat, amount]) => `${cat}: €${amount.toFixed(2)}`)
      .join(', ')}

CAMBIOS:
- Cambio total: ${analysis.changes.totalChangePercentage > 0 ? '+' : ''}${analysis.changes.totalChangePercentage.toFixed(1)}%
- Cambios por categoría: ${analysis.changes.categoryChanges
      .slice(0, 5)
      .map(
        (c) =>
          `${c.category}: ${c.changePercentage > 0 ? '+' : ''}${c.changePercentage.toFixed(1)}%`
      )
      .join(', ')}

Genera entre 3 y 6 recomendaciones en formato JSON. Cada recomendación debe tener:
{
  "type": "category_increase" | "category_decrease" | "monthly_comparison" | "saving_suggestion",
  "category": "nombre de categoría si aplica o null",
  "message": "mensaje personalizado en español, directo y útil",
  "severity": "info" | "warning" | "success",
  "percentage": número o null,
  "amount": número o null
}

Criterios:
- Menciona cambios significativos (>10%)
- Sugiere ahorros específicos basados en patrones
- Sé positivo cuando el gasto baja
- Sé constructivo cuando el gasto sube
- Usa emojis moderadamente
- Mensajes cortos y claros (máx 150 caracteres)
- Devuelve SOLO el array JSON, sin texto adicional
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Eres un asesor financiero experto que analiza patrones de gasto y da recomendaciones personalizadas, directas y útiles en español.',
        },
        {
          role: 'user',
          content: context,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '[]';

    // Extraer JSON del texto
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : responseText;

    const aiRecommendations = JSON.parse(jsonText);

    // Validar y normalizar recomendaciones de la IA
    aiRecommendations.forEach((rec: any) => {
      if (rec.message && rec.type && rec.severity) {
        recommendations.push({
          type: rec.type,
          category: rec.category || undefined,
          message: rec.message,
          severity: rec.severity,
          percentage: rec.percentage || undefined,
          amount: rec.amount || undefined,
        });
      }
    });

    // Si la IA no generó suficientes recomendaciones, complementar con básicas
    if (recommendations.length < 3) {
      const basicRecs = generateBasicRecommendations(analysis);
      recommendations.push(...basicRecs.slice(0, 5 - recommendations.length));
    }
  } catch (error) {
    console.error('Error al generar recomendaciones con IA:', error);
    // Fallback a recomendaciones básicas
    return generateBasicRecommendations(analysis);
  }

  return recommendations;
}

/**
 * Genera recomendaciones básicas sin IA (fallback)
 */
function generateBasicRecommendations(analysis: SpendingAnalysis): RecommendationData[] {
  const recommendations: RecommendationData[] = [];

  // Comparación mensual total
  if (analysis.changes.totalChangePercentage !== 0) {
    const isIncrease = analysis.changes.totalChangePercentage > 0;
    const absPercentage = Math.abs(analysis.changes.totalChangePercentage);

    if (absPercentage > 5) {
      recommendations.push({
        type: 'monthly_comparison',
        message: isIncrease
          ? `Tu gasto total aumentó ${absPercentage.toFixed(1)}% respecto al mes pasado`
          : `¡Bien! Este mes gastaste ${absPercentage.toFixed(1)}% menos que el mes anterior`,
        severity: isIncrease ? 'warning' : 'success',
        percentage: analysis.changes.totalChangePercentage,
        amount: Math.abs(analysis.changes.totalChange),
      });
    }
  }

  // Cambios significativos por categoría
  analysis.changes.categoryChanges.slice(0, 3).forEach((change) => {
    if (Math.abs(change.changePercentage) > 15) {
      const isIncrease = change.changePercentage > 0;
      const categoryName =
        {
          alimentacion: 'alimentación',
          ocio: 'ocio',
          transporte: 'transporte',
          salud: 'salud',
          hogar: 'hogar',
          otros: 'otros gastos',
        }[change.category] || change.category;

      recommendations.push({
        type: isIncrease ? 'category_increase' : 'category_decrease',
        category: change.category,
        message: isIncrease
          ? `Tu gasto en ${categoryName} aumentó ${Math.abs(change.changePercentage).toFixed(1)}% respecto al mes pasado`
          : `Tu gasto en ${categoryName} disminuyó ${Math.abs(change.changePercentage).toFixed(1)}% este mes`,
        severity: isIncrease ? 'warning' : 'success',
        percentage: change.changePercentage,
        amount: Math.abs(change.change),
      });
    }
  });

  // Sugerencias de ahorro basadas en gastos altos
  const highestCategory = Object.entries(analysis.currentMonth.byCategory).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (highestCategory && highestCategory[1] > 100) {
    const categoryName =
      {
        alimentacion: 'alimentación',
        ocio: 'ocio',
        transporte: 'transporte',
        salud: 'salud',
        hogar: 'hogar',
        otros: 'otros gastos',
      }[highestCategory[0]] || highestCategory[0];

    const potentialSaving = highestCategory[1] * 0.15;

    recommendations.push({
      type: 'saving_suggestion',
      category: highestCategory[0],
      message: `Podrías ahorrar hasta €${potentialSaving.toFixed(0)} reduciendo un 15% tu gasto en ${categoryName}`,
      severity: 'info',
      amount: potentialSaving,
    });
  }

  // Recomendación sobre comercios frecuentes
  if (analysis.currentMonth.topStores.length > 0) {
    const topStore = analysis.currentMonth.topStores[0];
    if (topStore.visits >= 3) {
      recommendations.push({
        type: 'saving_suggestion',
        message: `Visitaste ${topStore.store} ${topStore.visits} veces este mes. Considera planificar compras más grandes`,
        severity: 'info',
      });
    }
  }

  return recommendations.slice(0, 6);
}

/**
 * Guarda las recomendaciones en la base de datos
 */
export async function saveRecommendations(
  userId: string,
  recommendations: RecommendationData[]
): Promise<void> {
  // Eliminar recomendaciones antiguas (más de 30 días)
  const thirtyDaysAgo = subMonths(new Date(), 1);
  await prisma.recommendation.deleteMany({
    where: {
      userId,
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  // Eliminar recomendaciones del mes actual para regenerarlas
  const currentMonthStart = startOfMonth(new Date());
  await prisma.recommendation.deleteMany({
    where: {
      userId,
      createdAt: {
        gte: currentMonthStart,
      },
    },
  });

  // Crear nuevas recomendaciones
  if (recommendations.length > 0) {
    await prisma.recommendation.createMany({
      data: recommendations.map((rec) => ({
        userId,
        type: rec.type,
        category: rec.category || null,
        message: rec.message,
        severity: rec.severity,
        percentage: rec.percentage || null,
        amount: rec.amount || null,
      })),
    });
  }
}

/**
 * Función principal para generar y guardar recomendaciones
 */
export async function updateRecommendations(userId: string): Promise<void> {
  console.log('[Recommendations] Generando recomendaciones para usuario:', userId);

  // Analizar patrones de gasto
  const analysis = await analyzeSpendingPatterns(userId);

  // Verificar que hay datos suficientes
  if (analysis.currentMonth.total === 0 && analysis.previousMonth.total === 0) {
    console.log('[Recommendations] No hay datos suficientes para generar recomendaciones');
    return;
  }

  // Generar recomendaciones con IA
  const recommendations = await generateRecommendations(userId, analysis);

  // Guardar en base de datos
  await saveRecommendations(userId, recommendations);

  console.log('[Recommendations] Se generaron', recommendations.length, 'recomendaciones');
}
