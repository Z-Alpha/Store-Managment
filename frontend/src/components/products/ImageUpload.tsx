import { useState, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File) => void;
}

const ImageUpload = ({ currentImage, onImageSelect }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
      <div className="space-y-1 text-center">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Product preview"
              className="mx-auto h-32 w-32 object-cover rounded-md"
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer"
              onClick={handleClick}
            >
              <CloudArrowUpIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="cursor-pointer"
          >
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload product image
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>
    </div>
  );
};

export default ImageUpload; 