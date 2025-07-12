import React, { useEffect } from 'react';
import { Upload, Image as ImageIcon, Share2, Palette } from 'lucide-react';
import { useImageStore } from './store/imageStore';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';
import ImageGallery from './components/ImageGallery';
import SharePanel from './components/SharePanel';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const { 
    activeTab, 
    setActiveTab, 
    isDarkMode, 
    toggleDarkMode 
  } = useImageStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const tabConfig = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'edit', label: 'Edit', icon: Palette },
    { id: 'share', label: 'Share', icon: Share2 }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className={`flex justify-center mb-8 p-2 rounded-2xl backdrop-blur-sm border shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          {tabConfig.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === id
                  ? isDarkMode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'upload' && <ImageUploader />}
          {activeTab === 'gallery' && <ImageGallery />}
          {activeTab === 'edit' && <ImageEditor />}
          {activeTab === 'share' && <SharePanel />}
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;