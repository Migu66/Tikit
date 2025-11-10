import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { verification, hasPassword } = body;

    // Obtener el usuario de la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Validar según el tipo de cuenta
    if (hasPassword) {
      // Si tiene contraseña, verificarla
      if (!user.password) {
        return NextResponse.json(
          { error: 'Esta cuenta no tiene contraseña configurada' },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(verification, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Contraseña incorrecta' },
          { status: 401 }
        );
      }
    } else {
      // Si es cuenta OAuth, verificar que escribió ELIMINAR o DELETE
      if (verification !== 'ELIMINAR' && verification !== 'DELETE') {
        return NextResponse.json(
          { error: 'Confirmación inválida' },
          { status: 400 }
        );
      }
    }

    // Eliminar cuenta del usuario
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    );
  }
}
