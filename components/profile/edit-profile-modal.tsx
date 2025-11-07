'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
    setErrors({});
    setImagePreview(user.image || null);
    setSelectedImage(null);
  }, [user, isOpen]);

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

    setSelectedImage(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">{t('editProfile')}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
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
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt={t('imagePreview')}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      {imageLoading && <Loader2 className="w-8 h-8 text-white animate-spin" />}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {selectedImage ? t('changeImage') : t('selectImage')}
              </button>

              {selectedImage && (
                <button
                  type="button"
                  onClick={() => {
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
                  className="px-4 py-2 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t('cancelSelection')}
                </button>
              )}

              {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              {t('fullName')}
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder={t('namePlaceholder')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              {t('email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting || isGoogleUser}
              placeholder={t('emailPlaceholder')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {isGoogleUser && (
              <p className="text-slate-500 text-xs mt-1">
                {t('emailCannotBeChanged')}
              </p>
            )}
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
