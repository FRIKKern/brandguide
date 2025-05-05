"use client";

import React from 'react';
import Video from '../Video/Video'; // Import the TSX Video component

// Interface for a single video item
interface VideoItem {
  url: string;
  _key?: string; // Assuming Sanity might provide a key
  caption?: string;
}

// Interface for the main component props
interface VideoGridProps {
  node: {
    videos?: VideoItem[];
    caption?: string;
  };
}

// Generate responsive column classes based on number of videos
const getGridColumns = (videoCount: number): string => {
  switch (videoCount) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
    default:
      // For 5+ videos, we'll do a responsive grid that adapts
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  }
};

const VideoGrid: React.FC<VideoGridProps> = ({ node }) => {
  // Early return if videos list is missing or empty
  if (!node?.videos || node.videos.length === 0) {
    console.warn('VideoGrid component missing or empty videos list');
    return null;
  }

  const { videos, caption } = node;
  
  // Get appropriate grid column classes
  const gridColumnClass = getGridColumns(videos.length);

  return (
    <figure className="my-12">
      <div
        className={`grid gap-6 ${gridColumnClass}`}
      >
        {videos.map((video, index) => {
          // Generate a unique key
          const key = video._key || `video-${index}-${video.url.substring(0, 20)}`;
          
          return (
            <div key={key} className="relative rounded-lg border border-[#00000010]  overflow-hidden">
              <Video 
                url={video.url}
              />
              {video.caption && (
                <figcaption className="text-center text-sm text-gray-600 mt-2 italic p-2">
                  {video.caption}
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

export default VideoGrid; 