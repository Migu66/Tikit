/**
 * @swagger
 * /api/profile/image:
 *   post:
 *     summary: Subir imagen de perfil
 *     description: Sube una nueva imagen de perfil del usuario a Cloudinary
 *     tags: [Profile]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de perfil (JPEG, PNG, WebP, máx 5MB)
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Archivo inválido
 *       401:
 *         description: No autorizado
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Validar que todas las variables de entorno estén presentes
if (
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    console.error('[Cloudinary Config Missing]', {
        cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET,
    })
}

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('[Cloudinary Config]', {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
})

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó archivo' },
                { status: 400 }
            )
        }

        console.log('[Upload Image] Archivo recibido:', {
            name: file.name,
            size: file.size,
            type: file.type,
            userId: session.user.id,
        })

        // Validar tipo de archivo
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Solo se permiten imágenes JPEG, PNG o WebP' },
                { status: 400 }
            )
        }

        // Validar tamaño de archivo
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'El archivo no debe exceder 5MB' },
                { status: 400 }
            )
        }

        // Convertir archivo a buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        console.log('[Upload Image] Buffer creado, tamaño:', buffer.length)

        try {
            // Método alternativo: usar upload en lugar de upload_stream
            console.log('[Attempting Cloudinary Upload]')

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'tikit/profile_images',
                        resource_type: 'auto',
                        public_id: `profile_${session.user.id}`,
                        overwrite: true,
                        quality: 'auto',
                        fetch_format: 'auto',
                    },
                    (error: any, result: any) => {
                        if (error) {
                            console.error('[Cloudinary Callback Error]', {
                                message: error.message,
                                http_code: error.http_code,
                                code: error.error?.error_code,
                                fullError: JSON.stringify(error),
                            })
                            reject(error)
                        } else {
                            console.log('[Cloudinary Callback Success]', {
                                public_id: result?.public_id,
                                url: result?.secure_url ? 'OK' : 'MISSING',
                            })
                            resolve(result)
                        }
                    }
                )

                uploadStream.on('error', (streamError: any) => {
                    console.error('[Cloudinary Stream Error Event]', {
                        message: streamError.message,
                        fullError: JSON.stringify(streamError),
                    })
                    reject(streamError)
                })

                console.log('[Starting Stream Upload]')
                uploadStream.end(buffer)
            })

            const cloudinaryResult = result as any

            if (!cloudinaryResult?.secure_url) {
                console.error('[No secure_url returned]', {
                    keys: Object.keys(cloudinaryResult || {}),
                    public_id: cloudinaryResult?.public_id,
                    url: cloudinaryResult?.url,
                })
                return NextResponse.json(
                    {
                        error: 'No se pudo obtener la URL de la imagen desde Cloudinary',
                    },
                    { status: 500 }
                )
            }

            console.log('[Image uploaded successfully]', {
                url: cloudinaryResult.secure_url,
            })

            // Actualizar la imagen del usuario en la base de datos
            const updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: { image: cloudinaryResult.secure_url },
            })

            console.log('[User updated in database]', {
                userId: updatedUser.id,
                hasImage: !!updatedUser.image,
            })

            return NextResponse.json({
                success: true,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    image: updatedUser.image,
                },
            })
        } catch (cloudinaryError: any) {
            console.error('[Cloudinary Error Caught]', {
                type: cloudinaryError?.constructor?.name,
                message: cloudinaryError?.message,
                http_code: cloudinaryError?.http_code,
                error_code: cloudinaryError?.error?.error_code,
                error_description: cloudinaryError?.error?.error_description,
                fullError: JSON.stringify(cloudinaryError),
            })

            const errorMessage =
                cloudinaryError?.message ||
                cloudinaryError?.error?.error_description ||
                'Error desconocido de Cloudinary'
            return NextResponse.json(
                { error: `Error al subir la imagen: ${errorMessage}` },
                { status: 500 }
            )
        }
    } catch (error: any) {
        console.error('[General Error in POST /api/profile/image]', {
            message: error?.message,
            fullError: JSON.stringify(error),
        })

        const errorMessage = error?.message || 'Error interno del servidor'
        return NextResponse.json(
            { error: `Error interno: ${errorMessage}` },
            { status: 500 }
        )
    }
}
