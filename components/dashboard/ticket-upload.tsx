'use client'

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { TicketConfirmModal } from './ticket-confirm-modal'

interface UploadedTicket {
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

interface TicketUploadProps {
    onUploadSuccess?: (ticket: UploadedTicket) => void
}

export function TicketUpload({ onUploadSuccess }: TicketUploadProps) {
    const t = useTranslations('dashboard.tickets')
    const searchParams = useSearchParams()
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState<string>('')
    const [isDragging, setIsDragging] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [extractedData, setExtractedData] =
        useState<TicketDataForConfirmation | null>(null)
    const [imageUrl, setImageUrl] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const autoOpenProcessedRef = useRef(false)

    // Abrir automáticamente el selector de archivos si viene con autoOpen=true
    useEffect(() => {
        const autoOpen = searchParams.get('autoOpen')
        if (
            autoOpen === 'true' &&
            !autoOpenProcessedRef.current &&
            fileInputRef.current
        ) {
            // Marcar como procesado para evitar que se ejecute múltiples veces
            autoOpenProcessedRef.current = true

            // Limpiar el parámetro de la URL inmediatamente
            const url = new URL(window.location.href)
            url.searchParams.delete('autoOpen')
            window.history.replaceState({}, '', url.toString())

            // Pequeño delay para asegurar que el componente está completamente montado
            setTimeout(() => {
                fileInputRef.current?.click()
            }, 100)
        }
    }, [searchParams])

    const handleFileSelect = (selectedFile: File) => {
        setError(null)

        // Validar tipo
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
        ]
        if (!validTypes.includes(selectedFile.type)) {
            setError(t('errors.invalidType'))
            return
        }

        // Validar tamaño (10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError(t('errors.fileTooLarge'))
            return
        }

        setFile(selectedFile)

        // Generar preview solo para imágenes
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setPreview(null)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            handleFileSelect(selectedFile)
        }
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files?.[0]
        if (droppedFile) {
            handleFileSelect(droppedFile)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setError(null)
        setProgress('Procesando ticket con IA...')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/tickets', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                const errorMsg =
                    errorData.message ||
                    errorData.error ||
                    'Error al procesar el ticket'
                console.error('Error del servidor:', errorData)
                throw new Error(errorMsg)
            }

            const data = await response.json()

            // Guardar los datos extraídos y la URL de la imagen
            setExtractedData(data.extractedData)
            setImageUrl(data.imageUrl)

            // Mostrar modal de confirmación
            setShowConfirmModal(true)
            setProgress('')
        } catch (err) {
            console.error('Error al procesar ticket:', err)
            setError(
                err instanceof Error ? err.message : t('errors.uploadFailed')
            )
        } finally {
            setUploading(false)
            setProgress('')
        }
    }

    const handleConfirmTicket = async (
        editedData: TicketDataForConfirmation
    ) => {
        setIsSaving(true)
        setError(null)

        try {
            const dataToSend = {
                ...editedData,
                imageUrl,
            }

            console.log('[Ticket Upload] Datos a enviar:', dataToSend)

            // Guardar el ticket confirmado en la base de datos
            const response = await fetch('/api/tickets/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            })

            if (!response.ok) {
                const errorData = await response.json()
                const errorMessage =
                    errorData.message ||
                    errorData.error ||
                    'Error al guardar el ticket'
                console.error('Error del servidor al guardar:', errorData)
                throw new Error(errorMessage)
            }

            const data = await response.json()

            // Resetear formulario
            setFile(null)
            setPreview(null)
            setShowConfirmModal(false)
            setExtractedData(null)
            setImageUrl('')

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            // Callback de éxito
            if (onUploadSuccess && data.ticket) {
                onUploadSuccess(data.ticket)
            }
        } catch (err) {
            console.error('Error al guardar ticket:', err)
            setError(
                err instanceof Error ? err.message : t('errors.uploadFailed')
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelConfirm = () => {
        setShowConfirmModal(false)
        setExtractedData(null)
        setImageUrl('')
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleCancel = () => {
        setFile(null)
        setPreview(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="w-full">
            {/* Modal de confirmación */}
            <TicketConfirmModal
                isOpen={showConfirmModal}
                ticketData={extractedData}
                onConfirm={handleConfirmTicket}
                onCancel={handleCancelConfirm}
                isProcessing={isSaving}
            />

            {/* Zona de arrastre: bandeja del escáner */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-[3px] border-dashed p-8 text-center transition-colors duration-300 sm:p-12
          ${
              isDragging
                  ? 'border-thermal bg-thermal/5'
                  : 'border-ink/40 hover:border-ink'
          }
          ${file ? 'hidden' : 'block'}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleChange}
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    className="hidden"
                    disabled={uploading}
                />

                {/* Mini recibo dibujado con CSS */}
                <div
                    className={`mx-auto w-16 transition-transform duration-300 ${
                        isDragging ? 'scale-110 -rotate-3' : ''
                    }`}
                    aria-hidden="true"
                >
                    <div className="tk-teeth tk-teeth-up [--tk-teeth-color:var(--color-ink)] h-2!" />
                    <div className="space-y-1.5 bg-ink px-3 py-3">
                        <div className="h-[3px] w-full bg-paper/70" />
                        <div className="h-[3px] w-3/4 bg-paper/70" />
                        <div className="h-[3px] w-full bg-paper/70" />
                        <div className="h-[3px] w-1/2 bg-thermal" />
                    </div>
                    <div className="tk-teeth [--tk-teeth-color:var(--color-ink)] h-2!" />
                </div>

                <p className="tk-condensed mt-6 text-2xl">
                    {t('upload.dragDrop')}
                </p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.3em] text-ash">
                    {t('upload.or').toUpperCase()}
                </p>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="tk-btn tk-btn-ink mt-4 w-full sm:w-auto"
                >
                    {t('upload.selectFile')} <span aria-hidden="true">↑</span>
                </button>

                <p className="mt-5 font-mono text-[10px] tracking-[0.2em] text-ash">
                    {t('upload.supportedFormats')}
                </p>
            </div>

            {/* Preview y acciones */}
            {file && (
                <div className="space-y-4">
                    <div className="tk-card-flat p-4">
                        <div className="flex items-start gap-4">
                            {preview && (
                                <div className="relative h-32 w-32 shrink-0 overflow-hidden border-2 border-ink">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-sm font-bold text-ink">
                                    {file.name}
                                </p>
                                <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-ash">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                {progress && (
                                    <p className="mt-3 font-mono text-xs font-bold tracking-wide text-thermal">
                                        {progress}
                                        <span className="tk-blink">_</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="animate-shake border-2 border-danger px-4 py-3">
                            <p className="font-mono text-xs font-bold tracking-wide text-danger">
                                ▲ {error}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="tk-btn tk-btn-thermal flex-1"
                        >
                            {uploading
                                ? t('uploading.processing')
                                : t('upload.process')}{' '}
                            <span aria-hidden="true">→</span>
                        </button>

                        <button
                            onClick={handleCancel}
                            disabled={uploading}
                            className="tk-btn tk-btn-ghost"
                        >
                            {t('upload.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
