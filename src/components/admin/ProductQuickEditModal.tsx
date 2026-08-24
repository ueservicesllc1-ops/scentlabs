'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Save, Edit, Package, DollarSign, Tag, Image as ImageIcon, Barcode, ScanLine, Check } from 'lucide-react';
import { Product, ProductStatus } from '@/types/product';
import { productService } from '@/lib/firestore/products';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaved: () => void;
}

export default function ProductQuickEditModal({ isOpen, onClose, product, onSaved }: Props) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        basePrice: product.basePrice,
        status: product.status,
        primaryImageUrl: product.primaryImageUrl,
        inventory: product.inventory ? { ...product.inventory } : {
          quantityInStock: 0,
          status: 'out_of_stock',
          lowStockThreshold: 5,
          reorderPoint: 5
        }
      });
      setError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInventoryChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...(prev.inventory as any),
        [field]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Auto-update stock status based on quantity
      const qty = formData.inventory?.quantityInStock || 0;
      let stockStatus = 'in_stock';
      if (qty <= 0) stockStatus = 'out_of_stock';
      else if (qty <= (formData.inventory?.lowStockThreshold || 5)) stockStatus = 'low_stock';

      const updatedProduct = {
        ...product,
        name: formData.name,
        basePrice: formData.basePrice,
        status: formData.status as ProductStatus,
        primaryImageUrl: formData.primaryImageUrl,
        inventory: {
          ...product.inventory,
          ...formData.inventory,
          status: stockStatus as any
        }
      };

      const result = await productService.saveProduct(updatedProduct as Product);
      
      if (result.success) {
        onSaved();
        onClose();
      } else {
        setError(result.error || 'Failed to save product');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-gray-400" />
              Quick Edit: {product.sku}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              {product.slug}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form id="quick-edit-form" onSubmit={handleSave} className="space-y-6">
            
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                <Tag className="w-3.5 h-3.5" /> Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]/20 focus:border-[#2B5F4A] transition-all"
              />
            </div>

            {/* SKU / Barcode */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                <span className="flex items-center gap-1.5"><Barcode className="w-3.5 h-3.5 text-[#2B5F4A]" /> Barcode / SKU</span>
                <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1"><ScanLine className="w-3 h-3 text-[#2B5F4A]" /> Escaneable con pistola</span>
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                placeholder="Escanea con la pistola..."
                onChange={e => handleChange('sku', e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]/20 focus:border-[#2B5F4A] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                  <DollarSign className="w-3.5 h-3.5" /> Base Retail Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.basePrice === undefined ? '' : formData.basePrice}
                  onChange={e => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]/20 focus:border-[#2B5F4A] transition-all"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                  <Package className="w-3.5 h-3.5" /> Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.inventory?.quantityInStock === undefined ? '' : formData.inventory.quantityInStock}
                  onChange={e => handleInventoryChange('quantityInStock', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]/20 focus:border-[#2B5F4A] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                  Catalog Status
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]/20 focus:border-[#2B5F4A] transition-all"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Primary Image URL (Simple fallback) */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Primary Image URL
                </label>
                <input
                  type="url"
                  value={formData.primaryImageUrl || ''}
                  onChange={e => handleChange('primaryImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]/20 focus:border-[#2B5F4A] transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Leave empty to use Media Tab gallery.</p>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Link 
            href={`/admin/products/${product.id}/edit`}
            className="text-xs font-bold text-[#2B5F4A] hover:underline"
          >
            Go to Advanced Editor →
          </Link>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="quick-edit-form"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Quick Edit'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
