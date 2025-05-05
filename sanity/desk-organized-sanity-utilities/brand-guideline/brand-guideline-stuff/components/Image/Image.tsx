import React from 'react';
// Adjust the import path as necessary for your project
import { urlFor } from '@/sanity/lib/image'; 

// Define the props interface
interface ImageProps {
  node?: any; // Use a more specific Sanity image type if available
  image?: any; // Use a more specific Sanity image type if available
  width?: number;
}

const Image: React.FC<ImageProps> = ({ node, image: imageProp, width = 2000 }) => {
  // Determine the image source, preferring node if provided
  const image = node || imageProp;

  // Early return if no image data
  if (!image?.asset) {
    console.warn('Image component received no valid image data');
    return null; 
  }

  // Generate a unique key for this image to avoid duplicates
  const uniqueKey = image._key || `image-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced styling for better presentation
  const imageClasses = "w-full my-8 rounded-lg border border-[#00000010] "; 

  // Handle SVG images directly by URL
  if (image.asset.extension === "svg") {
    // Add alt text if available from the image data, otherwise provide a generic one
    const altText = image.alt || 'SVG Image'; 
    return (
      <figure className="my-10">
        <img 
          className={imageClasses} 
          src={image.asset.url} 
          alt={altText} 
          key={uniqueKey}
        />
        {image.caption && (
          <figcaption className="text-center text-sm text-gray-600 mt-2 italic">
            {image.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // Handle other image types using urlFor
  // Add alt text if available from the image data, otherwise provide a generic one
  const altText = image.alt || 'Image';
  const imageUrl = urlFor(image).width(width).url();

  return (
    <figure className="my-10">
      <img 
        className={imageClasses} 
        src={imageUrl} 
        alt={altText}
        key={uniqueKey}
        loading="lazy"
      />
      {image.caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-2 italic">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
};

// Default props are handled within the component definition now

export default Image; 