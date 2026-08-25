'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Edit, 
  Package, 
  DollarSign, 
  Tag, 
  Image as ImageIcon, 
  Barcode, 
  Trash2, 
  Upload, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Plus, 
  FileText,
  Layers
} from 'lucide-react';
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
  const [mediaList, setMediaList] = useState<{ id: string; url: string; isPrimary: boolean; fileName?: string }[]>([]);
  const [packageOptions, setPackageOptions] = useState<Array<{ id: string; name?: string; label?: string; quantity: number; price: number; unitPrice: number }>>([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      // Extract existing media
      const existingMedia: { id: string; url: string; isPrimary: boolean; fileName?: string }[] = [];
      
      if (product.media && Array.isArray(product.media)) {
        product.media.forEach((m: any, idx: number) => {
          if (m.url) {
            existingMedia.push({
              id: m.id || `med_${idx}`,
              url: m.url,
              isPrimary: m.isPrimary || (idx === 0 && !product.primaryImageUrl),
              fileName: m.fileName || m.altText || `Foto ${idx + 1}`,
            });
          }
        });
      } else if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: any, idx: number) => {
          const u = typeof img === 'string' ? img : img.url;
          if (u) {
            existingMedia.push({
              id: `img_${idx}`,
              url: u,
              isPrimary: idx === 0,
            });
          }
        });
      }

      if (product.primaryImageUrl && !existingMedia.some(m => m.url === product.primaryImageUrl)) {
        existingMedia.unshift({
          id: `pri_${Date.now()}`,
          url: product.primaryImageUrl,
          isPrimary: true,
          fileName: 'Foto Principal',
        });
      }

      if (existingMedia.length > 0 && !existingMedia.some(m => m.isPrimary)) {
        existingMedia[0].isPrimary = true;
      }

      setMediaList(existingMedia);

      // Package options
      if (product.packageOptions && Array.isArray(product.packageOptions)) {
        setPackageOptions(product.packageOptions.map((p: any) => ({
          id: p.id || `pkg_${p.quantity}`,
          name: p.name || p.label || `${p.quantity} Unidades`,
          label: p.label || p.name || `${p.quantity}u`,
          quantity: p.quantity || 1,
          price: p.price || 0,
          unitPrice: p.unitPrice || (p.quantity ? p.price / p.quantity : p.price),
        })));
      } else {
        setPackageOptions([]);
      }

      setFormData({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        basePrice: product.basePrice,
        cost: (product as any).cost || 0,
        status: product.status || 'active',
        primaryImageUrl: product.primaryImageUrl || (existingMedia[0]?.url || ''),
        featured: !!product.featured,
        inventory: product.inventory ? { ...product.inventory } : {
          quantityInStock: 0,
          status: 'out_of_stock',
          lowStockThreshold: 5,
          reorderPoint: 5
        }
      });
      setUrlInput('');
      setError(null);
      setSuccessMsg(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // File Upload to B2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        data.append("folder", "products");

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: data,
        });

        if (!res.ok) {
          throw new Error(`Error al subir la imagen '${file.name}'`);
        }

        const json = await res.json();
        const newUrl = json.url;

        setMediaList(prev => {
          const isFirst = prev.length === 0;
          const updated = [
            ...prev.map(m => isFirst ? { ...m, isPrimary: false } : m),
            {
              id: `med_${Date.now()}_${i}`,
              url: newUrl,
              isPrimary: isFirst,
              fileName: file.name,
            }
          ];
          return updated;
        });

        if (!formData.primaryImageUrl) {
          setFormData(prev => ({ ...prev, primaryImageUrl: newUrl }));
        }
      }
      setSuccessMsg("¡Foto(s) subida(s) con éxito!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al subir la foto");
    } finally {
      setIsUploading(false);
    }
  };

  // Add Image from Direct URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const trimmed = urlInput.trim();
    setMediaList(prev => {
      const isFirst = prev.length === 0;
      return [
        ...prev,
        {
          id: `url_${Date.now()}`,
          url: trimmed,
          isPrimary: isFirst,
          fileName: 'Direct URL',
        }
      ];
    });

    if (!formData.primaryImageUrl) {
      setFormData(prev => ({ ...prev, primaryImageUrl: trimmed }));
    }

    setUrlInput('');
  };

  const handleSetPrimary = (index: number) => {
    setMediaList(prev => {
      const updated = prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      }));
      setFormData(f => ({ ...f, primaryImageUrl: updated[index].url }));
      return updated;
    });
  };

  const handleRemoveImage = (index: number) => {
    setMediaList(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some(m => m.isPrimary)) {
        filtered[0].isPrimary = true;
        setFormData(f => ({ ...f, primaryImageUrl: filtered[0].url }));
      } else if (filtered.length === 0) {
        setFormData(f => ({ ...f, primaryImageUrl: '' }));
      }
      return filtered;
    });
  };

  // Package Option Tiers Handlers
  const handleAddPackageTier = () => {
    const nextQty = packageOptions.length === 0 ? 25 : (packageOptions[packageOptions.length - 1].quantity * 2);
    const unitP = formData.basePrice || 1.0;
    const newTier = {
      id: `pkg_${Date.now()}`,
      name: `${nextQty} Unidades`,
      label: `${nextQty}u`,
      quantity: nextQty,
      price: Number((nextQty * unitP * 0.9).toFixed(2)),
      unitPrice: Number((unitP * 0.9).toFixed(3)),
    };
    setPackageOptions([...packageOptions, newTier]);
  };

  const handleUpdatePackageTier = (idx: number, field: string, val: any) => {
    const updated = [...packageOptions];
    const item = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'price') {
      const q = Number(field === 'quantity' ? val : item.quantity) || 1;
      const p = Number(field === 'price' ? val : item.price) || 0;
      item.unitPrice = Number((p / q).toFixed(3));
      item.name = `${q} Unidades`;
      item.label = `${q}u`;
    }
    updated[idx] = item;
    setPackageOptions(updated);
  };

  const handleRemovePackageTier = (idx: number) => {
    setPackageOptions(packageOptions.filter((_, i) => i !== idx));
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

  // Toggle Visibility in 1 Click
  const handleToggleVisibility = () => {
    const current = formData.status || 'active';
    const next = current === 'active' ? 'draft' : 'active';
    setFormData(prev => ({ ...prev, status: next }));
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

      const primaryUrl = mediaList.find(m => m.isPrimary)?.url || mediaList[0]?.url || formData.primaryImageUrl || '';

      const updatedMedia = mediaList.map((m, idx) => ({
        id: m.id,
        url: m.url,
        type: 'image',
        isPrimary: m.isPrimary || (idx === 0 && !mediaList.some(x => x.isPrimary)),
        altText: formData.name || product.name,
        sortOrder: idx,
      }));

      const updatedImages = mediaList.map((m, idx) => ({
        url: m.url,
        isPrimary: m.isPrimary || idx === 0,
      }));

      const updatedProduct: Product = {
        ...product,
        name: formData.name || product.name,
        slug: formData.slug || product.slug,
        sku: formData.sku || product.sku,
        category: formData.category || product.category,
        subcategory: formData.subcategory || product.subcategory,
        description: formData.description || product.description,
        shortDescription: formData.shortDescription !== undefined ? formData.shortDescription : product.shortDescription,
        basePrice: formData.basePrice !== undefined ? Number(formData.basePrice) : product.basePrice,
        status: formData.status as ProductStatus || product.status,
        featured: !!formData.featured,
        primaryImageUrl: primaryUrl,
        media: updatedMedia as any,
        images: updatedImages as any,
        packageOptions: packageOptions.map(p => ({
          id: p.id,
          name: p.name || `${p.quantity} Unidades`,
          quantity: Number(p.quantity),
          price: Number(p.price),
          unitPrice: Number(p.unitPrice),
          isDefault: p.quantity === (packageOptions[0]?.quantity || 1)
        })) as any,
        inventory: {
          ...product.inventory,
          ...formData.inventory,
          quantityInStock: Number(formData.inventory?.quantityInStock ?? product.inventory?.quantityInStock ?? 0),
          status: stockStatus as any
        },
        updatedAt: new Date().toISOString(),
      };

      const result = await productService.saveProduct(updatedProduct);
      
      if (result.success) {
        onSaved();
        onClose();
      } else {
        setError(result.error || 'Error al guardar el producto.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE el producto '${product.name}'?\nEsta acción no se puede deshacer.`)) {
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

  const isVisible = (formData.status || 'active') === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-xs"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-950 flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#2B5F4A]" />
                Editar Producto Completo: {product.name}
              </h2>
              {/* Visibility Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isVisible ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}>
                {isVisible ? "🟢 Visible en Tienda" : "🟡 Oculto"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              SKU: {product.sku} &bull; ID: {product.id}
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form id="quick-edit-form" onSubmit={handleSave} className="space-y-6 text-xs">
            
            {/* ━━━━ VISIBILITY & FAST TOGGLE BAR ━━━━ */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-950 text-xs block">Visibilidad del Producto</span>
                <p className="text-[11px] text-gray-500 font-light">
                  {isVisible 
                    ? "El producto está publicado y visible para todos los clientes en la tienda."
                    : "El producto está oculto (borrador) y nadie puede verlo en el catálogo."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleVisibility}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 ${
                  isVisible 
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                    : "bg-[#2B5F4A] hover:bg-[#1E4233] text-white"
                }`}
              >
                {isVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultar de la Tienda</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hacer Visible / Publicar</span>
                  </>
                )}
              </button>
            </div>

            {/* ━━━━ PHOTO & MEDIA UPLOADER SECTION ━━━━ */}
            <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/60 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#2B5F4A]" /> Fotos del Producto ({mediaList.length})
                  </label>
                  <p className="text-[11px] text-gray-500 font-light">
                    Sube fotos desde tu dispositivo o pega enlaces directos. La foto con la estrella será la principal.
                  </p>
                </div>
                
                <label className="px-3.5 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 transition shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Subiendo..." : "Subir Foto"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL input field */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/foto-producto.jpg"
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 text-xs focus:outline-none focus:border-[#2B5F4A]"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-semibold rounded-xl text-xs transition"
                >
                  Agregar URL
                </button>
              </div>

              {/* Gallery Preview Cards */}
              {mediaList.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white space-y-2">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-light">Este producto aún no tiene fotos.</p>
                  <p className="text-[10px] text-gray-400">Haz clic en &quot;Subir Foto&quot; o pega un link para añadir una.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                  {mediaList.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className={`group relative rounded-xl border bg-white overflow-hidden p-2 flex flex-col items-center justify-between transition shadow-2xs ${
                        item.isPrimary ? "border-[#2B5F4A] ring-2 ring-[#2B5F4A]/20" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-full h-24 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.url} 
                          alt={item.fileName || "Foto de producto"} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Primary badge or Make Primary button */}
                      <div className="w-full pt-2 flex items-center justify-between gap-1 text-[10px]">
                        {item.isPrimary ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-[#166534]" /> Principal
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="text-gray-500 hover:text-[#2B5F4A] hover:underline font-semibold"
                          >
                            Hacer Principal
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ━━━━ MAIN DETAILS & DESCRIPTION ━━━━ */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Slug / URL Amigable
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ''}
                    onChange={e => handleChange('slug', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Categoría Principal
                  </label>
                  <select
                    value={formData.category || 'packaging'}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:border-[#2B5F4A] focus:outline-none capitalize"
                  >
                    <option value="packaging">Empaques & Cajas (packaging)</option>
                    <option value="bottles">Botellas & Frascos (bottles)</option>
                    <option value="testing">Suministros de Prueba (testing)</option>
                    <option value="perfume-making">Formulación & Alcohol (perfume-making)</option>
                    <option value="fragrance">Fragancias (fragrance)</option>
                    <option value="custom-labels">Etiquetas Foil (custom-labels)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Subcategoría
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={e => handleChange('subcategory', e.target.value)}
                    placeholder="Ej: Boxes, Heat Shrink, Botellas..."
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={e => handleChange('shortDescription', e.target.value)}
                  placeholder="Resumen para tarjetas de catálogo..."
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                  Descripción Completa / Especificaciones Técnicas
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Detalles de materiales, dimensiones, gramajes, compatibilidad..."
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={e => handleChange('sku', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Precio Base ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice !== undefined ? formData.basePrice : ''}
                    onChange={e => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-950 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Inventario en Stock (Unidades)
                  </label>
                  <input
                    type="number"
                    value={formData.inventory?.quantityInStock ?? 0}
                    onChange={e => handleInventoryChange('quantityInStock', parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ━━━━ PACKAGE TIERS / VOLUME PRICING ━━━━ */}
            <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/60 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-xs text-gray-950 uppercase tracking-wider block">
                    Escalas de Precio por Paquete / Volumen ({packageOptions.length})
                  </span>
                  <p className="text-[11px] text-gray-500 font-light">
                    Define opciones de compra (ej: 25u, 50u, 100u, 250u) con precio total y unitario.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPackageTier}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold text-xs transition flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2B5F4A]" /> Agregar Paquete
                </button>
              </div>

              {packageOptions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">Sin paquetes escalonados (se vende solo por precio base individual).</p>
              ) : (
                <div className="space-y-2">
                  {packageOptions.map((pkg, idx) => (
                    <div key={pkg.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
                      <div className="col-span-3">
                        <label className="text-[10px] text-gray-400 block uppercase">Cantidad (u)</label>
                        <input
                          type="number"
                          value={pkg.quantity}
                          onChange={e => handleUpdatePackageTier(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded font-mono font-bold"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-400 block uppercase">Precio Total ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={e => handleUpdatePackageTier(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded font-mono font-bold text-[#2B5F4A]"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-400 block uppercase">Unitario</label>
                        <span className="font-mono text-gray-600 block pt-1">
                          ${(pkg.unitPrice || 0).toFixed(3)}/u
                        </span>
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePackageTier(idx)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Producto</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-xl transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="quick-edit-form"
              disabled={loading || isUploading}
              className="px-6 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "Guardando..." : "Guardar Todo"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
