'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { ChangePasswordModal } from './change-password-modal';

export function ChangePasswordCard() {
  const t = useTranslations('profile.changePassword');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSuccess = () => {
    setSuccess(t('success'));

    // Limpiar el mensaje de éxito después de 5 segundos
    setTimeout(() => {
      setSuccess(null);
    }, 5000);
  };

  return (
    <>
      <div className="tk-card-flat">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-paper-2">
              <Lock className="h-5 w-5 text-ink" />
            </span>
            <div>
              <h2 className="tk-condensed text-2xl">{t('title')}</h2>
              <p className="mt-0.5 font-mono text-xs text-ash">{t('subtitle')}</p>
            </div>
          </div>

          {/* Change Password Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="tk-btn tk-btn-ink"
          >
            {t('changeButton')} <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="animate-fade-in border-t-2 border-dashed border-ink/25 px-6 py-3 sm:px-8">
            <p className="font-mono text-xs font-bold tracking-wide text-ink">
              ✓ {success}
            </p>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
