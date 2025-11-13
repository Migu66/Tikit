/**
 * API endpoint para obtener recomendaciones de IA
 * GET /api/recommendations - Obtener recomendaciones del usuario
 * POST /api/recommendations/regenerate - Forzar regeneración de recomendaciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateRecommendations } from '@/lib/services/recommendations';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener parámetros
    const { searchParams } = new URL(request.url);
    const forceRegenerate = searchParams.get('regenerate') === 'true';

    // Verificar si hay recomendaciones recientes (menos de 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRecommendations = await prisma.recommendation.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Si no hay recomendaciones recientes o se fuerza regeneración, generarlas
    if (existingRecommendations.length === 0 || forceRegenerate) {
      console.log('[API Recommendations] Generando nuevas recomendaciones...');
      await updateRecommendations(user.id);

      // Obtener las recomendaciones recién creadas
      const newRecommendations = await prisma.recommendation.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      return NextResponse.json({
        recommendations: newRecommendations,
        generated: true,
      });
    }

    // Devolver recomendaciones existentes
    return NextResponse.json({
      recommendations: existingRecommendations,
      generated: false,
    });
  } catch (error) {
    console.error('[API Recommendations] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Forzar regeneración de recomendaciones
    console.log('[API Recommendations] Regenerando recomendaciones...');
    await updateRecommendations(user.id);

    // Obtener las nuevas recomendaciones
    const recommendations = await prisma.recommendation.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('[API Recommendations] Error al regenerar:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
