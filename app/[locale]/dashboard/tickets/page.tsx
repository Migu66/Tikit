'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { TicketUpload, TicketList } from '@/components/dashboard';

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.tickets');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleUploadSuccess = () => {
    // Incrementar el trigger para refrescar la lista
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      {/* Componente de subida */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('upload.title')}
        </h2>
        <TicketUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Lista de tickets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('list.title')}
        </h2>
        <TicketList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
