import { useState } from 'react';

export const useGalleryLightbox = () => {
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const openLightbox = (imageIndex: number, images: string[]) => {
    // Procesar todas las imágenes de la galería
    const processedImages = images.map((imageUrl: string) => {
      return imageUrl.includes('drive.google.com/file/d/')
        ? `https://drive.google.com/uc?export=view&id=${imageUrl.match(/\/d\/(.+?)\/view/)?.[1] || ''}`
        : imageUrl;
    });

    setGalleryImages(processedImages);
    setCurrentImageIndex(imageIndex);
    setLightboxVisible(true);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setCurrentImageIndex(0);
    setGalleryImages([]);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return {
    lightboxVisible,
    currentImageIndex,
    galleryImages,
    openLightbox,
    closeLightbox,
    goToPreviousImage,
    goToNextImage
  };
};
