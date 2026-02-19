'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface MultiImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({ images, onImagesChange, maxImages = 10 }: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const remaining = maxImages - images.length;
    const toAdd = imageFiles.slice(0, remaining);

    if (toAdd.length === 0) return;

    const newImages = [...images, ...toAdd];
    onImagesChange(newImages);

    // Generate previews
    const newPreviews = toAdd.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [images, maxImages, onImagesChange]);

  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // Revoke and remove preview
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, [images, previews, onImagesChange]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onImagesChange(newImages);

    const newPreviews = [...previews];
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedPreview);
    setPreviews(newPreviews);
  }, [images, previews, onImagesChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-white text-sm font-medium">
          Images ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <span className="text-white/40 text-xs">Drag to reorder</span>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-move"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
              if (!isNaN(fromIndex) && fromIndex !== index) {
                handleReorder(fromIndex, index);
              }
            }}
          >
            <Image
              src={preview}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            {/* Order badge */}
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{index + 1}</span>
            </div>
            {/* Remove button */}
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add button */}
        {images.length < maxImages && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-white/40 transition"
          >
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-white/40 text-[10px]">Add</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddImages}
      />

      {images.length > 1 && (
        <p className="text-white/30 text-xs">
          Will display as {images.length <= 4 ? 'grid' : 'carousel'} in feed
        </p>
      )}
    </div>
  );
}

/** Display component for multi-image posts in feed */
export function MultiImageDisplay({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-square">
        <Image src={images[0]} alt="" fill className="object-cover" />
      </div>
    );
  }

  // Grid for 2-4 images
  if (images.length <= 4) {
    const cols = images.length === 2 ? 'grid-cols-2' : 'grid-cols-2';
    return (
      <div className={`grid ${cols} gap-0.5 w-full aspect-square`}>
        {images.map((img, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image src={img} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // Carousel for 5+ images
  return (
    <div className="relative w-full aspect-square overflow-hidden">
      <Image src={images[currentIndex]} alt="" fill className="object-cover" />
      {/* Navigation dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
      {/* Nav arrows */}
      {currentIndex > 0 && (
        <button onClick={() => setCurrentIndex(i => i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {currentIndex < images.length - 1 && (
        <button onClick={() => setCurrentIndex(i => i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full glass text-white text-xs">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
}
