'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'

interface TicketProduct {
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface TicketDataForConfirmation {
    storeName: string
    totalAmount: number
    tax?: number | null
    purchaseDate: string
    products: TicketProduct[]
    category?: string | null
}

interface TicketConfirmModalProps {
    isOpen: boolean
    ticketData: TicketDataForConfirmation | null
    onConfirm: (editedData: TicketDataForConfirmation) => void
    onCancel: () => void
    isProcessing?: boolean
}

const CATEGORIES = [
    'alimentacion',
    'ocio',
    'transporte',
    'salud',
    'hogar',
    'otros',
]

export function TicketConfirmModal({
    isOpen,
    ticketData,
    onConfirm,
    onCancel,
    isProcessing = false,
}: TicketConfirmModalProps) {
    const t = useTranslations('dashboard.tickets.confirm')
    const tCategories = useTranslations('categories')

    const [editedData, setEditedData] =
        useState<TicketDataForConfirmation | null>(null)

    useEffect(() => {
        if (ticketData) {
            // Asegurar que purchaseDate esté en formato ISO si no lo está
            let purchaseDateISO = ticketData.purchaseDate

            // Si la fecha no está en formato ISO, convertirla
            if (!purchaseDateISO.includes('T')) {
                purchaseDateISO = new Date(
                    purchaseDateISO + 'T00:00:00'
                ).toISOString()
            }

            setEditedData({
                ...ticketData,
                purchaseDate: purchaseDateISO,
                category: ticketData.category || 'otros',
            })
        }
    }, [ticketData])

    if (!isOpen || !editedData) return null

    const handleProductChange = (
        index: number,
        field: keyof TicketProduct,
        value: string
    ) => {
        const updatedProducts = [...editedData.products]

        if (field === 'name') {
            updatedProducts[index][field] = value
        } else {
            const numValue = parseFloat(value) || 0
            updatedProducts[index][field] = numValue

            // Recalcular totalPrice si cambia quantity o unitPrice
            if (field === 'quantity' || field === 'unitPrice') {
                updatedProducts[index].totalPrice =
                    updatedProducts[index].quantity *
                    updatedProducts[index].unitPrice
            }
        }

        setEditedData({ ...editedData, products: updatedProducts })
    }

    const handleAddProduct = () => {
        setEditedData({
            ...editedData,
            products: [
                ...editedData.products,
                { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
            ],
        })
    }

    const handleRemoveProduct = (index: number) => {
        setEditedData({
            ...editedData,
            products: editedData.products.filter((_, i) => i !== index),
        })
    }

    const handleConfirm = () => {
        // Validar que todos los datos requeridos estén presentes
        if (
            !editedData.storeName ||
            !editedData.totalAmount ||
            !editedData.purchaseDate
        ) {
            console.error('Faltan datos requeridos:', editedData)
            return
        }

        // Validar que haya al menos un producto
        if (editedData.products.length === 0) {
            console.error('Debe haber al menos un producto')
            return
        }

        // Validar que todos los productos tengan nombre
        const hasInvalidProducts = editedData.products.some(
            (p) => !p.name || p.name.trim() === ''
        )
        if (hasInvalidProducts) {
            console.error('Todos los productos deben tener un nombre')
            return
        }

        onConfirm(editedData)
    }

    // Calcular total de productos
    const productsTotal = editedData.products.reduce(
        (sum, p) => sum + p.totalPrice,
        0
    )

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4">
            <div className="tk-card flex max-h-[90vh] w-full max-w-4xl animate-fade-in flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b-2 border-ink px-6 py-4">
                    <p className="font-mono text-[9px] tracking-[0.35em] text-ash">
                        TIKIT — OCR
                    </p>
                    <h2 className="tk-condensed mt-1 text-3xl">
                        {t('title')}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-ink-2">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="tk-label mb-2">
                                {t('storeName')}
                            </label>
                            <Input
                                type="text"
                                value={editedData.storeName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setEditedData({
                                        ...editedData,
                                        storeName: e.target.value,
                                    })
                                }
                                placeholder={t('storeNamePlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="tk-label mb-2">
                                {t('category')}
                            </label>
                            <select
                                value={editedData.category || 'otros'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    setEditedData({
                                        ...editedData,
                                        category: e.target.value,
                                    })
                                }
                                className="tk-input"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {tCategories(cat)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="tk-label mb-2">
                                {t('purchaseDate')}
                            </label>
                            <Input
                                type="date"
                                value={editedData.purchaseDate.split('T')[0]}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                ) => {
                                    // Convertir a ISO string con hora 00:00:00
                                    const dateValue = e.target.value
                                    const isoDate = dateValue
                                        ? new Date(
                                              dateValue + 'T00:00:00'
                                          ).toISOString()
                                        : dateValue
                                    setEditedData({
                                        ...editedData,
                                        purchaseDate: isoDate,
                                    })
                                }}
                            />
                        </div>

                        <div>
                            <label className="tk-label mb-2">
                                {t('tax')}
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={editedData.tax ?? ''}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setEditedData({
                                        ...editedData,
                                        tax: e.target.value
                                            ? parseFloat(e.target.value)
                                            : null,
                                    })
                                }
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Productos */}
                    <div>
                        <div className="flex items-center justify-between mb-3 border-t-2 border-dashed border-ink/25 pt-4">
                            <h3 className="tk-condensed text-xl">
                                {t('products')}
                            </h3>
                            <button
                                onClick={handleAddProduct}
                                className="tk-btn tk-btn-ghost px-3! py-1.5! text-[11px]"
                            >
                                + {t('addProduct')}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {editedData.products.map((product, index) => (
                                <div
                                    key={index}
                                    className="border-2 border-ink/20 bg-paper p-3"
                                >
                                    {/* Fila 1: Nombre del producto (móvil y desktop) */}
                                    <div className="mb-2">
                                        <Input
                                            type="text"
                                            value={product.name}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                handleProductChange(
                                                    index,
                                                    'name',
                                                    e.target.value
                                                )
                                            }
                                            placeholder={t('productName')}
                                            className="text-sm w-full"
                                        />
                                    </div>

                                    {/* Fila 2 y 3 en móvil / Fila única en desktop */}
                                    <div className="grid grid-cols-12 gap-2">
                                        {/* Cantidad */}
                                        <div className="col-span-6 md:col-span-3">
                                            <Input
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={product.quantity}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    handleProductChange(
                                                        index,
                                                        'quantity',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={t('quantity')}
                                                className="text-sm"
                                            />
                                        </div>

                                        {/* Precio unitario */}
                                        <div className="col-span-6 md:col-span-3">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={product.unitPrice}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    handleProductChange(
                                                        index,
                                                        'unitPrice',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={t('unitPrice')}
                                                className="text-sm"
                                            />
                                        </div>

                                        {/* Precio total */}
                                        <div className="col-span-9 md:col-span-4">
                                            <div className="flex h-full items-center border-2 border-ink/20 bg-paper-2 px-3">
                                                <span className="font-mono text-sm font-bold tabular-nums text-ink">
                                                    €
                                                    {product.totalPrice.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botón eliminar */}
                                        <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                                            <button
                                                onClick={() =>
                                                    handleRemoveProduct(index)
                                                }
                                                className="cursor-pointer border-2 border-transparent px-2.5 py-1 font-mono text-sm font-bold text-danger transition-colors hover:border-danger"
                                                title={t('removeProduct')}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {editedData.products.length === 0 && (
                                <div className="border-2 border-dashed border-ink/25 py-8 text-center font-mono text-xs tracking-[0.2em] text-ash">
                                    {t('noProducts')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="border-[3px] border-ink bg-receipt p-4">
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <label className="tk-condensed text-xl">
                                {t('totalAmount')}
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={editedData.totalAmount}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setEditedData({
                                        ...editedData,
                                        totalAmount:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="w-32 text-right font-bold tabular-nums"
                            />
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.15em] text-ash">
                            {t('productsTotal')}: €{productsTotal.toFixed(2)}
                        </div>
                        {Math.abs(productsTotal - editedData.totalAmount) >
                            0.01 && (
                            <div className="mt-1 font-mono text-[10px] font-bold tracking-wide text-danger">
                                ▲ {t('totalMismatch')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t-2 border-dashed border-ink/25 bg-paper px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="tk-btn tk-btn-ghost"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="tk-btn tk-btn-thermal"
                    >
                        {isProcessing ? t('saving') : t('confirm')}{' '}
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
