import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  Type, 
  Download, 
  Undo, 
  Redo, 
  Palette,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Edit3,
  Settings,
  Droplets,
  FileImage,
  Zap
} from 'lucide-react';
import { useImageStore } from '../store/imageStore';
import { ImageItem, TextOverlay, AnnotationItem, WatermarkSettings, CompressionSettings, FormatConversionSettings } from '../types/ImageTypes';
import { compressImage, convertImageFormat, addWatermark, extractExifData, removeExifData } from '../utils/imageProcessing';

const ImageEditor: React.FC = () => {
  const { selectedImage, updateImage, isDarkMode } = useImageStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [activeTextTool, setActiveTextTool] = useState(false);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [annotationColor, setAnnotationColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: 'ImageFlow',
    position: 'bottom-right',
    opacity: 0.5,
    size: 24
  });
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 80,
    maxWidth: 1920,
    preserveExif: false
  });
  const [formatSettings, setFormatSettings] = useState<FormatConversionSettings>({
    format: 'jpeg',
    quality: 90
  });
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      drawImage();
    }
  }, [selectedImage, rotation, textOverlays, annotations]);

  const drawImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.drawImage(img, 0, 0);
      ctx.restore();

      // Draw annotations
      annotations.forEach(annotation => {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;
        ctx.beginPath();

        switch (annotation.type) {
          case 'rectangle':
            ctx.rect(annotation.x, annotation.y, annotation.width || 0, annotation.height || 0);
            break;
          case 'circle':
            const radius = Math.sqrt(Math.pow(annotation.width || 0, 2) + Math.pow(annotation.height || 0, 2)) / 2;
            ctx.arc(annotation.x + (annotation.width || 0) / 2, annotation.y + (annotation.height || 0) / 2, radius, 0, 2 * Math.PI);
            break;
          case 'arrow':
          case 'line':
            ctx.moveTo(annotation.x, annotation.y);
            ctx.lineTo(annotation.endX || annotation.x, annotation.endY || annotation.y);
            break;
          case 'freehand':
            if (annotation.points && annotation.points.length > 0) {
              ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
              annotation.points.forEach(point => ctx.lineTo(point.x, point.y));
            }
            break;
        }

        ctx.stroke();
        if (annotation.fill) {
          ctx.fillStyle = annotation.color;
          ctx.fill();
        }
      });

      // Draw text overlays
      textOverlays.forEach(overlay => {
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(overlay.text, overlay.x, overlay.y);
      });

      // Add watermark if enabled
      if (watermarkSettings.text) {
        addWatermark(canvas, watermarkSettings.text, watermarkSettings.position, watermarkSettings.opacity, watermarkSettings.size);
      }
    };
    img.src = selectedImage.url;
  };

  const rotateImage = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
  };

  const addTextOverlay = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTextTool || !newText.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const overlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: newText,
      x,
      y,
      fontSize,
      color: textColor,
      fontFamily: 'Arial'
    };

    setTextOverlays(prev => [...prev, overlay]);
    setNewText('');
    setActiveTextTool(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeAnnotationTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (activeAnnotationTool === 'freehand') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else {
      const annotation: AnnotationItem = {
        id: crypto.randomUUID(),
        type: activeAnnotationTool as any,
        x,
        y,
        color: annotationColor,
        strokeWidth,
        width: 0,
        height: 0,
        endX: x,
        endY: y
      };
      setAnnotations(prev => [...prev, annotation]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeAnnotationTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (activeAnnotationTool === 'freehand' && isDrawing) {
      setCurrentPath(prev => [...prev, { x, y }]);
    } else if (annotations.length > 0) {
      const lastAnnotation = annotations[annotations.length - 1];
      const updatedAnnotation = {
        ...lastAnnotation,
        width: x - lastAnnotation.x,
        height: y - lastAnnotation.y,
        endX: x,
        endY: y
      };
      setAnnotations(prev => [...prev.slice(0, -1), updatedAnnotation]);
    }
  };

  const handleMouseUp = () => {
    if (activeAnnotationTool === 'freehand' && isDrawing) {
      const annotation: AnnotationItem = {
        id: crypto.randomUUID(),
        type: 'freehand',
        x: 0,
        y: 0,
        color: annotationColor,
        strokeWidth,
        points: currentPath
      };
      setAnnotations(prev => [...prev, annotation]);
      setCurrentPath([]);
      setIsDrawing(false);
    }
  };

  const exportImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;

    let processedFile = selectedImage.file;

    // Apply compression if needed
    if (compressionSettings.quality < 100) {
      processedFile = await compressImage(processedFile, compressionSettings);
    }

    // Convert format if needed
    if (formatSettings.format !== selectedImage.type.split('/')[1]) {
      processedFile = await convertImageFormat(processedFile, formatSettings);
    }

    const dataURL = canvas.toDataURL(`image/${formatSettings.format}`, formatSettings.quality / 100);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `edited_${selectedImage.name}`;
    link.click();
  };

  const handleExifToggle = async () => {
    if (!selectedImage) return;

    let processedFile = selectedImage.file;
    
    if (!compressionSettings.preserveExif) {
      processedFile = await removeExifData(processedFile);
    }

    const updatedImage = {
      ...selectedImage,
      file: processedFile,
      metadata: {
        ...selectedImage.metadata!,
        hasExif: compressionSettings.preserveExif
      }
    };

    updateImage(updatedImage);
  };

  const annotationTools = [
    { icon: Square, type: 'rectangle', label: 'Rectangle' },
    { icon: Circle, type: 'circle', label: 'Circle' },
    { icon: ArrowRight, type: 'arrow', label: 'Arrow' },
    { icon: Minus, type: 'line', label: 'Line' },
    { icon: Edit3, type: 'freehand', label: 'Freehand' }
  ];

  if (!selectedImage) {
    return (
      <div className={`text-center py-12 rounded-2xl backdrop-blur-sm border ${
        isDarkMode 
          ? 'bg-gray-800/30 border-gray-700' 
          : 'bg-white/50 border-gray-200'
      }`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Select an image to start editing
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
          Image Editor
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Settings size={16} />
            Advanced
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDarkMode 
              ? 'bg-purple-900/50 text-purple-300' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {selectedImage.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <div className={`lg:col-span-1 space-y-4 rounded-2xl p-6 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Tools
          </h3>

          {/* Basic Tools */}
          <div className="space-y-2">
            <button
              onClick={rotateImage}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <RotateCw size={18} />
              Rotate
            </button>

            <button
              onClick={() => setActiveTextTool(!activeTextTool)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                activeTextTool
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <Type size={18} />
              Text
            </button>

            <button
              onClick={exportImage}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Download size={18} />
              Export
            </button>
          </div>

          {/* Annotation Tools */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className={`text-sm font-medium mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Annotations
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {annotationTools.map((tool) => (
                <button
                  key={tool.type}
                  onClick={() => setActiveAnnotationTool(
                    activeAnnotationTool === tool.type ? null : tool.type
                  )}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg font-medium transition-all duration-200 ${
                    activeAnnotationTool === tool.type
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <tool.icon size={16} />
                  <span className="text-xs">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Annotation Settings */}
            {activeAnnotationTool && (
              <div className="mt-3 space-y-2">
                <div>
                  <label className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Color
                  </label>
                  <input
                    type="color"
                    value={annotationColor}
                    onChange={(e) => setAnnotationColor(e.target.value)}
                    className="w-full h-8 rounded"
                  />
                </div>
                <div>
                  <label className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Stroke Width: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Tool Options */}
          {activeTextTool && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter text..."
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <div>
                <label className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Color
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className={`lg:col-span-3 rounded-2xl overflow-hidden backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="p-6">
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                onClick={addTextOverlay}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`max-w-full h-auto rounded-lg border cursor-${
                  activeTextTool ? 'crosshair' : activeAnnotationTool ? 'crosshair' : 'default'
                } ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                style={{ maxHeight: '70vh' }}
              />
              
              {(activeTextTool || activeAnnotationTool) && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                  {activeTextTool ? 'Click to add text' : `Click and drag to draw ${activeAnnotationTool}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings Panel */}
      {showAdvancedPanel && (
        <div className={`rounded-2xl p-6 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Advanced Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Watermark Settings */}
            <div className="space-y-4">
              <h4 className={`font-medium flex items-center gap-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Droplets size={18} />
                Watermark
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={watermarkSettings.text}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Watermark text"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <select
                  value={watermarkSettings.position}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, position: e.target.value as any }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
                <div>
                  <label className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Opacity: {Math.round(watermarkSettings.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={watermarkSettings.opacity}
                    onChange={(e) => setWatermarkSettings(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Compression Settings */}
            <div className="space-y-4">
              <h4 className={`font-medium flex items-center gap-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Zap size={18} />
                Compression
              </h4>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Quality: {compressionSettings.quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={compressionSettings.quality}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Max Width
                  </label>
                  <input
                    type="number"
                    value={compressionSettings.maxWidth}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, maxWidth: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compressionSettings.preserveExif}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, preserveExif: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Preserve EXIF data
                  </span>
                </label>
              </div>
            </div>

            {/* Format Conversion */}
            <div className="space-y-4">
              <h4 className={`font-medium flex items-center gap-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FileImage size={18} />
                Format
              </h4>
              <div className="space-y-3">
                <select
                  value={formatSettings.format}
                  onChange={(e) => setFormatSettings(prev => ({ ...prev, format: e.target.value as any }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="avif">AVIF</option>
                </select>
                {formatSettings.format !== 'png' && (
                  <div>
                    <label className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Quality: {formatSettings.quality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formatSettings.quality}
                      onChange={(e) => setFormatSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;