import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import type { ImageSpec } from '../../types/content';

interface ImageCropperProps {
  imageSrc: string;
  spec: ImageSpec;
  onCropComplete: (blob: Blob) => void;
  onCancel: () => void;
}

/**
 * Crop the image using canvas to the exact required dimensions.
 */
async function getCroppedBlob(
  imageSrc: string,
  cropArea: Area,
  targetW: number,
  targetH: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        targetW,
        targetH
      );

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob creation failed'));
        },
        'image/jpeg',
        0.92
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageSrc;
  });
}

const ImageCropperModal: React.FC<ImageCropperProps> = ({
  imageSrc,
  spec,
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const aspect = spec.width / spec.height;

  const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedArea) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, spec.width, spec.height);
      onCropComplete(blob);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-950/80 border-b border-white/10">
        <div>
          <h3 className="text-white font-semibold">Crop Image — {spec.label}</h3>
          <p className="text-white/60 text-sm">
            Required: {spec.width} × {spec.height}px &middot; Max {spec.maxSizeMB}MB
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !croppedArea}
            className="px-4 py-2 bg-azure-500 hover:bg-azure-600 disabled:opacity-50 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Check size={14} /> {isSaving ? 'Saving...' : 'Crop & Save'}
          </button>
        </div>
      </div>

      {/* Cropper */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropDone}
          style={{
            containerStyle: { background: '#111' },
          }}
        />
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-3 bg-gray-950/80 border-t border-white/10">
        <button
          onClick={() => setZoom(z => Math.max(1, z - 0.1))}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <ZoomOut size={18} />
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-48 accent-blue-400"
        />
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.1))}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <ZoomIn size={18} />
        </button>
        <span className="text-white/60 text-sm ml-2">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};

export default ImageCropperModal;
