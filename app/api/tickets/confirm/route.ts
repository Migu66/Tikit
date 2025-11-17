/**
 * @swagger
 * /api/tickets/confirm:
 *   post:
 *     summary: Confirmar y guardar un ticket procesado
 *     description: Guarda definitivamente en la base de datos un ticket que fue previamente procesado por OCR
 *     tags: [Tickets]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeName
 *               - totalAmount
 *               - purchaseDate
 *               - products
 *               - imageUrl
 *             properties:
 *               storeName:
 *                 type: string
 *                 description: Nombre del comercio
 *               totalAmount:
 *                 type: number
 *                 description: Importe total
 *               tax:
 *                 type: number
 *                 description: IVA (opcional)
 *               category:
 *                 type: string
 *                 description: Categoría del ticket
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de compra
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     totalPrice:
 *                       type: number
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL de la imagen en Cloudinary
 *     responses:
 *       200:
 *         description: Ticket guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateRecommendations } from '@/lib/services/recommendations'

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Obtener los datos del ticket confirmado
        const body = await request.json()
        const {
            storeName,
            totalAmount,
            tax,
            category,
            purchaseDate,
            products,
            imageUrl,
        } = body

        // Validar datos requeridos
        if (!storeName || !totalAmount || !purchaseDate || !imageUrl) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            )
        }

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { error: 'Debe incluir al menos un producto' },
                { status: 400 }
            )
        }

        // Generar texto OCR para almacenar
        const ocrText = `${storeName}\n${purchaseDate}\nTotal: €${totalAmount}\nProductos:\n${products
            .map((p: any) => `- ${p.name} x${p.quantity} = €${p.totalPrice}`)
            .join('\n')}`

        // Convertir purchaseDate string a Date
        const purchaseDateObj = new Date(purchaseDate)

        // Guardar en base de datos
        console.log(
            '[Ticket Confirm] Guardando ticket confirmado en base de datos...'
        )

        const ticketData: any = {
            userId: session.user.id,
            storeName,
            totalAmount,
            tax: tax || null,
            category: category || 'otros',
            purchaseDate: purchaseDateObj,
            imageUrl,
            ocrText,
            products: {
                create: products.map((product: any) => ({
                    name: product.name,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice,
                    totalPrice: product.totalPrice,
                })),
            },
        }

        const ticket = await prisma.ticket.create({
            data: ticketData,
            include: {
                products: true,
            },
        })

        console.log('[Ticket Confirm] Ticket guardado exitosamente:', ticket.id)

        // Regenerar recomendaciones de IA en background
        updateRecommendations(session.user.id).catch((error) => {
            console.error(
                '[Ticket Confirm] Error al actualizar recomendaciones:',
                error
            )
        })

        return NextResponse.json({
            success: true,
            ticket: {
                id: ticket.id,
                storeName: ticket.storeName,
                totalAmount: ticket.totalAmount,
                tax: ticket.tax,
                category: ticket.category,
                purchaseDate: ticket.purchaseDate,
                imageUrl: ticket.imageUrl,
                products: (ticket as any).products || [],
                createdAt: ticket.createdAt,
            },
        })
    } catch (error) {
        console.error('[Ticket Confirm] Error al guardar ticket:', error)

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
