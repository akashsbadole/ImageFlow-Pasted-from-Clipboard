import React, { useState, useRef, useEffect } from 'react';
import { Link, Copy, QrCode, Download, Share2, Eye, Lock } from 'lucide-react';
import { useImageStore } from '../store/imageStore';
import { generateQRCodeToCanvas } from '../utils/qrGenerator';

const SharePanel: React.FC = () => {
  const { selectedImage, isDarkMode } = useImageStore();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [viewCount, setViewCount] = useState(0);
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (selectedImage) {
      const baseUrl = window.location.origin;
      const imageId = selectedImage.id;
      setShareUrl(`${baseUrl}/share/${imageId}`);
    }
  }, [selectedImage]);

  const generateQRCode = async () => {
    if (!qrCodeRef.current || !shareUrl) return;

    try {
      await generateQRCodeToCanvas(qrCodeRef.current, shareUrl, isDarkMode);
      setQrGenerated(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeRef.current || !qrGenerated) return;
    
    const link = document.createElement('a');
    link.href = qrCodeRef.current.toDataURL();
    link.download = `qr-code-${selectedImage?.name || 'image'}.png`;
    link.click();
  };

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this image: ${shareUrl}`)}`, 
      color: 'bg-green-500 hover:bg-green-600' 
    },
    { 
      name: 'Twitter', 
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this image!')}`, 
      color: 'bg-blue-400 hover:bg-blue-500' 
    },
    { 
      name: 'Facebook', 
      url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      name: 'LinkedIn', 
      url: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, 
      color: 'bg-blue-700 hover:bg-blue-800' 
    }
  ];

  if (!selectedImage) {
    return (
      <div className={`text-center py-12 rounded-2xl backdrop-blur-sm border ${
        isDarkMode 
          ? 'bg-gray-800/30 border-gray-700' 
          : 'bg-white/50 border-gray-200'
      }`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Select an image to share
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
          Share Image
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isDarkMode 
            ? 'bg-green-900/50 text-green-300' 
            : 'bg-green-100 text-green-700'
        }`}>
          {selectedImage.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Preview */}
        <div className={`rounded-2xl overflow-hidden backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="p-6">
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto rounded-lg"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            
            {/* Image Info */}
            <div className={`mt-4 p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Size
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedImage.metadata ? 
                      `${selectedImage.metadata.width} × ${selectedImage.metadata.height}` : 
                      'Unknown'
                    }
                  </span>
                </div>
                <div>
                  <span className={`block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Format
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedImage.type.split('/')[1].toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className={`block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    File Size
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div>
                  <span className={`block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    EXIF Data
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedImage.metadata?.hasExif ? 'Present' : 'Removed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-6">
          {/* Share URL */}
          <div className={`rounded-2xl p-6 backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Link size={20} />
              Share Link
            </h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  copied
                    ? isDarkMode
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? 'Copied!' : <Copy size={16} />}
              </button>
            </div>

            {/* Password Protection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="rounded"
                />
                <Lock size={16} />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Password protect this link
                </span>
              </label>
              
              {isPasswordProtected && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              )}
            </div>

            {/* Analytics */}
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center gap-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Eye size={14} />
                  Views
                </span>
                <span className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {viewCount}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className={`rounded-2xl p-6 backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <QrCode size={20} />
              QR Code
            </h3>
            
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <canvas
                  ref={qrCodeRef}
                  className={`border rounded-lg ${
                    qrGenerated ? 'block' : 'hidden'
                  } ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={generateQRCode}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {qrGenerated ? 'Regenerate QR' : 'Generate QR'}
                </button>
                {qrGenerated && (
                  <button
                    onClick={downloadQRCode}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Download size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className={`rounded-2xl p-6 backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Share2 size={20} />
              Social Media
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${option.color} text-white text-center py-3 rounded-lg font-medium transition-colors`}
                >
                  {option.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePanel;