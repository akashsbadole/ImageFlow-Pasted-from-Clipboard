import React, { useCallback, useState, useRef } from 'react';
import { Upload, File, X, Image as ImageIcon, Clipboard } from 'lucide-react';
import { useImageStore } from '../store/imageStore';
import { extractExifData } from '../utils/imageProcessing';

const ImageUploader: React.FC = () => {
  const { addImages, setActiveTab, isDarkMode } = useImageStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pastedImage, setPastedImage] = useState<{ file: File; url: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle paste events
  React.useEffect(() => {
  const handlePaste = async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      const originalFile = imageItems[0].getAsFile();
      if (originalFile) {
        const url = URL.createObjectURL(originalFile);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = originalFile.type.split('/')[1] || 'png';
        const fileName = `pasted-image-${timestamp}.${extension}`;
        
        // Create new file only if File constructor is available and works
        let fileToUse = originalFile;
        try {
          if (typeof File === 'function' && File.prototype && File.prototype.constructor) {
            fileToUse = new File(
              [originalFile], 
              fileName,
              {
                type: originalFile.type,
                lastModified: Date.now()
              }
            );
          }
        } catch (error) {
          console.warn('File constructor not available, using original file:', error);
          // fileToUse already set to originalFile above
        }
        
        setPastedImage({ file: fileToUse, url });
      }
    }
  };
  
  document.addEventListener('paste', handlePaste);
  return () => document.removeEventListener('paste', handlePaste);
}, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addPastedImage = () => {
    if (pastedImage) {
      setSelectedFiles(prev => [...prev, pastedImage.file]);
      setPastedImage(null);
    }
  };

  const removePastedImage = () => {
    if (pastedImage) {
      URL.revokeObjectURL(pastedImage.url);
      setPastedImage(null);
    }
  };

  const processUpload = async () => {
    if (selectedFiles.length === 0 && !pastedImage) return;
    
    setIsProcessing(true);
    
    try {
      const allFiles = [...selectedFiles];
      if (pastedImage) {
        allFiles.push(pastedImage.file);
      }

      const imageItems = await Promise.all(
        allFiles.map(async (file) => {
          const url = URL.createObjectURL(file);
          
          // Get image dimensions
          const img = new Image();
          img.src = url;
          await new Promise(resolve => { img.onload = resolve; });

          // Extract EXIF data
          let exifData = null;
          let hasExif = false;
          try {
            exifData = await extractExifData(file);
            hasExif = Object.keys(exifData).length > 0;
          } catch (error) {
            console.log('No EXIF data found');
          }

          return {
            id: crypto.randomUUID(),
            file,
            url,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            metadata: {
              width: img.naturalWidth,
              height: img.naturalHeight,
              hasExif,
              exifData,
              originalSize: file.size
            },
            annotations: [],
            textOverlays: []
          };
        })
      );

      addImages(imageItems);
      setSelectedFiles([]);
      setPastedImage(null);
      setActiveTab('gallery');
    } catch (error) {
      console.error('Upload processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? isDarkMode
              ? 'border-blue-400 bg-blue-950/30'
              : 'border-blue-400 bg-blue-50'
            : isDarkMode
              ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
              : 'border-gray-300 hover:border-gray-400 bg-white/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Upload Your Images
            </h3>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Drag and drop files here, paste from clipboard (<kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Ctrl+V</kbd>), or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Choose Files
            </button>
          </div>
        </div>
      </div>

      {/* Pasted Image Preview */}
      {pastedImage && (
        <div className={`rounded-2xl p-6 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <h4 className={`font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Clipboard size={20} />
            Pasted from Clipboard
          </h4>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-shrink-0">
              <img
                src={pastedImage.url}
                alt="Pasted image preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
            <div className="flex-1">
              <p className={`font-medium mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {pastedImage.file.name}
              </p>
              <p className={`text-sm mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {(pastedImage.file.size / 1024 / 1024).toFixed(1)} MB • {pastedImage.file.type.split('/')[1].toUpperCase()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={addPastedImage}
                  className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Add to Upload
                </button>
                <button
                  onClick={removePastedImage}
                  className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {(selectedFiles.length > 0 || pastedImage) && (
        <div className={`rounded-2xl p-6 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <h4 className={`font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Upload ({selectedFiles.length + (pastedImage ? 1 : 0)})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {selectedFiles.map((file, index) => (
              <div key={index} className={`relative flex items-center gap-3 p-3 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <ImageIcon size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {file.name}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {pastedImage && (
              <div className={`relative flex items-center gap-3 p-3 rounded-xl border ${
                isDarkMode 
                  ? 'bg-blue-700/20 border-blue-600' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <Clipboard size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {pastedImage.file.name}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    {(pastedImage.file.size / 1024 / 1024).toFixed(1)} MB • From Clipboard
                  </p>
                </div>
                <button
                  onClick={removePastedImage}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={processUpload}
            disabled={isProcessing}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
              isProcessing
                ? isDarkMode
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isProcessing 
              ? 'Processing...' 
              : `Upload ${selectedFiles.length + (pastedImage ? 1 : 0)} Image${(selectedFiles.length + (pastedImage ? 1 : 0)) > 1 ? 's' : ''}`
            }
          </button>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Upload,
            title: 'Fast Upload',
            description: 'Drag & drop, paste (Ctrl+V), or browse files'
          },
          {
            icon: File,
            title: 'Multiple Formats',
            description: 'Support for JPG, PNG, WebP, AVIF and more'
          },
          {
            icon: ImageIcon,
            title: 'Bulk Processing',
            description: 'Upload and process multiple images at once'
          }
        ].map((feature, index) => (
          <div key={index} className={`p-4 rounded-xl backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-gray-800/30 border-gray-700' 
              : 'bg-white/50 border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <feature.icon size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
            </div>
            <h5 className={`font-medium mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {feature.title}
            </h5>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;