'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { AlertTriangle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const t = useTranslations('profile.deleteAccount');
  const { data: session } = useSession();
  const [verification, setVerification] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const hasPassword = session?.user?.provider === 'credentials';

  const handleDelete = async () => {
    setError('');

    // Validar según el tipo de cuenta
    if (hasPassword) {
      if (!verification) {
        setError(t('errors.passwordRequired'));
        return;
      }
    } else {
      if (verification !== 'ELIMINAR' && verification !== 'DELETE') {
        setError(t('errors.invalidConfirmation'));
        return;
      }
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification,
          hasPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError(t('errors.incorrectPassword'));
        } else {
          setError(result?.error || t('errors.serverError'));
        }
        setIsDeleting(false);
        return;
      }

      // Cuenta eliminada exitosamente
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setError(t('errors.serverError'));
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setVerification('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        {!isDeleting && (
          <button
            onClick={handleClose}
            className="absolute rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        )}

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
          {t('modalTitle')}
        </h2>

        {/* Warning Message */}
        <p className="text-slate-600 text-center mb-6">
          {t('modalWarning')}
        </p>

        {/* Verification Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {hasPassword ? t('passwordLabel') : t('confirmationLabel')}
          </label>
          <Input
            type={hasPassword ? 'password' : 'text'}
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            placeholder={
              hasPassword ? t('passwordPlaceholder') : t('confirmationPlaceholder')
            }
            disabled={isDeleting}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          {!hasPassword && (
            <p className="text-slate-500 text-xs mt-2">
              {t('confirmationHint')}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('cancelButton')}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? t('deleting') : t('confirmButton')}
          </button>
        </div>

        {/* Additional Warning */}
        <p className="text-xs text-slate-500 text-center mt-4">
          {t('permanentWarning')}
        </p>
      </div>
    </div>
  );
}
