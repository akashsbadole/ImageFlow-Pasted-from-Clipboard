import imageCompression from 'browser-image-compression';
import EXIF from 'exif-js';
import { CompressionSettings, FormatConversionSettings } from '../types/ImageTypes';

export const compressImage = async (
  file: File, 
  settings: CompressionSettings
): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: settings.maxWidth || 1920,
    useWebWorker: true,
    quality: settings.quality / 100,
    preserveExif: settings.preserveExif
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file;
  }
};

export const convertImageFormat = async (
  file: File,
  settings: FormatConversionSettings
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${settings.format}`;
        const quality = settings.quality ? settings.quality / 100 : 0.9;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], 
              file.name.replace(/\.[^/.]+$/, `.${settings.format}`), 
              { type: mimeType }
            );
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, mimeType, quality);
      } else {
        resolve(file);
      }
    };

    img.src = URL.createObjectURL(file);
  });
};

export const extractExifData = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    EXIF.getData(file as any, function() {
      const exifData = EXIF.getAllTags(this);
      resolve(exifData);
    });
  });
};

export const removeExifData = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, file.type);
      } else {
        resolve(file);
      }
    };

    img.src = URL.createObjectURL(file);
  });
};

export const addWatermark = async (
  canvas: HTMLCanvasElement,
  watermarkText: string,
  position: string,
  opacity: number,
  size: number
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = `${size}px Arial`;
  ctx.textAlign = 'center';

  const textWidth = ctx.measureText(watermarkText).width;
  const textHeight = size;

  let x, y;
  switch (position) {
    case 'top-left':
      x = textWidth / 2 + 20;
      y = textHeight + 20;
      break;
    case 'top-right':
      x = canvas.width - textWidth / 2 - 20;
      y = textHeight + 20;
      break;
    case 'bottom-left':
      x = textWidth / 2 + 20;
      y = canvas.height - 20;
      break;
    case 'bottom-right':
      x = canvas.width - textWidth / 2 - 20;
      y = canvas.height - 20;
      break;
    case 'center':
    default:
      x = canvas.width / 2;
      y = canvas.height / 2;
      break;
  }

  ctx.fillText(watermarkText, x, y);
  ctx.restore();
};