'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoUploadProps {
    stepId?: string
    subStepId?: string
    jobId?: string
    onUploadComplete?: () => void
    maxFiles?: number
}

export function PhotoUpload({
    stepId,
    subStepId,
    jobId,
    onUploadComplete,
    maxFiles = 5,
}: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        )

        if (files.length + selectedFiles.length > maxFiles) {
            toast.warning(`Maksimum ${maxFiles} fotoğraf yükleyebilirsiniz`)
            return
        }

        setSelectedFiles((prev) => [...prev, ...files].slice(0, maxFiles))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).filter((file) =>
                file.type.startsWith('image/')
            )

            if (files.length + selectedFiles.length > maxFiles) {
                toast.warning(`Maksimum ${maxFiles} fotoğraf yükleyebilirsiniz`)
                return
            }

            setSelectedFiles((prev) => [...prev, ...files].slice(0, maxFiles))
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) {
            toast.warning('Lütfen en az bir fotoğraf seçin')
            return
        }

        setUploading(true)
        try {
            for (const file of selectedFiles) {
                const formData = new FormData()
                formData.append('file', file)
                if (jobId) formData.append('jobId', jobId)
                if (stepId) formData.append('stepId', stepId)
                if (subStepId) formData.append('subStepId', subStepId)

                const res = await fetch('/api/worker/photos', {
                    method: 'POST',
                    body: formData,
                })

                if (!res.ok) {
                    throw new Error('Upload failed')
                }
            }

            toast.success(`${selectedFiles.length} fotoğraf başarıyla yüklendi!`)
            setSelectedFiles([])
            onUploadComplete?.()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Fotoğraflar yüklenirken bir hata oluştu')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card
                className={`border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">
                        Fotoğrafları sürükleyip bırakın veya
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Dosya Seç
                    </Button>
                    <p className="text-xs text-gray-500">
                        Maksimum {maxFiles} fotoğraf, 5MB/dosya
                    </p>
                </div>
            </Card>

            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            Seçilen Fotoğraflar ({selectedFiles.length})
                        </p>
                        <Button
                            onClick={uploadFiles}
                            disabled={uploading}
                            size="sm"
                        >
                            {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Yükle
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded border"
                                />
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
