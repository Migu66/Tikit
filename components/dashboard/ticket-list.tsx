'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface Ticket {
  id: string;
  storeName: string;
  totalAmount: number;
  tax?: number | null;
  category?: string | null;
  purchaseDate: string;
  imageUrl: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
}

interface TicketListProps {
  refreshTrigger?: number;
}

export function TicketList({ refreshTrigger = 0 }: TicketListProps) {
  const t = useTranslations('dashboard.tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tickets');

      if (!response.ok) {
        throw new Error('Error al cargar los tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshTrigger]);

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

  const getCategoryColor = (category?: string | null) => {
    const colors: Record<string, string> = {
      alimentacion: 'bg-green-100 text-green-800',
      ocio: 'bg-purple-100 text-purple-800',
      transporte: 'bg-blue-100 text-blue-800',
      salud: 'bg-red-100 text-red-800',
      hogar: 'bg-yellow-100 text-yellow-800',
      otros: 'bg-gray-100 text-gray-800',
    };

    return colors[category || 'otros'] || colors.otros;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-24 w-24 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {t('empty')}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{t('emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-4">
            {/* Imagen del ticket */}
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={ticket.imageUrl}
                alt={ticket.storeName}
                fill
                className="object-cover"
              />
            </div>

            {/* Información del ticket */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {ticket.storeName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(ticket.purchaseDate)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(ticket.totalAmount)}
                  </p>
                  {ticket.tax && (
                    <p className="text-xs text-gray-500">
                      IVA: {formatCurrency(ticket.tax)}
                    </p>
                  )}
                </div>
              </div>

              {/* Categoría */}
              {ticket.category && (
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                      ticket.category
                    )}`}
                  >
                    {ticket.category}
                  </span>
                </div>
              )}

              {/* Productos */}
              {ticket.products && ticket.products.length > 0 && (
                <div className="mt-3 space-y-1">
                  {ticket.products.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between text-xs text-gray-600"
                    >
                      <span className="truncate">
                        {product.quantity}x {product.name}
                      </span>
                      <span className="shrink-0 ml-2">
                        {formatCurrency(product.totalPrice)}
                      </span>
                    </div>
                  ))}
                  {ticket.products.length > 3 && (
                    <p className="text-xs text-gray-500 italic">
                      +{ticket.products.length - 3} productos más
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
