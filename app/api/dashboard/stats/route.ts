import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Obtener primer y último día del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Obtener tickets del mes actual
    const monthTickets = await prisma.ticket.findMany({
      where: {
        userId: user.id,
        purchaseDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        totalAmount: true,
      },
    });

    // Calcular gasto total del mes con precisión decimal
    const totalSpent = monthTickets.reduce((sum, ticket) => {
      return sum + Number(ticket.totalAmount);
    }, 0);

    // Obtener total de tickets (todos los tiempos)
    const totalTicketsCount = await prisma.ticket.count({
      where: {
        userId: user.id,
      },
    });

    // Calcular promedio por ticket del mes
    const averagePerTicket = monthTickets.length > 0 
      ? totalSpent / monthTickets.length 
      : 0;

    const responseData = {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      ticketsCount: totalTicketsCount,
      monthTicketsCount: monthTickets.length,
      averagePerTicket: parseFloat(averagePerTicket.toFixed(2)),
    };

    console.log('Dashboard stats:', {
      userId: user.id,
      monthTicketsLength: monthTickets.length,
      totalTicketsCount,
      totalSpent,
      averagePerTicket,
      responseData,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
