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
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4">
      <div className="tk-card mx-4 flex max-h-[90vh] w-full max-w-3xl animate-fade-in flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-ink p-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-ash">TIKIT — RETRATO</p>
            <h2 className="tk-condensed mt-1 text-2xl">
              {t('cropImage') || 'Recortar imagen'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="cursor-pointer border-2 border-ink p-1.5 transition-colors duration-300 hover:bg-ink hover:text-paper disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex flex-1 flex-col overflow-auto p-6">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex max-h-full max-w-full items-center justify-center border-2 border-ink bg-paper-2 p-2">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
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
          <p className="mt-4 shrink-0 text-center font-mono text-xs text-ash">
            {t('cropInstructions') || 'Arrastra para ajustar el área que deseas usar como foto de perfil'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t-2 border-dashed border-ink/25 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="tk-btn tk-btn-ghost flex-1"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !crop}
            className="tk-btn tk-btn-ink flex-1"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('confirm') || 'Confirmar'} <span aria-hidden="true">✂</span>
          </button>
        </div>
      </div>
    </div>
  );
}
