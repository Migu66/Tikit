'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4">
      <div className="tk-card flex max-h-[90vh] w-full max-w-4xl animate-fade-in flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-ink px-6 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.35em] text-ash">TIKIT — ARCHIVO</p>
            <h2 className="tk-condensed mt-1 truncate text-3xl">{ticket.storeName}</h2>
            <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-ash">
              {formatDate(ticket.purchaseDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer border-2 border-ink px-3 py-1.5 font-mono text-sm font-bold transition-colors duration-300 hover:bg-ink hover:text-paper"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Imagen del ticket - clickeable para ampliar */}
          <div className="relative">
            <button
              onClick={() => setIsImageExpanded(true)}
              className="group relative h-96 w-full cursor-zoom-in overflow-hidden border-2 border-ink bg-paper-2 p-0 transition-shadow duration-300 hover:shadow-[8px_10px_0_0_rgba(20, 27, 24,0.14)]"
              title={tList('expandImage')}
              aria-label={tList('expandImage')}
            >
              <Image
                src={ticket.imageUrl}
                alt={ticket.storeName}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute bottom-2 right-2 border-2 border-ink bg-receipt px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.2em]">
                ⊕ {tList('expandImage').toUpperCase()}
              </span>
            </button>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="tk-label mb-1.5">{t('storeName')}</label>
              <p className="tk-condensed text-xl">{ticket.storeName}</p>
            </div>

            <div>
              <label className="tk-label mb-1.5">{t('category')}</label>
              <span className="tk-chip text-ink">
                <span aria-hidden="true" className="text-thermal">●</span>
                {ticket.category ? tCategories(ticket.category) : tCategories('otros')}
              </span>
            </div>

            <div>
              <label className="tk-label mb-1.5">{t('purchaseDate')}</label>
              <p className="font-mono text-sm text-ink">{formatDate(ticket.purchaseDate)}</p>
            </div>

            {ticket.tax && (
              <div>
                <label className="tk-label mb-1.5">{t('tax')}</label>
                <p className="font-mono text-sm tabular-nums text-ink">{formatCurrency(ticket.tax)}</p>
              </div>
            )}
          </div>

          {/* Productos, como los conceptos del recibo */}
          {ticket.products && ticket.products.length > 0 && (
            <div>
              <h3 className="tk-condensed mb-3 border-t-2 border-dashed border-ink/25 pt-4 text-xl">
                {t('products')}
              </h3>
              <div className="space-y-1.5">
                {ticket.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-baseline gap-2 font-mono text-xs text-ink-2 sm:text-sm"
                  >
                    <span className="tabular-nums text-ash">{product.quantity}×</span>
                    <span className="truncate">{product.name}</span>
                    <span className="hidden tabular-nums text-ash sm:inline">
                      ({formatCurrency(product.unitPrice)})
                    </span>
                    <span className="tk-dots-thin" aria-hidden="true" />
                    <span className="shrink-0 font-bold tabular-nums text-ink">
                      {formatCurrency(product.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-[3px] border-thermal p-4">
            <div className="flex items-baseline justify-between">
              <label className="tk-condensed text-xl text-thermal">
                {t('totalAmount')}
              </label>
              <p className="tk-display text-3xl tabular-nums text-thermal">
                {formatCurrency(ticket.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t-2 border-dashed border-ink/25 bg-paper px-6 py-4">
          <button onClick={onClose} className="tk-btn tk-btn-ink">
            Cerrar
          </button>
        </div>
      </div>

      {/* Lightbox para imagen ampliada */}
      {isImageExpanded && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-ink/95 p-4"
          style={{ zIndex: 100 }}
          onClick={() => setIsImageExpanded(false)}
        >
          <button
            onClick={() => setIsImageExpanded(false)}
            className="absolute top-4 right-4 z-10 cursor-pointer border-2 border-paper px-3 py-1.5 font-mono text-sm font-bold text-paper transition-colors hover:bg-paper hover:text-ink"
            aria-label={tList('expandImage')}
          >
            ✕
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
    </div>,
    document.body
  );
}
