/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     description: Recupera estadísticas completas de gastos incluyendo totales, categorías, tendencias y comercios más frecuentados
 *     tags: [Dashboard]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: periodType
 *         schema:
 *           type: string
 *           enum: [currentMonth, currentYear, allTime, custom]
 *           default: currentMonth
 *         description: Tipo de período para las estadísticas
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Año para período personalizado
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Mes para período personalizado (0-11)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    startOfMonth,
    endOfMonth,
    subMonths,
    format,
    startOfYear,
    endOfYear,
} from 'date-fns'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Obtener parámetros de filtrado de la URL
        const { searchParams } = new URL(request.url)
        const periodType = searchParams.get('periodType') || 'currentMonth'
        const year = searchParams.get('year')
        const month = searchParams.get('month')

        const now = new Date()
        let startDate: Date
        let endDate: Date
        let trendsStartDate: Date

        // Determinar el rango de fechas según el tipo de período
        switch (periodType) {
            case 'allTime':
                // Para "todos los tiempos", usar la fecha del primer ticket
                const firstTicket = await prisma.ticket.findFirst({
                    where: { userId: user.id },
                    orderBy: { purchaseDate: 'asc' },
                    select: { purchaseDate: true },
                })
                startDate = firstTicket
                    ? new Date(firstTicket.purchaseDate)
                    : startOfMonth(now)
                endDate = endOfMonth(now)
                trendsStartDate = subMonths(now, 11) // Últimos 12 meses para tendencias
                break

            case 'currentYear':
                startDate = startOfYear(now)
                endDate = endOfYear(now)
                trendsStartDate = startOfMonth(subMonths(now, 11)) // Últimos 12 meses
                break

            case 'custom':
                if (year && month !== null) {
                    const customDate = new Date(
                        parseInt(year),
                        parseInt(month),
                        1
                    )
                    startDate = startOfMonth(customDate)
                    endDate = endOfMonth(customDate)
                    trendsStartDate = startOfMonth(subMonths(customDate, 5)) // 6 meses incluyendo el seleccionado
                } else {
                    startDate = startOfMonth(now)
                    endDate = endOfMonth(now)
                    trendsStartDate = startOfMonth(subMonths(now, 5))
                }
                break

            case 'currentMonth':
            default:
                startDate = startOfMonth(now)
                endDate = endOfMonth(now)
                trendsStartDate = startOfMonth(subMonths(now, 5)) // 6 meses incluyendo el actual
                break
        }

        // Obtener tickets del período seleccionado
        const periodTickets = await prisma.ticket.findMany({
            where: {
                userId: user.id,
                purchaseDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                totalAmount: true,
                category: true,
            },
        })

        // Calcular gasto total del período
        const totalSpent = periodTickets.reduce(
            (
                sum: number,
                ticket: { totalAmount: any; category: string | null }
            ) => {
                return sum + Number(ticket.totalAmount)
            },
            0
        )

        // Obtener total de tickets (todos los tiempos) para referencia
        const totalTicketsCount = await prisma.ticket.count({
            where: {
                userId: user.id,
            },
        })

        // Calcular promedio por ticket del período
        const averagePerTicket =
            periodTickets.length > 0 ? totalSpent / periodTickets.length : 0

        // === GASTOS POR CATEGORÍA ===
        const categoryData: Record<string, number> = {}
        periodTickets.forEach(
            (ticket: { totalAmount: any; category: string | null }) => {
                const category = ticket.category || 'otros'
                categoryData[category] =
                    (categoryData[category] || 0) + Number(ticket.totalAmount)
            }
        )

        const byCategory = Object.entries(categoryData)
            .map(([category, amount]) => ({
                category,
                amount: parseFloat(amount.toFixed(2)),
                percentage:
                    totalSpent > 0
                        ? parseFloat(((amount / totalSpent) * 100).toFixed(1))
                        : 0,
            }))
            .sort((a, b) => b.amount - a.amount)

        // === TENDENCIAS MENSUALES ===
        // Determinar cuántos meses mostrar basado en el tipo de período
        const monthsToShow =
            periodType === 'allTime' || periodType === 'currentYear' ? 12 : 6
        const monthlyTrends = []

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const monthDate = subMonths(endDate, i)
            const monthStart = startOfMonth(monthDate)
            const monthEnd = endOfMonth(monthDate)

            // Solo incluir meses dentro del rango del período seleccionado
            if (monthEnd < startDate) continue

            const tickets = await prisma.ticket.findMany({
                where: {
                    userId: user.id,
                    purchaseDate: {
                        gte: monthStart > startDate ? monthStart : startDate,
                        lte: monthEnd < endDate ? monthEnd : endDate,
                    },
                },
                select: {
                    totalAmount: true,
                },
            })

            const monthTotal = tickets.reduce(
                (sum: number, t: { totalAmount: any }) =>
                    sum + Number(t.totalAmount),
                0
            )

            monthlyTrends.push({
                month: format(monthDate, 'MMM yyyy'),
                amount: parseFloat(monthTotal.toFixed(2)),
                ticketsCount: tickets.length,
            })
        }

        // === COMERCIOS MÁS FRECUENTES ===
        // Obtener todos los tickets del período para normalizar nombres
        const storeTickets = await prisma.ticket.findMany({
            where: {
                userId: user.id,
                purchaseDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                storeName: true,
                totalAmount: true,
            },
        })

        // Función para normalizar nombres de comercios
        const normalizeStoreName = (name: string): string => {
            return name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ') // Normalizar espacios múltiples
                .replace(/[.,\-_]/g, '') // Eliminar puntuación común
                .replace(/\s+(s\.?a\.?|s\.?l\.?|ltd|inc|corp)$/i, '') // Eliminar sufijos legales
                .trim()
        }

        // Agrupar tickets por nombre normalizado
        const storeMap = new Map<
            string,
            {
                displayName: string
                visits: number
                total: number
                originalNames: Set<string>
            }
        >()

        storeTickets.forEach(
            (ticket: { storeName: string; totalAmount: any }) => {
                const normalized = normalizeStoreName(ticket.storeName)

                if (!storeMap.has(normalized)) {
                    storeMap.set(normalized, {
                        displayName: ticket.storeName, // Usar el primer nombre encontrado como display
                        visits: 0,
                        total: 0,
                        originalNames: new Set(),
                    })
                }

                const store = storeMap.get(normalized)!
                store.visits += 1
                store.total += Number(ticket.totalAmount)
                store.originalNames.add(ticket.storeName)

                // Si encontramos un nombre más corto y limpio, usarlo como display
                if (
                    ticket.storeName.length < store.displayName.length &&
                    !ticket.storeName.match(/[^a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑ]/)
                ) {
                    store.displayName = ticket.storeName
                }
            }
        )

        const topStores = Array.from(storeMap.values())
            .map((store) => ({
                store: store.displayName,
                visits: store.visits,
                total: parseFloat(store.total.toFixed(2)),
            }))
            .sort((a, b) => {
                // Primero ordenar por visitas (descendente)
                if (b.visits !== a.visits) {
                    return b.visits - a.visits
                }
                // Si tienen las mismas visitas, ordenar por total gastado (descendente)
                return b.total - a.total
            })
            .slice(0, 10)

        // === AÑOS DISPONIBLES ===
        // Obtener todos los años únicos de los tickets del usuario
        const allTickets = await prisma.ticket.findMany({
            where: { userId: user.id },
            select: { purchaseDate: true },
            orderBy: { purchaseDate: 'asc' },
        })

        const yearsSet = new Set<number>()
        allTickets.forEach((ticket: { purchaseDate: Date }) => {
            yearsSet.add(new Date(ticket.purchaseDate).getFullYear())
        })
        const availableYears = Array.from(yearsSet).sort((a, b) => b - a)

        const responseData = {
            overview: {
                totalSpent: parseFloat(totalSpent.toFixed(2)),
                ticketsCount: totalTicketsCount,
                periodTicketsCount: periodTickets.length,
                averagePerTicket: parseFloat(averagePerTicket.toFixed(2)),
            },
            byCategory,
            monthlyTrends,
            topStores,
            availableYears,
            periodInfo: {
                type: periodType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            },
        }

        return NextResponse.json(responseData)
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
