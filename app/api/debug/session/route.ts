/**
 * Endpoint de diagnóstico para verificar la sesión del usuario
 * TEMPORAL - Remover en producción final
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({
                authenticated: false,
                session: null,
            })
        }

        // Verificar si el usuario existe en la base de datos
        let userExists = null
        if (session.user.id) {
            userExists = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                },
            })
        }

        return NextResponse.json({
            authenticated: true,
            session: {
                userId: session.user.id,
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
            },
            userExistsInDB: !!userExists,
            dbUser: userExists,
        })
    } catch (error) {
        console.error('[Debug Session] Error:', error)
        return NextResponse.json(
            {
                error: 'Error al verificar sesión',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
