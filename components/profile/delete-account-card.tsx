'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DeleteAccountModal } from './delete-account-modal';

export function DeleteAccountCard() {
  const t = useTranslations('profile.deleteAccount');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Zona de peligro: borde termal y sello VOID */}
      <div className="border-[3px] border-danger bg-receipt">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <span className="tk-stamp shrink-0 text-lg text-danger" aria-hidden="true">
              VOID
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="tk-condensed text-2xl text-danger">{t('title')}</h3>
              <p className="mt-0.5 max-w-md font-mono text-xs leading-relaxed text-ink-2">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="tk-btn tk-btn-danger"
          >
            ✕ {t('deleteButton')}
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
