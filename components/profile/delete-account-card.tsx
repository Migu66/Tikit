'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { DeleteAccountModal } from './delete-account-modal';

export function DeleteAccountCard() {
  const t = useTranslations('profile.deleteAccount');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-red-200">
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg shrink-0">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {t('title')}
              </h3>
              <p className="text-slate-600 mb-4">
                {t('subtitle')}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
              >
                {t('deleteButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
