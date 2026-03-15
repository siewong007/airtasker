import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { fileService } from '@/services/files';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    try {
      const urls = await fileService.uploadFiles(selectedFiles);
      onChange([...images, ...urls]);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Upload ${idx + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mb-2" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {dragOver ? (
                <Image className="h-8 w-8 text-primary-500 mb-2" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-500">
                Drag & drop images here, or <span className="text-primary-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, GIF, WebP (max 5MB each)
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
