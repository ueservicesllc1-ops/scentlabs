"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Star, ArrowUp, ArrowDown, Image as ImageIcon, Video as VideoIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { ProductMediaItem } from "@/types/product";

interface MediaUploaderProps {
  media: ProductMediaItem[];
  onChange: (updatedMedia: ProductMediaItem[]) => void;
  folder?: string;
  maxFiles?: number;
}

export default function MediaUploader({
  media = [],
  onChange,
  folder = "products",
  maxFiles = 10,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];

    // Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "video/mp4", "video/webm"];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg(`Unsupported file type: ${file.name}. Allowed: JPG, PNG, WEBP, SVG, MP4.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg(`File too large: ${file.name} (Max 25MB).`);
        return;
      }
      validFiles.push(file);
    }

    if (media.length + validFiles.length > maxFiles) {
      setErrorMsg(`Maximum allowed media files is ${maxFiles}.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const uploadedItems: ProductMediaItem[] = [...media];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        const isFirst = uploadedItems.length === 0;

        uploadedItems.push({
          id: `med_${Date.now()}_${i}`,
          mediaId: data.fileId || `b2_${Date.now()}`,
          b2Key: data.path || data.fileName,
          url: data.url,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          sortOrder: uploadedItems.length,
          isPrimary: isFirst,
          createdAt: new Date().toISOString(),
        });

        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }

      onChange(uploadedItems);
    } catch (err: any) {
      setErrorMsg(err.message || "Media upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = media.map((item, i) => ({
      ...item,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const target = media[index];
    const updated = media.filter((_, i) => i !== index);
    // If we removed the primary image, make the first one primary
    if (target.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === media.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...media];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update sortOrder values
    const reindexed = updated.map((item, i) => ({ ...item, sortOrder: i }));
    onChange(reindexed);
  };

  const handleAltTextChange = (index: number, altText: string) => {
    const updated = [...media];
    updated[index] = { ...updated[index], altText };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-amber-500 bg-amber-500/10"
            : "border-lab-800 bg-lab-900/40 hover:border-lab-700 hover:bg-lab-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Drag & Drop product images/videos or <span className="text-amber-400">browse</span>
            </p>
            <p className="text-xs text-lab-400 mt-1">
              Supports JPG, PNG, WEBP, SVG & MP4 up to 25MB (Saved to Backblaze B2)
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-lab-400 mb-1">
              <span>Uploading to Backblaze B2...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-lab-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Gallery Grid */}
      {media.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-lab-400">
              Media Gallery ({media.length}/{maxFiles})
            </span>
            <span className="text-[11px] text-lab-500">
              ★ Star icon denotes the Primary storefront image
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item, index) => {
              const isVideo = item.mimeType.startsWith("video/");

              return (
                <div
                  key={item.id || index}
                  className={`relative p-3 rounded-xl border transition-all ${
                    item.isPrimary
                      ? "border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30"
                      : "border-lab-800 bg-lab-900/30"
                  }`}
                >
                  {/* Thumbnail container */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/40 border border-lab-800 mb-2 flex items-center justify-center">
                    {isVideo ? (
                      <div className="flex flex-col items-center justify-center text-lab-400">
                        <VideoIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px] uppercase font-mono">Video File</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.altText || item.fileName}
                        className="object-contain w-full h-full"
                        loading="lazy"
                      />
                    )}

                    {/* Primary Badge */}
                    {item.isPrimary && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                        Primary
                      </div>
                    )}

                    {/* Quick controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        title={item.isPrimary ? "Primary Image" : "Set as Primary"}
                        className={`p-1.5 rounded-lg border backdrop-blur transition-all ${
                          item.isPrimary
                            ? "bg-amber-500 text-black border-amber-400"
                            : "bg-black/60 text-white/80 border-white/10 hover:text-amber-400"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        title="Remove Image"
                        className="p-1.5 rounded-lg bg-black/60 text-white/80 border border-white/10 hover:bg-red-950/80 hover:text-red-400 hover:border-red-800 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Ordering & Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-lab-400 truncate max-w-[140px]" title={item.fileName}>
                        {item.fileName}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, "up")}
                          className="p-1 rounded bg-lab-800 text-lab-400 hover:text-white disabled:opacity-30"
                          title="Move Left/Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === media.length - 1}
                          onClick={() => handleMove(index, "down")}
                          className="p-1 rounded bg-lab-800 text-lab-400 hover:text-white disabled:opacity-30"
                          title="Move Right/Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Alt Text Input */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-lab-500 mb-1">
                        Alt Text (SEO & Access)
                      </label>
                      <input
                        type="text"
                        value={item.altText || ""}
                        onChange={(e) => handleAltTextChange(index, e.target.value)}
                        placeholder="e.g. 10ml Amber Glass Roll-on Bottle"
                        className="w-full text-xs px-2.5 py-1.5 bg-lab-950 border border-lab-800 rounded-lg text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-3 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>No images uploaded.</strong> The product will display with a <em>&quot;Missing Product Image&quot;</em> badge until a primary photo is provided.
          </span>
        </div>
      )}
    </div>
  );
}
