/**
 * Servicio para subir imágenes a Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

// Validar que todas las variables de entorno estén presentes
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('[Cloudinary Config Missing - Tickets]', {
    cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET,
  });
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary
 * @param buffer - Buffer de la imagen
 * @param userId - ID del usuario (para organizar las imágenes)
 * @returns URL de la imagen subida
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  userId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `tikit/tickets/${userId}`,
        resource_type: 'image',
        transformation: [
          {
            quality: 'auto:good',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Error al subir a Cloudinary:', error);
          reject(new Error('Error al subir la imagen'));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('No se recibió respuesta de Cloudinary'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Elimina una imagen de Cloudinary
 * @param imageUrl - URL de la imagen a eliminar
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extraer el public_id de la URL
    const publicId = imageUrl
      .split('/')
      .slice(-3)
      .join('/')
      .replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error al eliminar de Cloudinary:', error);
    // No lanzar error, solo loguear
  }
}
