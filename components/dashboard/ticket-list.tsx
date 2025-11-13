'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TicketViewModal } from './ticket-view-modal';
import { TicketConfirmModal } from './ticket-confirm-modal';
import { TicketDeleteModal } from './ticket-delete-modal';

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
  const tCategories = useTranslations('categories');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tickets');

      if (!response.ok) {
        throw new Error('Error al cargar los tickets');
      }

      const data = await response.json();
      // Ordenar tickets por fecha de creación (más reciente primero)
      const sortedTickets = (data.tickets || []).sort((a: Ticket, b: Ticket) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTickets(sortedTickets);
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

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleUpdateTicket = async (editedData: any) => {
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);

      const response = await fetch('/api/tickets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          storeName: editedData.storeName,
          totalAmount: editedData.totalAmount,
          tax: editedData.tax,
          category: editedData.category,
          purchaseDate: editedData.purchaseDate,
          products: editedData.products,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el ticket');
      }

      // Recargar tickets
      await fetchTickets();
      setIsEditModalOpen(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error('Error al actualizar ticket:', err);
      alert('Error al actualizar el ticket. Inténtalo de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTicket = async () => {
    if (!selectedTicket) return;

    try {
      setIsDeleting(true);

      const response = await fetch('/api/tickets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el ticket');
      }

      // Recargar tickets
      await fetchTickets();
      setIsDeleteModalOpen(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error('Error al eliminar ticket:', err);
      alert('Error al eliminar el ticket. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
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
          <div className="flex gap-4 items-start">
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
                    {tCategories(ticket.category)}
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

              {/* Botones de acción */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleViewTicket(ticket)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {t('list.view')}
                </button>
                <button
                  onClick={() => handleEditTicket(ticket)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('list.edit')}
                </button>
              </div>
            </div>

            {/* Botón de eliminar (X) */}
            <button
              onClick={() => handleDeleteTicket(ticket)}
              className="shrink-0 p-1.5 text-gray-400 bg-red-50 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors self-start cursor-pointer"
              title="Eliminar ticket"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Modal de visualización */}
      <TicketViewModal
        isOpen={isViewModalOpen}
        ticket={selectedTicket}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      {/* Modal de edición */}
      <TicketConfirmModal
        isOpen={isEditModalOpen}
        ticketData={selectedTicket ? {
          storeName: selectedTicket.storeName,
          totalAmount: selectedTicket.totalAmount,
          tax: selectedTicket.tax,
          purchaseDate: selectedTicket.purchaseDate,
          category: selectedTicket.category,
          products: selectedTicket.products.map(p => ({
            name: p.name,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            totalPrice: p.totalPrice,
          })),
        } : null}
        onConfirm={handleUpdateTicket}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedTicket(null);
        }}
        isProcessing={isUpdating}
      />

      {/* Modal de confirmación de eliminación */}
      <TicketDeleteModal
        isOpen={isDeleteModalOpen}
        ticketStoreName={selectedTicket?.storeName || ''}
        onConfirm={confirmDeleteTicket}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedTicket(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
