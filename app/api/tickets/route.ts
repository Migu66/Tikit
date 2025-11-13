/**
 * API endpoint para gestión de tickets
 * POST /api/tickets - Subir y procesar nuevo ticket
 * GET /api/tickets - Obtener tickets del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractTicketDataFromImage } from '@/lib/services/gemini-vision';
import type { Prisma } from '@prisma/client';
import { classifyTicket } from '@/lib/services/ai';
import { uploadToCloudinary } from '@/lib/services/cloudinary';
import { ticketDataSchema } from '@/lib/validations/ticket';
import { updateRecommendations } from '@/lib/services/recommendations';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo y tamaño del archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Usa JPEG, PNG, WebP o PDF' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 10MB' },
        { status: 400 }
      );
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const imageBuffer: Buffer = Buffer.from(bytes);

    // PASO 1: Extraer datos con OpenAI Vision (GPT-4o-mini)
    console.log('[Ticket] Analizando imagen con OpenAI Vision...');
    const ticketData = await extractTicketDataFromImage(imageBuffer);

    // Validar datos estructurados
    const validationResult = ticketDataSchema.safeParse(ticketData);
    if (!validationResult.success) {
      console.error('[Ticket] Error de validación:', validationResult.error);
      return NextResponse.json(
        { error: 'Error al validar los datos del ticket', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // PASO 2: Clasificar ticket por categoría    // PASO 3: Clasificar ticket
    console.log('[Ticket] Clasificando ticket...');
    const category = await classifyTicket(
      ticketData.storeName,
      ticketData.products
    );

    // PASO 4: Subir imagen a Cloudinary
    console.log('[Ticket] Subiendo imagen a Cloudinary...');
    const imageUrl = await uploadToCloudinary(imageBuffer, session.user.id);

    // PASO 5: Devolver datos extraídos para confirmación
    console.log('[Ticket] Datos extraídos exitosamente');

    return NextResponse.json({
      success: true,
      extractedData: {
        storeName: ticketData.storeName,
        totalAmount: ticketData.totalAmount,
        tax: ticketData.tax,
        category,
        purchaseDate: ticketData.purchaseDate.toISOString(),
        products: ticketData.products,
      },
      imageUrl,
    });
  } catch (error) {
    console.error('[Ticket] Error al procesar ticket:', error);
    
    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de API Key de OpenAI
      if (error.message.includes('OPENAI_API_KEY') || error.message.includes('API key')) {
        return NextResponse.json(
          { 
            error: 'Configuración incompleta',
            message: 'La API Key de OpenAI no está configurada correctamente. Verifica tu archivo .env'
          },
          { status: 500 }
        );
      }
      
      // Error de créditos agotados
      if (error.message.includes('insufficient_quota') || error.message.includes('Créditos')) {
        return NextResponse.json(
          { 
            error: 'Créditos agotados',
            message: 'Los créditos de OpenAI se han agotado. Recarga en https://platform.openai.com/account/billing'
          },
          { status: 402 }
        );
      }
      
      if (error.message.includes('imagen')) {
        return NextResponse.json(
          { error: 'Error al procesar la imagen. Intenta con una imagen más clara del ticket.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Cloudinary')) {
        return NextResponse.json(
          { error: 'Error al guardar la imagen. Inténtalo de nuevo.' },
          { status: 500 }
        );
      }
      
      // Error genérico con mensaje específico
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');

    // Construir filtros
    const where: any = {
      userId: session.user.id,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    // Obtener tickets
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          products: true,
        },
        orderBy: {
          purchaseDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Ticket] Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId, storeName, totalAmount, tax, category, purchaseDate, products } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ID del ticket es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el ticket pertenece al usuario
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket || existingTicket.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Ticket no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Actualizar ticket y productos en una transacción
    const updatedTicket = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Eliminar productos antiguos
      await tx.ticketItem.deleteMany({
        where: { ticketId },
      });

      // Actualizar ticket
      const ticket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          storeName,
          totalAmount,
          tax: tax || null,
          category: category || null,
          purchaseDate: new Date(purchaseDate),
        },
      });

      // Crear nuevos productos
      if (products && products.length > 0) {
        await tx.ticketItem.createMany({
          data: products.map((p: any) => ({
            ticketId,
            name: p.name,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            totalPrice: p.totalPrice,
          })),
        });
      }

      // Obtener ticket actualizado con productos
      return await tx.ticket.findUnique({
        where: { id: ticketId },
        include: {
          products: true,
        },
      });
    });

    // Regenerar recomendaciones de IA en background
    updateRecommendations(session.user.id).catch((error) => {
      console.error('[Ticket] Error al actualizar recomendaciones:', error);
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('[Ticket] Error al actualizar ticket:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ID del ticket es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el ticket pertenece al usuario
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket || existingTicket.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Ticket no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Eliminar ticket (Prisma eliminará automáticamente los productos relacionados por la cascada)
    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    // Regenerar recomendaciones de IA en background
    updateRecommendations(session.user.id).catch((error) => {
      console.error('[Ticket] Error al actualizar recomendaciones:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket eliminado correctamente',
    });
  } catch (error) {
    console.error('[Ticket] Error al eliminar ticket:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
