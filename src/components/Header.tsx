import React from 'react';
import { ImageIcon, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleDarkMode }) => {
  return (
    <header className={`backdrop-blur-md border-b sticky top-0 z-50 ${
      isDarkMode 
        ? 'bg-gray-900/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ImageFlow
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Professional Image Processing Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;