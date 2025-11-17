/**
 * @swagger
 * /api/profile/delete:
 *   delete:
 *     summary: Eliminar cuenta de usuario
 *     description: Elimina permanentemente la cuenta del usuario autenticado (requiere verificación)
 *     tags: [Profile]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verification
 *               - hasPassword
 *             properties:
 *               verification:
 *                 type: string
 *                 description: Contraseña del usuario o texto 'ELIMINAR'/'DELETE' para cuentas OAuth
 *               hasPassword:
 *                 type: boolean
 *                 description: Indica si la cuenta tiene contraseña (true) o es OAuth (false)
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *       401:
 *         description: No autorizado o contraseña incorrecta
 *       404:
 *         description: Usuario no encontrado
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { verification, hasPassword } = body

        // Obtener el usuario de la base de datos
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Validar según el tipo de cuenta
        if (hasPassword) {
            // Si tiene contraseña, verificarla
            if (!user.password) {
                return NextResponse.json(
                    { error: 'Esta cuenta no tiene contraseña configurada' },
                    { status: 400 }
                )
            }

            const isPasswordValid = await bcrypt.compare(
                verification,
                user.password
            )

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Contraseña incorrecta' },
                    { status: 401 }
                )
            }
        } else {
            // Si es cuenta OAuth, verificar que escribió ELIMINAR o DELETE
            if (verification !== 'ELIMINAR' && verification !== 'DELETE') {
                return NextResponse.json(
                    { error: 'Confirmación inválida' },
                    { status: 400 }
                )
            }
        }

        // Eliminar cuenta del usuario
        await prisma.account.deleteMany({
            where: { userId: user.id },
        })

        await prisma.session.deleteMany({
            where: { userId: user.id },
        })

        await prisma.user.delete({
            where: { id: user.id },
        })

        return NextResponse.json({
            success: true,
            message: 'Cuenta eliminada exitosamente',
        })
    } catch (error) {
        console.error('Error al eliminar cuenta:', error)
        return NextResponse.json(
            { error: 'Error al eliminar la cuenta' },
            { status: 500 }
        )
    }
}
