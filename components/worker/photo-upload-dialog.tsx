'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface PhotoUploadDialogProps {
  jobId: string;
  stepId: string;
  onUploadSuccess?: (imageUrl: string) => void;
}

export function PhotoUploadDialog({
  jobId,
  stepId,
  onUploadSuccess,
}: PhotoUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan az olmalıdır');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Lütfen bir dosya seçin');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', jobId);
      formData.append('stepId', stepId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload başarısız');
      }

      const data = await response.json();
      
      toast.success('Fotoğraf başarıyla yüklendi');
      onUploadSuccess?.(data.secure_url);
      
      // Reset state
      setFile(null);
      setPreview(null);
      setOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fotoğraf yüklemesi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          Fotoğraf Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fotoğraf Yükle</DialogTitle>
          <DialogDescription>
            Adım tamamlandığında fotoğraf ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          {preview ? (
            <div className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={300}
                className="w-full rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-gray-400 mb-2 group-hover:text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Resim seçmek için tıklayın
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG (Max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="w-full"
          >
            {isLoading ? 'Yükleniyor...' : 'Yükle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
