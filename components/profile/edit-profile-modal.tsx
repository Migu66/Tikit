'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ImageCropModal } from './image-crop-modal';
import { z } from 'zod';

interface User {
  id?: string;
  email?: string;
  name?: string | null;
  image?: string | null;
  provider?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name?: string; email?: string; image?: string }) => Promise<void>;
  user: User;
  isLoading: boolean;
}

// Esquema de validación
const editProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres').optional().or(z.literal('')),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export function EditProfileModal({ isOpen, onClose, onSave, user, isLoading }: EditProfileModalProps) {
  const t = useTranslations('profile');
  const isGoogleUser = user.provider === 'google';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: user.name || '',
    email: user.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
    setErrors({});
    
    // Limpiar preview anterior si era un blob URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(user.image || null);
    setSelectedImage(null);
    setShowCropModal(false);
    
    // Limpiar temp image
    if (tempImageSrc && tempImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(tempImageSrc);
    }
    setTempImageSrc('');
  }, [user, isOpen]);

  // Limpiar URLs de blob cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (tempImageSrc && tempImageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(tempImageSrc);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ image: 'Solo se permiten imágenes JPEG, PNG o WebP' });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: 'El archivo no debe exceder 5MB' });
      return;
    }

    // Limpiar errores
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    // Crear preview temporal para el crop
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convertir el blob a File
    const croppedFile = new File([croppedBlob], 'profile-image.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    setSelectedImage(croppedFile);

    // Crear preview de la imagen recortada con URL.createObjectURL (más eficiente)
    const previewUrl = URL.createObjectURL(croppedBlob);
    setImagePreview(previewUrl);

    // Cerrar modal de crop
    setShowCropModal(false);
    setTempImageSrc('');
  };

  const handleCancelCrop = () => {
    // Limpiar el tempImageSrc si es un blob URL
    if (tempImageSrc && tempImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(tempImageSrc);
    }
    
    setShowCropModal(false);
    setTempImageSrc('');
    // Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      console.log('Subiendo imagen a /api/profile/image...');
      
      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Error en respuesta:', errorData);
          throw new Error(errorData.error || `Error al subir imagen: ${response.status}`);
        } catch (parseError) {
          console.error('No se pudo parsear la respuesta de error:', parseError);
          throw new Error(`Error HTTP ${response.status}: ${response.statusText || 'Error desconocido'}`);
        }
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      if (!data.user?.image) {
        throw new Error('No se recibió URL de imagen del servidor');
      }
      
      return data.user.image;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      console.error('Error durante upload:', errorMessage);
      setErrors({ image: errorMessage });
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar datos
      const validated = editProfileSchema.parse(formData);

      // Limpiar strings vacíos
      const dataToSave: { name?: string; email?: string; image?: string } = {};
      
      if (validated.name && validated.name.trim()) {
        dataToSave.name = validated.name.trim();
      }
      
      // No enviar email si es usuario de Google
      if (validated.email && validated.email.trim() && !isGoogleUser) {
        dataToSave.email = validated.email.trim();
      }

      // Subir imagen si hay una seleccionada
      if (selectedImage) {
        const imageUrl = await uploadImage();
        if (!imageUrl) {
          // El error ya fue establecido en uploadImage
          setLocalLoading(false);
          return;
        }
        dataToSave.image = imageUrl;
      }

      // Verificar que hay algo que actualizar
      if (Object.keys(dataToSave).length === 0) {
        setErrors({ general: 'No hay cambios para guardar' });
        return;
      }

      setLocalLoading(true);
      setErrors({}); // Limpiar errores previos
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path.join('.');
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        // Verificar si el error tiene información de campo
        const fieldError = (error as any).fieldError;
        if (fieldError?.email) {
          setErrors({ email: fieldError.email });
        } else {
          setErrors({ general: error.message || 'Error al guardar los cambios' });
        }
      } else {
        console.error('Error al guardar:', error);
        setErrors({ general: 'Error al guardar los cambios' });
      }
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const isSubmitting = isLoading || localLoading || imageLoading;

  return (
    <>
      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCancelCrop}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />

      {/* Main Edit Profile Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4">
        <div className="tk-card mx-4 max-h-[90vh] w-full max-w-md animate-fade-in overflow-hidden overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-ink bg-receipt p-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-ash">TIKIT — FICHA</p>
            <h2 className="tk-condensed mt-1 text-2xl">{t('editProfile')}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer border-2 border-ink p-1.5 transition-colors duration-300 hover:bg-ink hover:text-paper disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* General Error */}
          {errors.general && (
            <div className="animate-shake border-2 border-danger px-3 py-2.5">
              <p className="font-mono text-xs font-bold tracking-wide text-danger">▲ {errors.general}</p>
            </div>
          )}

          {/* Profile Image Upload */}
          <div>
            <label className="tk-label mb-3">
              {t('profileImage') || 'Foto de Perfil'}
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="hidden"
              aria-label="Seleccionar imagen de perfil"
            />

            {/* Image Preview and Upload Area */}
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative flex w-full items-center justify-center border-2 border-ink bg-paper-2 p-4">
                  <img
                    src={imagePreview}
                    alt={t('imagePreview')}
                    className="max-h-64 max-w-full border-2 border-ink object-contain"
                  />
                  {selectedImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
                      {imageLoading && <Loader2 className="h-8 w-8 animate-spin text-paper" />}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-ink/40 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-colors duration-300 hover:border-ink hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {selectedImage ? t('changeImage') : t('selectImage')}
              </button>

              {selectedImage && (
                <button
                  type="button"
                  onClick={() => {
                    // Limpiar blob URL si existe
                    if (imagePreview && imagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(imagePreview);
                    }
                    
                    setSelectedImage(null);
                    setImagePreview(user.image || null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.image;
                      return newErrors;
                    });
                  }}
                  disabled={isSubmitting}
                  className="cursor-pointer px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ash transition-colors hover:text-thermal disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ✕ {t('cancelSelection')}
                </button>
              )}

              {errors.image && (
                <p className="font-mono text-xs font-bold text-danger">▲ {errors.image}</p>
              )}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-ink/25" />

          {/* Name Field */}
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              label={t('fullName')}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder={t('namePlaceholder')}
              error={errors.name}
            />
          </div>

          {/* Email Field */}
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label={t('email')}
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting || isGoogleUser}
              placeholder={t('emailPlaceholder')}
              error={errors.email}
            />
            {isGoogleUser && (
              <p className="mt-1.5 font-mono text-[10px] tracking-wide text-ash">
                {t('emailCannotBeChanged')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t-2 border-dashed border-ink/25 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="tk-btn tk-btn-ghost flex-1"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tk-btn tk-btn-ink flex-1"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('save')} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
