"use client";

import React from 'react';
// Remove direct import and use dynamic import instead
import dynamic from 'next/dynamic';

// Dynamically import Vimeo component with SSR disabled
const Vimeo = dynamic(
  () => import('@u-wave/react-vimeo').then((mod) => mod.default),
  { ssr: false }
);

// Interface for Video props
interface VideoProps {
  url: string;
}

// Helper function to extract Vimeo ID
const extractVimeoId = (url: string): string | null => {
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/|vimeo\.com\/video\/)([0-9]+)/;
  const match = url.match(vimeoRegex);
  return match ? match[1] : null;
};

// Helper function to extract YouTube ID
const extractYouTubeId = (url: string): string | null => {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
};

const Video: React.FC<VideoProps> = ({ url }) => {
  // Check for YouTube first
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden border border-[#00000010] ">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=0&controls=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    );
  }

  // Then check for Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden border border-[#00000010] ">
        <Vimeo
          video={vimeoId}
          responsive={true}
          autoplay={false}
          controls={true}
          background={false}
          className="w-full h-full"
        />
      </div>
    );
  }

  // If we couldn't identify the video type, return a simple link
  console.warn(`Could not determine video provider for URL: ${url}`);
  return (
    <div className="p-4 bg-gray-100 rounded-lg text-center">
      <p className="mb-2">Unable to embed video directly</p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Watch video
      </a>
    </div>
  );
};

// PropTypes are removed

export default Video; 