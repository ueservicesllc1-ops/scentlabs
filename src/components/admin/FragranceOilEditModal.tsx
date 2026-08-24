'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit, Package, DollarSign, Tag, Image as ImageIcon, Upload, Trash2, Droplet } from 'lucide-react';
import { FragranceOil } from '@/types/fragrance';
import { fragranceRepository } from '@/lib/firestore/fragrance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fragrance: FragranceOil | null;
  onSaved: () => void;
}

export default function FragranceOilEditModal({ isOpen, onClose, fragrance, onSaved }: Props) {
  const [formData, setFormData] = useState<Partial<FragranceOil>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fragrance) {
      setFormData({
        name: fragrance.name,
        scentFamily: fragrance.scentFamily || 'Woody',
        supplierName: fragrance.supplierName || 'Africa Imports',
        supplierProductId: fragrance.supplierProductId || '',
        costPerOz: fragrance.costPerOz || (fragrance.sourceCost ? fragrance.sourceCost / (fragrance.sourceSize || 32) : 0),
        inventoryVolumeOz: fragrance.inventoryVolumeOz || 0,
        primaryImage: fragrance.primaryImage || fragrance.images?.[0] || '',
      });
      setError(null);
    }
  }, [fragrance]);

  if (!isOpen || !fragrance) return null;

  const handleChange = (field: keyof FragranceOil, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      data.append("folder", "fragrance");

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
      const updatedFragrance: FragranceOil = {
        ...fragrance,
        name: formData.name || fragrance.name,
        scentFamily: formData.scentFamily || fragrance.scentFamily,
        supplierName: formData.supplierName,
        supplierProductId: formData.supplierProductId,
        costPerOz: formData.costPerOz !== undefined ? formData.costPerOz : fragrance.costPerOz,
        inventoryVolumeOz: formData.inventoryVolumeOz !== undefined ? formData.inventoryVolumeOz : fragrance.inventoryVolumeOz,
        primaryImage: formData.primaryImage || fragrance.primaryImage,
        images: formData.primaryImage ? [formData.primaryImage] : fragrance.images,
        updatedAt: new Date().toISOString(),
      };

      await fragranceRepository.saveFragrance(updatedFragrance);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving fragrance oil');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente '${fragrance.name}'?`)) {
      return;
    }
    setLoading(true);
    try {
      await fragranceRepository.deleteFragrance(fragrance.id);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete fragrance oil');
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
              Editar Aceite de Fragancia: {fragrance.name}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              REF: {fragrance.fragranceReference || fragrance.id} • SKU: {fragrance.supplierProductId || fragrance.id}
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

          <form id="fragrance-edit-modal-form" onSubmit={handleSave} className="space-y-5">
            
            {/* Image Preview & Upload */}
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs">
                {formData.primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.primaryImage} alt="Fragrance Spec" className="w-full h-full object-contain p-1" />
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

            {/* Fragrance Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2B5F4A]" /> Nombre de la Fragancia
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
              />
            </div>

            {/* Scent Family & Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#2B5F4A]" /> Familia Olfativa
                </label>
                <select
                  value={formData.scentFamily || 'Woody'}
                  onChange={e => handleChange('scentFamily', e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                >
                  <option value="Woody">Woody</option>
                  <option value="Amber">Amber</option>
                  <option value="Floral">Floral</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Citrus">Citrus</option>
                  <option value="Oriental">Oriental</option>
                  <option value="Tobacco">Tobacco</option>
                  <option value="Gourmand">Gourmand</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.supplierName || ''}
                  onChange={e => handleChange('supplierName', e.target.value)}
                  placeholder="Africa Imports"
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>

            {/* Cost per Oz & Bulk Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#2B5F4A]" /> Costo por oz ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.costPerOz === undefined ? '' : formData.costPerOz}
                  onChange={e => handleChange('costPerOz', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <Package className="w-3.5 h-3.5 text-[#2B5F4A]" /> Inventario en Stock (fl oz)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={formData.inventoryVolumeOz === undefined ? '' : formData.inventoryVolumeOz}
                  onChange={e => handleChange('inventoryVolumeOz', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Eliminar</span>
          </button>

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
              form="fragrance-edit-modal-form"
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
