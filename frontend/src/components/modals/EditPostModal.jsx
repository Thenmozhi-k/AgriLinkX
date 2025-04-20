import React, { useState, useEffect, useRef } from 'react';
import { X, Image, MapPin, Smile, Send, Trash } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updatePost } from '../../features/posts/postsSlice';

const EditPostModal = ({ post, onClose }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaToRemove, setMediaToRemove] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setDescription(post.description || '');
      setLocation(post.location || '');
      setMedia(post.media || []);
    }
  }, [post]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewMedia([...newMedia, ...filesArray]);
    }
  };

  // Remove existing media
  const handleRemoveExistingMedia = (mediaId) => {
    setMediaToRemove([...mediaToRemove, mediaId]);
  };

  // Remove new media
  const handleRemoveNewMedia = (index) => {
    const updatedMedia = [...newMedia];
    updatedMedia.splice(index, 1);
    setNewMedia(updatedMedia);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Post description cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Extract hashtags from description
      const hashtagRegex = /#(\w+)/g;
      const matches = description.match(hashtagRegex);
      const hashtags = matches ? matches.map(tag => tag.substring(1)) : [];
      
      // Prepare post data
      const postData = {
        description,
        location,
        hashtags,
        media: newMedia,
        removeMedia: mediaToRemove
      };
      
      // Dispatch update action
      await dispatch(updatePost({ postId: post._id, postData })).unwrap();
      
      // Close modal on success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render preview of existing media
  const renderExistingMediaPreview = () => {
    return media
      .filter(item => !mediaToRemove.includes(item._id))
      .map((item, index) => (
        <div key={item._id} className="relative rounded-lg overflow-hidden border border-gray-200 mr-2 mb-2">
          {item.type === 'image' && (
            <div className="h-20 w-20 relative">
              <img 
                src={item.data || item.url} 
                alt={`Media ${index}`} 
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveExistingMedia(item._id)}
                className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ));
  };

  // Render preview of new media
  const renderNewMediaPreview = () => {
    return newMedia.map((file, index) => (
      <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 mr-2 mb-2">
        <div className="h-20 w-20 relative">
          <img 
            src={URL.createObjectURL(file)} 
            alt={`New Media ${index}`} 
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemoveNewMedia(index)}
            className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {/* Post Content */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] resize-none"
            />
            
            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm mt-2 mb-2">
                {error}
              </div>
            )}
            
            {/* Media Preview */}
            <div className="flex flex-wrap mt-3">
              {renderExistingMediaPreview()}
              {renderNewMediaPreview()}
            </div>
            
            {/* Location Input */}
            <div className="mt-3 flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <MapPin className="h-5 w-5 mx-2 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add your location"
                className="flex-1 py-2 px-1 focus:outline-none"
              />
              {location && (
                <button 
                  type="button"
                  onClick={() => setLocation('')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4 border-t pt-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <Image className="h-5 w-5" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Post'}
                {!isSubmitting && <Send className="h-4 w-4 ml-2" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;