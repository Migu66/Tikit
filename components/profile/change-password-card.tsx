'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, CheckCircle2 } from 'lucide-react';
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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('title')}</h2>
              <p className="text-slate-600 text-sm">{t('subtitle')}</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Change Password Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <Lock className="w-5 h-5" />
            {t('changeButton')}
          </button>
        </div>
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
