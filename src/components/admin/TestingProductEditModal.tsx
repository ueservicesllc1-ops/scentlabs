'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit, Package, DollarSign, Tag, Image as ImageIcon, Barcode, Upload, Check } from 'lucide-react';
import { TestingProduct } from '@/types/testing';
import { testingRepository } from '@/lib/firestore/testing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: TestingProduct | null;
  onSaved: () => void;
}

export default function TestingProductEditModal({ isOpen, onClose, product, onSaved }: Props) {
  const [formData, setFormData] = useState<Partial<TestingProduct>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        asin: product.asin || '',
        supplierName: product.supplierName || '',
        basePrice: product.basePrice,
        primaryImage: product.primaryImage || '',
        inventory: product.inventory ? { ...product.inventory } : {
          quantityInStock: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          lowStockThreshold: 10,
          reorderPoint: 10,
          status: 'in_stock',
        },
        packageOptions: product.packageOptions && product.packageOptions.length > 0 ? [...product.packageOptions] : [
          { id: "pkg_1", quantity: 100, price: product.basePrice, unitPrice: product.basePrice / 100 }
        ]
      });
      setError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (field: keyof TestingProduct, value: any) => {
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

  const handlePackageChange = (field: string, value: any) => {
    setFormData(prev => {
      const pkgs = [...(prev.packageOptions || [])];
      if (pkgs.length === 0) pkgs.push({ id: "pkg_1", quantity: 100, price: 0, unitPrice: 0 });
      const updatedPkg = { ...pkgs[0], id: pkgs[0]?.id || "pkg_1", [field]: value };
      if (field === 'price' || field === 'quantity') {
        const qty = updatedPkg.quantity || 1;
        const pr = updatedPkg.price || 0;
        updatedPkg.unitPrice = pr / qty;
      }
      pkgs[0] = updatedPkg;
      return { ...prev, packageOptions: pkgs };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "testing");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image to B2 storage");
      }

      const json = await res.json();
      setFormData(prev => ({ ...prev, primaryImage: json.url }));
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const qty = formData.inventory?.quantityInStock || 0;
      let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = 'in_stock';
      if (qty <= 0) stockStatus = 'out_of_stock';
      else if (qty <= (formData.inventory?.lowStockThreshold || 10)) stockStatus = 'low_stock';

      const updatedProduct: TestingProduct = {
        ...product,
        name: formData.name || product.name,
        sku: formData.sku || product.sku,
        asin: formData.asin,
        supplierName: formData.supplierName || product.supplierName,
        basePrice: formData.basePrice !== undefined ? formData.basePrice : product.basePrice,
        primaryImage: formData.primaryImage || product.primaryImage,
        media: formData.primaryImage ? [{ id: `med_${Date.now()}`, url: formData.primaryImage, type: "image", isPrimary: true, altText: formData.name || product.name, sortOrder: 0 }] : product.media,
        packageOptions: formData.packageOptions || product.packageOptions,
        inventory: {
          ...product.inventory,
          ...formData.inventory,
          quantityInStock: qty,
          availableQuantity: qty,
          status: stockStatus,
        },
        updatedAt: new Date().toISOString(),
      };
      if (formData.primaryImage) {
        (updatedProduct as any).images = [{ url: formData.primaryImage, isPrimary: true }];
      }

      await testingRepository.saveTestingProduct(updatedProduct);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving product');
    } finally {
      setLoading(false);
    }
  };

  const currentPkg = formData.packageOptions?.[0] || { quantity: 100, price: product.basePrice, unitPrice: product.basePrice / 100 };

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
              Editar Suministro: {product.name}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              SKU: {product.sku} • ID: {product.id}
            </p>
          </div>
          <button 
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

          <form id="testing-edit-form" onSubmit={handleSave} className="space-y-5">
            
            {/* Image Preview & Upload */}
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs">
                {formData.primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.primaryImage} alt="Product Spec" className="w-full h-full object-contain p-1" />
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
                    value={formData.primaryImage || ''}
                    onChange={e => handleChange('primaryImage', e.target.value)}
                    placeholder="o pega URL de la imagen..."
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2B5F4A]" /> Nombre del Suministro
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
              />
            </div>

            {/* SKU & ASIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <Barcode className="w-3.5 h-3.5 text-[#2B5F4A]" /> SKU / Código de Barras
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku || ''}
                  onChange={e => handleChange('sku', e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Proveedor / Amazon ASIN
                </label>
                <input
                  type="text"
                  value={formData.asin || ''}
                  onChange={e => handleChange('asin', e.target.value)}
                  placeholder="Ej: B09X8K..."
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>

            {/* Pack Size & Pack Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Unidades por Paquete
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={currentPkg.quantity}
                  onChange={e => handlePackageChange('quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#2B5F4A]" /> Precio del Paquete
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={currentPkg.price}
                  onChange={e => handlePackageChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Precio Unitario
                </label>
                <div className="w-full px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-700">
                  ${(currentPkg.unitPrice || 0).toFixed(4)} / u
                </div>
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Umbral de Stock Bajo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory?.lowStockThreshold === undefined ? 10 : formData.inventory.lowStockThreshold}
                  onChange={e => handleInventoryChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
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
            form="testing-edit-form"
            disabled={loading || isUploading}
            className="px-5 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}
