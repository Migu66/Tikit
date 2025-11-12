'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 lg:mt-13 sm:mt-13">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('welcome')}, {session.user?.name}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">{t('home.subtitle')}</p>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {t('totalSpent')}
          </h3>
          <p className="text-3xl font-bold text-blue-600">$0.00</p>
          <p className="mt-2 text-sm text-gray-500">{t('thisMonth')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {t('ticketsCount')}
          </h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="mt-2 text-sm text-gray-500">Total de tickets</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Promedio por ticket
          </h3>
          <p className="text-3xl font-bold text-green-600">$0.00</p>
          <p className="mt-2 text-sm text-gray-500">{t('thisMonth')}</p>
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4 sm:mb-6">
            <svg
              className="mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('getStarted')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            {t('uploadFirstTicket')}
          </p>
          
          <button
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md cursor-pointer"
          >
            {t('uploadTicket')}
          </button>
          
          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900">Sube tu ticket</h3>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Captura o selecciona una imagen de tu ticket de compra
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900">Extracción automática</h3>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                La IA extrae automáticamente toda la información relevante
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900">Analiza y ahorra</h3>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Obtén insights sobre tus gastos y recomendaciones personalizadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

