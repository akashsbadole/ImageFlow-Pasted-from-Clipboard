import React from 'react';
import { Download, Share2, Edit3, Eye, Trash2 } from 'lucide-react';
import { useImageStore } from '../store/imageStore';

const ImageGallery: React.FC = () => {
  const { 
    images, 
    selectImage, 
    setActiveTab, 
    removeImage, 
    isDarkMode 
  } = useImageStore();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadImage = (image: any) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    link.click();
  };

  const handleEdit = (image: any) => {
    selectImage(image);
    setActiveTab('edit');
  };

  const handleShare = (image: any) => {
    selectImage(image);
    setActiveTab('share');
  };

  const handleDelete = (image: any) => {
    if (confirm('Are you sure you want to delete this image?')) {
      removeImage(image.id);
    }
  };

  if (images.length === 0) {
    return (
      <div className={`text-center py-12 rounded-2xl backdrop-blur-sm border ${
        isDarkMode 
          ? 'bg-gray-800/30 border-gray-700' 
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Eye className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          No Images Yet
        </h3>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Upload some images to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Image Gallery
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isDarkMode 
            ? 'bg-blue-900/50 text-blue-300' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {images.length} image{images.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className={`group relative rounded-2xl overflow-hidden backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                : 'bg-white/70 border-gray-200 hover:bg-white/90'
            }`}
          >
            {/* Image Preview */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    title="Edit Image"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => downloadImage(image)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleShare(image)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    title="Share"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(image)}
                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600/80 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Image Info */}
            <div className="p-4">
              <h3 className={`font-medium truncate mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {image.name}
              </h3>
              <div className={`text-xs space-y-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <p>{formatFileSize(image.size)}</p>
                {image.metadata && (
                  <p>{image.metadata.width} × {image.metadata.height}</p>
                )}
                <p>{image.type.split('/')[1].toUpperCase()}</p>
                {image.metadata?.hasExif && (
                  <p className="text-green-500">EXIF Data Present</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;