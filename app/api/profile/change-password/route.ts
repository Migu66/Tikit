import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Esquema de validación
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos del body
    const body = await req.json();
    
    // Validar datos
    const validation = changePasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        password: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga una cuenta con contraseña (no OAuth)
    const hasOAuthAccount = user.accounts.some(
      (account: { provider: string }) => account.provider !== 'credentials'
    );
    
    if (hasOAuthAccount && !user.password) {
      return NextResponse.json(
        { error: 'No puedes cambiar la contraseña de una cuenta OAuth' },
        { status: 403 }
      );
    }

    // Verificar que el usuario tenga una contraseña establecida
    if (!user.password) {
      return NextResponse.json(
        { error: 'No tienes una contraseña establecida' },
        { status: 403 }
      );
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      );
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Contraseña actualizada correctamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
