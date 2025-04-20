import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize, ExternalLink, Download } from 'lucide-react';

/**
 * PostMediaGallery component for displaying multiple media files in a post
 * Supports images, videos, and documents
 * Provides a LinkedIn-style gallery UI with navigation controls
 */
const PostMediaGallery = ({ media, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Return null if no media is provided
  if (!media || !Array.isArray(media) || media.length === 0) {
    return null;
  }
  
  // Get the active media item
  const activeMedia = media[activeIndex];
  
  // Handle navigation
  const goToPrevious = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };
  
  const goToNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = (e) => {
    e.stopPropagation();
    setFullscreen(!fullscreen);
  };
  
  // Handle download
  const handleDownload = (e, url, filename) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render media content based on type
  const renderMediaContent = (mediaItem) => {
    if (!mediaItem) return null;
    
    // Determine the source URL (use data URL if available, otherwise use the URL)
    const mediaSource = mediaItem.data || mediaItem.url;
    
    switch (mediaItem.type) {
      case 'image':
        return (
          <img 
            src={mediaSource} 
            alt={mediaItem.filename || 'Post image'} 
            className="max-h-full max-w-full object-contain"
          />
        );
      case 'video':
        return (
          <video 
            src={mediaSource} 
            controls 
            className="max-h-full max-w-full"
            poster={mediaItem.thumbnailUrl}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'document':
        return (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-100 p-6 rounded-lg mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-gray-800 mb-1 truncate max-w-xs">
              {mediaItem.filename || 'Document'}
            </p>
            <div className="flex space-x-2 mt-2">
              <a 
                href={mediaSource} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                <span>Open</span>
              </a>
              <button 
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                onClick={(e) => handleDownload(e, mediaSource, mediaItem.filename)}
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Download</span>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center p-4 text-center">
            <p className="text-gray-500">Unsupported media type</p>
          </div>
        );
    }
  };
  
  // Determine layout based on media count
  const getLayoutClasses = () => {
    if (media.length === 1) {
      return 'grid-cols-1';
    } else if (media.length === 2) {
      return 'grid-cols-2';
    } else if (media.length === 3) {
      return 'grid-cols-2';
    } else if (media.length === 4) {
      return 'grid-cols-2';
    } else {
      return 'grid-cols-3';
    }
  };
  
  // Render thumbnail grid for multiple media items
  const renderThumbnailGrid = () => {
    if (media.length === 1) {
      return (
        <div className="relative w-full h-full max-h-[500px] overflow-hidden rounded-lg">
          {renderMediaContent(media[0])}
          {media[0].type === 'image' && (
            <button 
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className={`grid ${getLayoutClasses()} gap-1 rounded-lg overflow-hidden`}>
        {media.slice(0, media.length > 5 ? 5 : media.length).map((item, index) => {
          const isLastWithMore = index === 4 && media.length > 5;
          
          return (
            <div 
              key={index} 
              className={`relative ${
                index === 0 && media.length === 3 ? 'col-span-2 row-span-2' : ''
              } ${
                media.length === 3 && index > 0 ? 'aspect-square' : ''
              } ${
                media.length === 4 ? 'aspect-square' : ''
              } ${
                media.length > 4 ? 'aspect-square' : ''
              } overflow-hidden cursor-pointer`}
              onClick={() => setActiveIndex(index)}
            >
              {/* Media thumbnail */}
              {item.type === 'image' ? (
                <img 
                  src={item.data || item.url} 
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : item.type === 'video' ? (
                <div className="relative w-full h-full bg-gray-900">
                  {item.thumbnailUrl ? (
                    <img 
                      src={item.thumbnailUrl} 
                      alt={`Video thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              
              {/* Overlay for showing more items */}
              {isLastWithMore && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{media.length - 5}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render fullscreen modal
  const renderFullscreenModal = () => {
    if (!fullscreen) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        onClick={toggleFullscreen}
      >
        <button 
          className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full"
          onClick={toggleFullscreen}
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
          {renderMediaContent(activeMedia)}
          
          {/* Navigation controls */}
          {media.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          
          {/* Pagination indicator */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
              {activeIndex + 1} / {media.length}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`post-media-gallery mt-3 ${className}`}>
      {renderThumbnailGrid()}
      
      {/* Media modal for viewing single item */}
      {media.length > 1 && (
        <div 
          className={`fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center ${
            fullscreen ? 'block' : 'hidden'
          }`}
          onClick={() => setFullscreen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            {renderMediaContent(activeMedia)}
            
            {/* Navigation controls */}
            <button 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Pagination indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
              {activeIndex + 1} / {media.length}
            </div>
          </div>
        </div>
      )}
      
      {/* Fullscreen modal for single image */}
      {renderFullscreenModal()}
    </div>
  );
};

export default PostMediaGallery;