"use client";

import React from 'react';
// Import the urlFor helper
import { urlFor } from '@/sanity/lib/image';
import Image from '../Image/Image';

const getImageResolution = (listLength: number): number => {
  switch (listLength) {
    case 1:
      return 1400;
    case 2:
      return 800;
    case 3: {
      return 600;
    }
    default:
      return 800;
  }
};

// Generate responsive column classes based on number of images
const getGridColumns = (imageCount: number): string => {
  switch (imageCount) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
    default:
      // For 5+ images, we'll do a responsive grid that adapts
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  }
};

// Interface for a single image item in the list
interface ImageItem {
  // Define structure based on Sanity schema, using 'any' for now
  _key?: string; // Assuming Sanity adds a _key
  asset?: any; 
  alt?: string;
  caption?: string;
  // Add other relevant image fields like alt text if available
}

// Interface for the main component props
interface ImageGridProps {
  node: {
    images?: ImageItem[];
    caption?: string;
  };
}

const ImageGrid: React.FC<ImageGridProps> = ({ node }) => {
  // Early return if images list is missing or empty
  if (!node?.images || node.images.length === 0) {
    console.warn('ImageGrid component missing or empty images list');
    return null;
  }

  const { images, caption } = node;

  // Calculate image resolution
  const imageWidth = getImageResolution(images.length);
  
  // Get appropriate grid column classes
  const gridColumnClass = getGridColumns(images.length);

  return (
    <figure className="my-12">
      <div
        className={`grid gap-6 ${gridColumnClass}`}
      >
        {images.map((image, index) => {
          // Use a more reliable key if available (e.g., image._key from Sanity)
          const key = image._key || `image-grid-${index}-${JSON.stringify(image.asset?._ref || '').substring(0, 20)}`;
          
          // Generate image URL using urlFor helper
          const imageUrl = image.asset ? urlFor(image).width(imageWidth).url() : '';
          const altText = image.alt || `Grid image ${index + 1}`;
          
          // For images in grid, we render directly
          return (
            <div key={key} className="relative overflow-hidden rounded-lg border border-[#00000010] ">
              <img
                src={imageUrl}
                alt={altText}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              {image.caption && (
                <figcaption className="text-center text-sm text-gray-600 mt-2 italic p-2">
                  {image.caption}
                </figcaption>
              )}
            </div>
          );
        })}
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-4 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageGrid; 