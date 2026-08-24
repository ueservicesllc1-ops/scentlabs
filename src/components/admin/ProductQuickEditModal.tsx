'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Save, Edit, Package, DollarSign, Tag, Image as ImageIcon, Barcode, ScanLine, Trash2, Upload } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        basePrice: product.basePrice,
        status: product.status,
        primaryImageUrl: product.primaryImageUrl,
        media: product.media ? [...(product.media as any[])] : [],
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "products");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image to B2 storage");
      }

      const json = await res.json();
      const newMediaItem = {
        id: `med_${Date.now()}`,
        b2Key: json.key || `products/${file.name}`,
        url: json.url,
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        size: file.size || 0,
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      };

      setFormData(prev => ({
        ...prev,
        primaryImageUrl: json.url,
        media: [
          newMediaItem,
          ...((prev.media as any[]) || []).map((m: any) => ({ ...m, isPrimary: false }))
        ] as any
      }));
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

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
      const qty = formData.inventory?.quantityInStock || 0;
      let stockStatus = 'in_stock';
      if (qty <= 0) stockStatus = 'out_of_stock';
      else if (qty <= (formData.inventory?.lowStockThreshold || 5)) stockStatus = 'low_stock';

      const updatedProduct = {
        ...product,
        name: formData.name,
        sku: formData.sku,
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

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto '${product.name}'?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await productService.deleteProduct(product.id, true);
      if (result.success) {
        onSaved();
        onClose();
      } else {
        setError(result.error || 'No se pudo eliminar el producto.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-xs"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#2B5F4A]" />
              Editar Producto: {product.name}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              SKU: {product.sku} • ID: {product.id}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form id="quick-edit-form" onSubmit={handleSave} className="space-y-5">
            
            {/* Image Preview & Upload (Supplies Modal Style 1:1) */}
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs">
                {formData.primaryImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.primaryImageUrl} alt="Product Spec" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Foto del Producto / Imagen Primaria
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? "Subiendo a B2..." : "Subir Foto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.primaryImageUrl || ''}
                    onChange={e => handleChange('primaryImageUrl', e.target.value)}
                    placeholder="o pega URL de la imagen..."
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2B5F4A]" /> Nombre del Producto
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
              />
            </div>

            {/* SKU / Barcode */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Barcode className="w-3.5 h-3.5 text-[#2B5F4A]" /> SKU / Código de Barras</span>
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
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#2B5F4A]" /> Precio Base ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.basePrice === undefined ? '' : formData.basePrice}
                  onChange={e => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <Package className="w-3.5 h-3.5 text-[#2B5F4A]" /> Inventario en Stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.inventory?.quantityInStock === undefined ? '' : formData.inventory.quantityInStock}
                  onChange={e => handleInventoryChange('quantityInStock', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                Estado del Catálogo
              </label>
              <select
                value={formData.status || 'draft'}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
              >
                <option value="active">Activo (Visible)</option>
                <option value="draft">Borrador (Oculto)</option>
                <option value="inactive">Inactivo</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Eliminar</span>
            </button>
            <Link 
              href={`/admin/products/${product.id}/edit`}
              className="text-xs font-bold text-[#2B5F4A] hover:underline"
            >
              Editor Avanzado →
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="quick-edit-form"
              disabled={loading || isUploading}
              className="px-5 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
