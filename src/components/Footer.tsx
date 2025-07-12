import React from 'react';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'API Documentation', href: '#' },
    { label: 'Help Center', href: '#' }
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Mail, href: '#', label: 'Contact' }
  ];

  return (
    <footer className={`mt-16 border-t backdrop-blur-md ${
      isDarkMode 
        ? 'bg-gray-900/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ImageFlow
            </h3>
            <p className={`text-sm mb-4 max-w-md ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Professional image processing and sharing platform. Upload, edit, and share your images with advanced tools and secure sharing options.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className={`font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Features
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                'Image Compression',
                'Format Conversion',
                'EXIF Data Handling',
                'Watermarking',
                'QR Code Generation',
                'Secure Sharing'
              ].map((feature, index) => (
                <li key={index} className={
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <p className={`text-sm flex items-center gap-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © {currentYear} ImageFlow. Made with <Heart size={14} className="text-red-500" /> for creators
          </p>
          <p className={`text-sm mt-2 md:mt-0 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Version 1.0.0 • Powered by modern web technologies
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;