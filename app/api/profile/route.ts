import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Datos recibidos:', body);
    console.log('ID de usuario de la sesión:', session.user.id);

    // Validar datos
    const data = updateProfileSchema.parse(body);
    console.log('Datos validados:', data);

    // Obtener información del usuario actual incluyendo sus cuentas
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
      },
    });

    if (!currentUser) {
      console.error('Usuario no encontrado con ID:', session.user.id);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar si el usuario tiene cuenta de Google
    const hasGoogleAccount = currentUser.accounts.some(
      (account) => account.provider === 'google'
    );

    // Si el usuario tiene cuenta de Google, no permitir cambio de email
    if (hasGoogleAccount && data.email && data.email !== session.user.email) {
      return NextResponse.json(
        { error: 'No se puede cambiar el correo en cuentas de Google' },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: { name?: string; email?: string } = {};
    
    if (data.name !== undefined && data.name !== '') {
      updateData.name = data.name;
    }
    
    if (data.email !== undefined && data.email !== '' && !hasGoogleAccount) {
      updateData.email = data.email;
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }

    console.log('Actualizando con:', updateData);

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
