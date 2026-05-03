import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getImageSrc } from "@/lib/utils";

// Fullscreen Image Gallery Component
interface FullscreenGalleryProps {
  images: (string | { url: string; alt: string })[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const FullscreenGallery: React.FC<FullscreenGalleryProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'ArrowLeft') goToPrev();
  }, [onClose, goToNext, goToPrev]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(initialIndex);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, initialIndex, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 z-10 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 z-10 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Counter */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div className="w-full h-full flex items-center justify-center p-4">
        {(() => {
          const img = images[currentIndex];
          const url = getImageSrc(img);
          const alt = typeof img === 'string' ? `Property image ${currentIndex + 1}` : img.alt || `Property image ${currentIndex + 1}`;
          return (
            <img
              src={url}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          );
        })()}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
          {images.map((img, index) => {
            const url = getImageSrc(img);
            const alt = typeof img === 'string' ? `Thumbnail ${index + 1}` : img.alt || `Thumbnail ${index + 1}`;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${index === currentIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
              >
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>,
    document.body
  );
};

// Main Image Gallery Component
interface ImageGalleryProps {
  images: (string | { url: string; alt: string })[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  const openFullscreen = (index: number = 0) => {
    setInitialImageIndex(index);
    setIsFullscreenOpen(true);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center mb-8">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Swiper */}
      <div className="md:hidden mb-8">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="rounded-xl overflow-hidden shadow-lg h-80"
        >
          {images.map((img, i) => {
            const url = getImageSrc(img);
            const alt = typeof img === 'string' ? `View ${i + 1}` : img.alt || `View ${i + 1}`;
            return (
              <SwiperSlide key={i}>
                <div
                  className="w-full h-full cursor-pointer"
                  onClick={() => openFullscreen(i)}
                >
                  <img
                    src={url}
                    alt={alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:block mb-12">
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[550px] rounded-2xl overflow-hidden">
          {/* Main large image */}
          <div
            className="col-span-2 row-span-2 cursor-pointer bg-gray-100 relative group"
            onClick={() => openFullscreen(0)}
          >
            <img
              src={getImageSrc(images[0])}
              alt={typeof images[0] === 'string' ? "Main view" : (images[0] as any).alt || "Main view"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* First 3 smaller images */}
          {images.slice(1, 4).map((img, i) => {
            const url = getImageSrc(img);
            const alt = typeof img === 'string' ? `Thumbnail ${i + 1}` : (img as any).alt || `Thumbnail ${i + 1}`;
            return (
              <div
                key={i}
                className="cursor-pointer bg-gray-100 overflow-hidden relative group"
                onClick={() => openFullscreen(i + 1)}
              >
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            );
          })}

          {/* Last image with "View All Photos" overlay */}
          {images.length > 4 && (
            <div
              className="cursor-pointer bg-gray-100 overflow-hidden relative group"
              onClick={() => openFullscreen(3)}
            >
              <img
                src={getImageSrc(images[3])}
                alt={typeof images[3] === 'string' ? "Thumbnail 4" : (images[3] as any).alt || "Thumbnail 4"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay for "View All Photos" */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-semibold text-lg">
                    View All {images.length} Photos
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* If there are exactly 4 images, show the 4th without overlay */}
          {images.length === 4 && (
            <div
              className="cursor-pointer bg-gray-100 overflow-hidden relative group"
              onClick={() => openFullscreen(3)}
            >
              <img
                src={getImageSrc(images[3])}
                alt={typeof images[3] === 'string' ? "Thumbnail 4" : (images[3] as any).alt || "Thumbnail 4"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Gallery */}
      <FullscreenGallery
        images={images}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        initialIndex={initialImageIndex}
      />
    </>
  );
};

export default ImageGallery;