import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    startOfMonth,
    endOfMonth,
    subMonths,
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

        // Determinar el rango de fechas según el tipo de período
        switch (periodType) {
            case 'allTime':
                const firstTicket = await prisma.ticket.findFirst({
                    where: { userId: user.id },
                    orderBy: { purchaseDate: 'asc' },
                    select: { purchaseDate: true },
                })
                startDate = firstTicket
                    ? new Date(firstTicket.purchaseDate)
                    : startOfMonth(now)
                endDate = endOfMonth(now)
                break

            case 'currentYear':
                startDate = startOfYear(now)
                endDate = endOfYear(now)
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
                } else {
                    startDate = startOfMonth(now)
                    endDate = endOfMonth(now)
                }
                break

            case 'currentMonth':
            default:
                startDate = startOfMonth(now)
                endDate = endOfMonth(now)
                break
        }

        // Obtener tickets del período con productos
        const tickets = await prisma.ticket.findMany({
            where: {
                userId: user.id,
                purchaseDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                products: true,
            },
            orderBy: {
                purchaseDate: 'desc',
            },
        })

        return NextResponse.json({ tickets })
    } catch (error) {
        console.error('Error fetching tickets for export:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
