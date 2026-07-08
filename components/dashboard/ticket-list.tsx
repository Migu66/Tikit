'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { TicketViewModal } from './ticket-view-modal'
import { TicketConfirmModal } from './ticket-confirm-modal'
import { TicketDeleteModal } from './ticket-delete-modal'

interface Ticket {
    id: string
    storeName: string
    totalAmount: number
    tax?: number | null
    category?: string | null
    purchaseDate: string
    imageUrl: string
    products: Array<{
        id: string
        name: string
        quantity: number
        unitPrice: number
        totalPrice: number
    }>
    createdAt: string
}

interface TicketListProps {
    refreshTrigger?: number
}

export function TicketList({ refreshTrigger = 0 }: TicketListProps) {
    const t = useTranslations('dashboard.tickets')
    const tCategories = useTranslations('categories')
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchTickets = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/tickets')

            if (!response.ok) {
                throw new Error('Error al cargar los tickets')
            }

            const data = await response.json()
            // Ordenar tickets por fecha de creación (más reciente primero)
            const sortedTickets = (data.tickets || []).sort(
                (a: Ticket, b: Ticket) => {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                }
            )
            setTickets(sortedTickets)
        } catch (err) {
            console.error('Error al cargar tickets:', err)
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [refreshTrigger])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount)
    }

    // Cada categoría lleva su marca tipográfica, como el código de sección de un ticket
    const getCategoryMark = (category?: string | null) => {
        const marks: Record<string, string> = {
            alimentacion: '●',
            ocio: '◆',
            transporte: '▲',
            salud: '✚',
            hogar: '⌂',
            otros: '◯',
        }

        return marks[category || 'otros'] || marks.otros
    }

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsViewModalOpen(true)
    }

    const handleEditTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsEditModalOpen(true)
    }

    const handleUpdateTicket = async (editedData: any) => {
        if (!selectedTicket) return

        try {
            setIsUpdating(true)

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
            })

            if (!response.ok) {
                throw new Error('Error al actualizar el ticket')
            }

            // Recargar tickets
            await fetchTickets()
            setIsEditModalOpen(false)
            setSelectedTicket(null)
        } catch (err) {
            console.error('Error al actualizar ticket:', err)
            alert('Error al actualizar el ticket. Inténtalo de nuevo.')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsDeleteModalOpen(true)
    }

    const confirmDeleteTicket = async () => {
        if (!selectedTicket) return

        try {
            setIsDeleting(true)

            const response = await fetch('/api/tickets', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al eliminar el ticket')
            }

            // Recargar tickets
            await fetchTickets()
            setIsDeleteModalOpen(false)
            setSelectedTicket(null)
        } catch (err) {
            console.error('Error al eliminar ticket:', err)
            alert('Error al eliminar el ticket. Inténtalo de nuevo.')
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="font-mono text-xs font-bold tracking-[0.4em]">
                    ▮▮▮<span className="tk-blink text-thermal">▮</span>
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="animate-shake border-2 border-danger px-4 py-3">
                <p className="font-mono text-xs font-bold tracking-wide text-danger">
                    ▲ {error}
                </p>
            </div>
        )
    }

    if (tickets.length === 0) {
        return (
            <div className="border-[3px] border-dashed border-ink/30 py-14 text-center">
                <p className="tk-display text-5xl text-ink/15">∅</p>
                <h3 className="tk-condensed mt-4 text-2xl">{t('empty')}</h3>
                <p className="mx-auto mt-2 max-w-sm font-mono text-xs leading-relaxed text-ash">
                    {t('emptyDescription')}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket, index) => (
                <div
                    key={ticket.id}
                    className="tk-card-flat group p-4 transition-shadow duration-300 hover:shadow-[8px_10px_0_0_rgba(20, 27, 24,0.14)] sm:p-5"
                >
                    <div className="flex items-start gap-4">
                        {/* Imagen del ticket */}
                        <div className="relative hidden h-24 w-20 shrink-0 overflow-hidden border-2 border-ink sm:block">
                            <Image
                                src={ticket.imageUrl}
                                alt={ticket.storeName}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        {/* Información del ticket y acciones */}
                        <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex w-full items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-mono text-[9px] tracking-[0.3em] text-ash">
                                        Nº {String(index + 1).padStart(4, '0')}
                                    </p>
                                    <h3 className="tk-condensed block w-full truncate text-xl sm:text-2xl">
                                        {ticket.storeName}
                                    </h3>
                                    <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-ash">
                                        {formatDate(ticket.purchaseDate)}
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-col items-end">
                                    <p className="tk-display text-2xl tabular-nums sm:text-3xl">
                                        {formatCurrency(ticket.totalAmount)}
                                    </p>
                                    {ticket.tax && (
                                        <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-ash">
                                            IVA {formatCurrency(ticket.tax)}
                                        </p>
                                    )}
                                    {/* Botón de eliminar (X) solo en móvil */}
                                    <button
                                        onClick={() =>
                                            handleDeleteTicket(ticket)
                                        }
                                        className="mt-2 block cursor-pointer border-2 border-thermal px-2 py-0.5 font-mono text-xs font-bold text-thermal transition-colors hover:bg-thermal hover:text-paper md:hidden"
                                        title="Eliminar ticket"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Categoría */}
                            {ticket.category && (
                                <div className="mt-3">
                                    <span className="tk-chip text-ink">
                                        <span aria-hidden="true" className="text-thermal">
                                            {getCategoryMark(ticket.category)}
                                        </span>
                                        {tCategories(ticket.category)}
                                    </span>
                                </div>
                            )}

                            {/* Productos, como los conceptos del recibo */}
                            {ticket.products && ticket.products.length > 0 && (
                                <div className="mt-3 space-y-1 border-t-2 border-dashed border-ink/15 pt-3">
                                    {ticket.products
                                        .slice(0, 3)
                                        .map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-baseline gap-2 font-mono text-xs text-ink-2"
                                            >
                                                <span className="truncate">
                                                    {product.quantity}×{' '}
                                                    {product.name}
                                                </span>
                                                <span className="tk-dots-thin" aria-hidden="true" />
                                                <span className="shrink-0 tabular-nums">
                                                    {formatCurrency(
                                                        product.totalPrice
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    {ticket.products.length > 3 && (
                                        <p className="font-mono text-[10px] tracking-[0.2em] text-ash">
                                            +{ticket.products.length - 3} ···
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleViewTicket(ticket)}
                                    className="tk-btn tk-btn-ghost flex-1 px-3! py-2! text-[11px]"
                                >
                                    {t('list.view')}
                                </button>
                                <button
                                    onClick={() => handleEditTicket(ticket)}
                                    className="tk-btn tk-btn-ink flex-1 px-3! py-2! text-[11px]"
                                >
                                    {t('list.edit')}
                                </button>
                                {/* Botón de eliminar (X) en desktop */}
                                <button
                                    onClick={() => handleDeleteTicket(ticket)}
                                    className="hidden shrink-0 cursor-pointer items-center border-2 border-thermal px-3 font-mono text-sm font-bold text-thermal transition-colors duration-300 hover:bg-thermal hover:text-paper md:flex"
                                    title="Eliminar ticket"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal de visualización */}
            <TicketViewModal
                isOpen={isViewModalOpen}
                ticket={selectedTicket}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedTicket(null)
                }}
            />

            {/* Modal de edición */}
            <TicketConfirmModal
                isOpen={isEditModalOpen}
                ticketData={
                    selectedTicket
                        ? {
                              storeName: selectedTicket.storeName,
                              totalAmount: selectedTicket.totalAmount,
                              tax: selectedTicket.tax,
                              purchaseDate: selectedTicket.purchaseDate,
                              category: selectedTicket.category,
                              products: selectedTicket.products.map((p) => ({
                                  name: p.name,
                                  quantity: p.quantity,
                                  unitPrice: p.unitPrice,
                                  totalPrice: p.totalPrice,
                              })),
                          }
                        : null
                }
                onConfirm={handleUpdateTicket}
                onCancel={() => {
                    setIsEditModalOpen(false)
                    setSelectedTicket(null)
                }}
                isProcessing={isUpdating}
            />

            {/* Modal de confirmación de eliminación */}
            <TicketDeleteModal
                isOpen={isDeleteModalOpen}
                ticketStoreName={selectedTicket?.storeName || ''}
                onConfirm={confirmDeleteTicket}
                onCancel={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedTicket(null)
                }}
                isDeleting={isDeleting}
            />
        </div>
    )
}
