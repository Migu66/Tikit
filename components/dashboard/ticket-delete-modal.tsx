'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TicketDeleteModalProps {
  isOpen: boolean;
  ticketStoreName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function TicketDeleteModal({
  isOpen,
  ticketStoreName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: TicketDeleteModalProps) {
  const t = useTranslations('dashboard.tickets.delete');

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal: un recibo a punto de ser anulado */}
      <div className="relative w-full max-w-md animate-fade-in font-mono [box-shadow:14px_18px_0_0_rgba(20, 27, 24,0.3)]">
        <div className="tk-teeth tk-teeth-up [--tk-teeth-color:var(--color-receipt)]" />

        <div className="bg-receipt px-6 py-8">
          {/* Sello VOID */}
          <div className="mb-5 flex justify-center">
            <span className="tk-stamp text-2xl text-danger">VOID</span>
          </div>

          {/* Título */}
          <h3 className="tk-condensed text-center text-2xl">
            {t('title')}
          </h3>

          {/* Descripción */}
          <p className="mt-2 text-center text-xs leading-relaxed text-ink-2">
            {t('description')}
          </p>

          {/* Nombre del ticket */}
          <div className="my-5 border-t-2 border-dashed border-ink/30" />
          <p className="text-center">
            <span className="tk-condensed text-xl line-through decoration-danger decoration-[3px]">
              {ticketStoreName}
            </span>
          </p>
          <div className="my-5 border-t-2 border-dashed border-ink/30" />

          {/* Advertencia */}
          <div className="mb-6 border-2 border-danger px-3 py-2.5">
            <p className="text-center text-[11px] font-bold tracking-wide text-danger">
              ▲ {t('warning')}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="tk-btn tk-btn-ghost flex-1"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="tk-btn tk-btn-danger flex-1"
            >
              {isDeleting ? (
                <span>
                  {t('deleting')}
                  <span className="tk-blink">_</span>
                </span>
              ) : (
                <>✕ {t('confirm')}</>
              )}
            </button>
          </div>
        </div>

        <div className="tk-teeth [--tk-teeth-color:var(--color-receipt)]" />
      </div>
    </div>,
    document.body
  );
}
