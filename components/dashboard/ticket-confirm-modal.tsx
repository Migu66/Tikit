'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

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

interface TicketConfirmModalProps {
  isOpen: boolean;
  ticketData: TicketDataForConfirmation | null;
  onConfirm: (editedData: TicketDataForConfirmation) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const CATEGORIES = [
  'alimentacion',
  'ocio',
  'transporte',
  'salud',
  'hogar',
  'otros',
];

export function TicketConfirmModal({
  isOpen,
  ticketData,
  onConfirm,
  onCancel,
  isProcessing = false,
}: TicketConfirmModalProps) {
  const t = useTranslations('dashboard.tickets.confirm');
  const tCategories = useTranslations('categories');

  const [editedData, setEditedData] = useState<TicketDataForConfirmation | null>(null);

  useEffect(() => {
    if (ticketData) {
      setEditedData({
        ...ticketData,
        category: ticketData.category || 'otros',
      });
    }
  }, [ticketData]);

  if (!isOpen || !editedData) return null;

  const handleProductChange = (index: number, field: keyof TicketProduct, value: string) => {
    const updatedProducts = [...editedData.products];
    
    if (field === 'name') {
      updatedProducts[index][field] = value;
    } else {
      const numValue = parseFloat(value) || 0;
      updatedProducts[index][field] = numValue;
      
      // Recalcular totalPrice si cambia quantity o unitPrice
      if (field === 'quantity' || field === 'unitPrice') {
        updatedProducts[index].totalPrice = 
          updatedProducts[index].quantity * updatedProducts[index].unitPrice;
      }
    }
    
    setEditedData({ ...editedData, products: updatedProducts });
  };

  const handleAddProduct = () => {
    setEditedData({
      ...editedData,
      products: [
        ...editedData.products,
        { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
      ],
    });
  };

  const handleRemoveProduct = (index: number) => {
    setEditedData({
      ...editedData,
      products: editedData.products.filter((_, i) => i !== index),
    });
  };

  const handleConfirm = () => {
    onConfirm(editedData);
  };

  // Calcular total de productos
  const productsTotal = editedData.products.reduce((sum, p) => sum + p.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('storeName')}
              </label>
              <Input
                type="text"
                value={editedData.storeName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditedData({ ...editedData, storeName: e.target.value })
                }
                placeholder={t('storeNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')}
              </label>
              <select
                value={editedData.category || 'otros'}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setEditedData({ ...editedData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {tCategories(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('purchaseDate')}
              </label>
              <Input
                type="date"
                value={editedData.purchaseDate.split('T')[0]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditedData({ ...editedData, purchaseDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tax')}
              </label>
              <Input
                type="number"
                step="0.01"
                value={editedData.tax ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditedData({
                    ...editedData,
                    tax: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Productos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{t('products')}</h3>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                + {t('addProduct')}
              </button>
            </div>

            <div className="space-y-3">
              {editedData.products.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      type="text"
                      value={product.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleProductChange(index, 'name', e.target.value)
                      }
                      placeholder={t('productName')}
                      className="text-sm"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2">
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={product.quantity}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleProductChange(index, 'quantity', e.target.value)
                      }
                      placeholder={t('quantity')}
                      className="text-sm"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.unitPrice}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleProductChange(index, 'unitPrice', e.target.value)
                      }
                      placeholder={t('unitPrice')}
                      className="text-sm"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2">
                    <div className="flex items-center h-full px-3 bg-gray-100 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        €{product.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title={t('removeProduct')}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {editedData.products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t('noProducts')}
                </div>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                {t('totalAmount')}
              </label>
              <Input
                type="number"
                step="0.01"
                value={editedData.totalAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditedData({
                    ...editedData,
                    totalAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32 text-right font-semibold"
              />
            </div>
            <div className="text-xs text-gray-600">
              {t('productsTotal')}: €{productsTotal.toFixed(2)}
            </div>
            {Math.abs(productsTotal - editedData.totalAmount) > 0.01 && (
              <div className="text-xs text-amber-600 mt-1">
                ⚠️ {t('totalMismatch')}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isProcessing ? t('saving') : t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
