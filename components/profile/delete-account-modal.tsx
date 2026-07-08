'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4">
      {/* Un recibo a punto de ser anulado */}
      <div className="relative w-full max-w-md animate-fade-in font-mono [box-shadow:14px_18px_0_0_rgba(20, 27, 24,0.3)]">
        <div className="tk-teeth tk-teeth-up [--tk-teeth-color:var(--color-receipt)]" />

        <div className="relative bg-receipt px-6 py-8">
          {/* Close Button */}
          {!isDeleting && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 cursor-pointer border-2 border-ink p-1.5 transition-colors duration-300 hover:bg-ink hover:text-paper"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Sello VOID */}
          <div className="mb-5 flex justify-center">
            <span className="tk-stamp flex items-center gap-2 text-2xl text-danger">
              <AlertTriangle className="h-6 w-6" />
              VOID
            </span>
          </div>

          {/* Title */}
          <h2 className="tk-condensed text-center text-2xl">
            {t('modalTitle')}
          </h2>

          {/* Warning Message */}
          <p className="mt-2 text-center text-xs leading-relaxed text-ink-2">
            {t('modalWarning')}
          </p>

          <div className="my-5 border-t-2 border-dashed border-ink/30" />

          {/* Verification Input */}
          <div className="mb-6">
            <label className="tk-label mb-2">
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
              className={error ? 'tk-input-error' : ''}
            />
            {error && (
              <p className="mt-2 text-xs font-bold text-danger">▲ {error}</p>
            )}

            {!hasPassword && (
              <p className="mt-2 text-[10px] tracking-wide text-ash">
                {t('confirmationHint')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="tk-btn tk-btn-ghost flex-1"
            >
              {t('cancelButton')}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="tk-btn tk-btn-danger flex-1"
            >
              {isDeleting ? (
                <span>
                  {t('deleting')}
                  <span className="tk-blink">_</span>
                </span>
              ) : (
                <>✕ {t('confirmButton')}</>
              )}
            </button>
          </div>

          {/* Additional Warning */}
          <p className="mt-4 text-center text-[10px] tracking-wide text-ash">
            {t('permanentWarning')}
          </p>
        </div>

        <div className="tk-teeth [--tk-teeth-color:var(--color-receipt)]" />
      </div>
    </div>,
    document.body
  );
}
