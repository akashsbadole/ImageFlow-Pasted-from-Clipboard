export interface ImageItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  editHistory?: ImageEdit[];
  shareUrl?: string;
  metadata?: {
    width: number;
    height: number;
    hasExif: boolean;
    exifData?: any;
    originalSize: number;
    compressedSize?: number;
  };
  annotations?: AnnotationItem[];
  textOverlays?: TextOverlay[];
  watermark?: WatermarkSettings;
}

export interface ImageEdit {
  id: string;
  type: 'crop' | 'resize' | 'rotate' | 'text' | 'format' | 'compress' | 'watermark' | 'annotation';
  timestamp: Date;
  settings: any;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation?: number;
}

export interface AnnotationItem {
  id: string;
  type: 'arrow' | 'rectangle' | 'circle' | 'line' | 'freehand';
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  points?: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  fill?: boolean;
}

export interface WatermarkSettings {
  text?: string;
  image?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
}

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export interface CompressionSettings {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveExif: boolean;
}

export interface FormatConversionSettings {
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
}