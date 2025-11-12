'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TicketConfirmModal } from './ticket-confirm-modal';

interface UploadedTicket {
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

interface TicketProduct {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface TicketDataForConfirmation {
  storeName: string;
  totalAmount: number;
  tax?: number | null;
  purchaseDate: string;
  products: TicketProduct[];
  category?: string | null;
}

interface TicketUploadProps {
  onUploadSuccess?: (ticket: UploadedTicket) => void;
}

export function TicketUpload({ onUploadSuccess }: TicketUploadProps) {
  const t = useTranslations('dashboard.tickets');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [extractedData, setExtractedData] = useState<TicketDataForConfirmation | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError(t('errors.invalidType'));
      return;
    }

    // Validar tamaño (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t('errors.fileTooLarge'));
      return;
    }

    setFile(selectedFile);

    // Generar preview solo para imágenes
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress('Procesando ticket con IA...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message || errorData.error || 'Error al procesar el ticket';
        console.error('Error del servidor:', errorData);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Guardar los datos extraídos y la URL de la imagen
      setExtractedData(data.extractedData);
      setImageUrl(data.imageUrl);
      
      // Mostrar modal de confirmación
      setShowConfirmModal(true);
      setProgress('');
    } catch (err) {
      console.error('Error al procesar ticket:', err);
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  const handleConfirmTicket = async (editedData: TicketDataForConfirmation) => {
    setIsSaving(true);
    setError(null);

    try {
      // Guardar el ticket confirmado en la base de datos
      const response = await fetch('/api/tickets/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedData,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el ticket');
      }

      const data = await response.json();

      // Resetear formulario
      setFile(null);
      setPreview(null);
      setShowConfirmModal(false);
      setExtractedData(null);
      setImageUrl('');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Callback de éxito
      if (onUploadSuccess && data.ticket) {
        onUploadSuccess(data.ticket);
      }
    } catch (err) {
      console.error('Error al guardar ticket:', err);
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setExtractedData(null);
    setImageUrl('');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      {/* Zona de arrastre */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
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

        <svg
          className="mx-auto h-16 w-16 text-gray-400"
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

        <p className="mt-4 text-lg font-medium text-gray-700">
          {t('upload.dragDrop')}
        </p>
        <p className="mt-1 text-sm text-gray-500">{t('upload.or')}</p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full sm:w-auto px-6 py-3 mt-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md cursor-pointer"
        >
          {t('upload.selectFile')}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          {t('upload.supportedFormats')}
        </p>
      </div>

      {/* Preview y acciones */}
      {file && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              {preview && (
                <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {progress && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      <p className="text-sm text-blue-600">{progress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-4 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {uploading ? t('uploading.processing') : t('upload.process')}
            </button>

            <button
              onClick={handleCancel}
              disabled={uploading}
			  className='flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {t('upload.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
