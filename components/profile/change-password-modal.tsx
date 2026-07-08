'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const t = useTranslations('profile.changePassword');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<{
    general?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = t('errors.currentPasswordRequired');
    }
    
    if (!newPassword) {
      newErrors.newPassword = t('errors.newPasswordRequired');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('errors.passwordMin');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('errors.confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ currentPassword: t('errors.incorrectPassword') });
        } else if (response.status === 403) {
          setErrors({ general: t('errors.cannotChangeOAuth') });
        } else {
          setErrors({ general: result.error || t('errors.serverError') });
        }
        return;
      }
      
      // Éxito - llamar a onSuccess y cerrar modal
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setErrors({ general: t('errors.serverError') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4">
      <div className="tk-card mx-4 max-h-[90vh] w-full max-w-md animate-fade-in overflow-hidden overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b-2 border-ink bg-receipt p-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-ash">TIKIT — SEGURIDAD</p>
            <h2 className="tk-condensed mt-1 text-2xl">{t('title')}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer border-2 border-ink px-3 py-1.5 font-mono text-sm font-bold transition-colors duration-300 hover:bg-ink hover:text-paper disabled:opacity-50"
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

          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="tk-label">
              {t('currentPassword')}
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, currentPassword: undefined }));
                }}
                placeholder={t('currentPasswordPlaceholder')}
                disabled={isLoading}
                className={`tk-input pr-12 ${
                  errors.currentPassword 
                    ? 'tk-input-error'
                    : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="cursor-pointer text-ash transition-colors hover:text-thermal focus:outline-none"
                  tabIndex={-1}
                  aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.currentPassword && (
              <p className="font-mono text-xs font-bold text-danger">▲ {errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="tk-label">
              {t('newPassword')}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                placeholder={t('newPasswordPlaceholder')}
                disabled={isLoading}
                className={`tk-input pr-12 ${
                  errors.newPassword 
                    ? 'tk-input-error'
                    : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="cursor-pointer text-ash transition-colors hover:text-thermal focus:outline-none"
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.newPassword && (
              <p className="font-mono text-xs font-bold text-danger">▲ {errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="tk-label">
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder={t('confirmPasswordPlaceholder')}
                disabled={isLoading}
                className={`tk-input pr-12 ${
                  errors.confirmPassword 
                    ? 'tk-input-error'
                    : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer text-ash transition-colors hover:text-thermal focus:outline-none"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="font-mono text-xs font-bold text-danger">▲ {errors.confirmPassword}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t-2 border-dashed border-ink/25 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="tk-btn tk-btn-ghost flex-1"
            >
              {t('cancelButton')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="tk-btn tk-btn-ink flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  {t('saveButton')} <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
