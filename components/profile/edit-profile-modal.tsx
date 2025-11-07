'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2 } from 'lucide-react';
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
  onSave: (data: { name?: string; email?: string }) => Promise<void>;
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
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: user.name || '',
    email: user.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);

  // Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
    setErrors({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar datos
      const validated = editProfileSchema.parse(formData);

      // Limpiar strings vacíos
      const dataToSave: { name?: string; email?: string } = {};
      
      if (validated.name && validated.name.trim()) {
        dataToSave.name = validated.name.trim();
      }
      
      // No enviar email si es usuario de Google
      if (validated.email && validated.email.trim() && !isGoogleUser) {
        dataToSave.email = validated.email.trim();
      }

      // Verificar que hay algo que actualizar
      if (Object.keys(dataToSave).length === 0) {
        setErrors({ general: 'No hay cambios para guardar' });
        return;
      }

      setLocalLoading(true);
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

  const isSubmitting = isLoading || localLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
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
