'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Download, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Photo {
    url: string
    publicId: string
    stepTitle?: string
    uploadedBy?: string
}

interface PhotoGalleryProps {
    photos: Photo[]
    canDelete?: boolean
    onDelete?: (publicId: string) => void
}

export function PhotoGallery({ photos, canDelete = false, onDelete }: PhotoGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [deleting, setDeleting] = useState<string | null>(null)

    if (!photos || photos.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Henüz fotoğraf yüklenmemiş
            </div>
        )
    }

    const openLightbox = (index: number) => {
        setCurrentIndex(index)
        setLightboxOpen(true)
    }

    const nextPhoto = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
    }

    const prevPhoto = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }

    const handleDelete = async (publicId: string) => {
        if (!onDelete) return

        setDeleting(publicId)
        try {
            await onDelete(publicId)
            toast.success('Fotoğraf silindi')
            setLightboxOpen(false)
        } catch (error) {
            toast.error('Fotoğraf silinirken hata oluştu')
        } finally {
            setDeleting(null)
        }
    }

    const downloadPhoto = (url: string, filename: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <div
                        key={photo.publicId}
                        className="relative group cursor-pointer aspect-square"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover rounded-lg border hover:opacity-90 transition-opacity"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 bg-white/80 hover:bg-white text-black"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
                    <div className="relative w-full h-[70vh]">
                        <Image
                            src={photos[currentIndex]?.url}
                            alt="Full size"
                            fill
                            className="object-contain"
                            unoptimized
                        />

                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="bg-white/80 hover:bg-white text-black"
                                onClick={() =>
                                    downloadPhoto(
                                        photos[currentIndex].url,
                                        `photo-${currentIndex + 1}.jpg`
                                    )
                                }
                            >
                                <Download className="h-4 w-4" />
                            </Button>

                            {canDelete && (
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(photos[currentIndex].publicId)}
                                    disabled={deleting === photos[currentIndex].publicId}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={prevPhoto}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={nextPhoto}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                                >
                                    →
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
                            {photos[currentIndex]?.stepTitle && (
                                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm inline-block mx-2 mb-2">
                                    {photos[currentIndex].stepTitle}
                                </div>
                            )}
                            {photos[currentIndex]?.uploadedBy && (
                                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm inline-block mx-2 mb-2">
                                    Yükleyen: {photos[currentIndex].uploadedBy}
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentIndex + 1} / {photos.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
