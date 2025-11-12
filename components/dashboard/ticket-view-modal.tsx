'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface TicketProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Ticket {
  id: string;
  storeName: string;
  totalAmount: number;
  tax?: number | null;
  category?: string | null;
  purchaseDate: string;
  imageUrl: string;
  products: TicketProduct[];
  createdAt: string;
}

interface TicketViewModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
}

export function TicketViewModal({ isOpen, ticket, onClose }: TicketViewModalProps) {
  const t = useTranslations('dashboard.tickets.confirm');
  const tList = useTranslations('dashboard.tickets.list');
  const tCategories = useTranslations('categories');
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  if (!isOpen || !ticket) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{ticket.storeName}</h2>
            <p className="text-sm text-gray-600 mt-1">{formatDate(ticket.purchaseDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Imagen del ticket - clickeable para ampliar */}
          <div className="relative">
            <button
              onClick={() => setIsImageExpanded(true)}
              className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 p-0 cursor-pointer hover:shadow-lg transition-shadow"
              title={tList('expandImage')}
              aria-label={tList('expandImage')}
            >
              <Image
                src={ticket.imageUrl}
                alt={ticket.storeName}
                fill
                className="object-contain"
              />
            </button>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storeName')}
              </label>
              <p className="text-gray-900 font-semibold">{ticket.storeName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('category')}
              </label>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {ticket.category ? tCategories(ticket.category) : tCategories('otros')}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('purchaseDate')}
              </label>
              <p className="text-gray-900">{formatDate(ticket.purchaseDate)}</p>
            </div>

            {ticket.tax && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tax')}
                </label>
                <p className="text-gray-900">{formatCurrency(ticket.tax)}</p>
              </div>
            )}
          </div>

          {/* Productos */}
          {ticket.products && ticket.products.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('products')}</h3>
              <div className="space-y-2">
                {ticket.products.map((product) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="col-span-6 md:col-span-6">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    </div>
                    <div className="col-span-2 md:col-span-2 text-center">
                      <p className="text-sm text-gray-600">{product.quantity}x</p>
                    </div>
                    <div className="col-span-2 md:col-span-2 text-center">
                      <p className="text-sm text-gray-600">{formatCurrency(product.unitPrice)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-2 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-gray-900">
                {t('totalAmount')}
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(ticket.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Lightbox para imagen ampliada */}
      {isImageExpanded && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4"
          style={{ zIndex: 100 }}
          onClick={() => setIsImageExpanded(false)}
        >
          <button
            onClick={() => setIsImageExpanded(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label={tList('expandImage')}
          >
          </button>
          <div className="relative w-full h-full max-w-7xl max-h-[95vh]">
            <Image
              src={ticket.imageUrl}
              alt={ticket.storeName}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
