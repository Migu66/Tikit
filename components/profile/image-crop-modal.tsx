'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }: ImageCropModalProps) {
  const t = useTranslations('profile');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !crop) return null;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [crop]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImage();
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (error) {
      console.error('Error al recortar imagen:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {t('cropImage') || 'Recortar imagen'}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 overflow-auto p-6 flex flex-col">
          <div className="flex justify-center items-center flex-1 min-h-0">
            <div className="max-w-full max-h-full flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
                className="max-w-full max-h-full"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Imagen a recortar"
                  onLoad={onImageLoad}
                  style={{ maxHeight: 'calc(90vh - 300px)', maxWidth: '100%' }}
                  className="object-contain"
                />
              </ReactCrop>
            </div>
          </div>
          <p className="text-sm text-slate-600 text-center mt-4 shrink-0">
            {t('cropInstructions') || 'Arrastra para ajustar el área que deseas usar como foto de perfil'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !crop}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('confirm') || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
