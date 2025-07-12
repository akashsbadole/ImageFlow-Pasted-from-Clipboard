import { create } from 'zustand';
import { ImageItem, TextOverlay, AnnotationItem } from '../types/ImageTypes';

interface ImageStore {
  images: ImageItem[];
  selectedImage: ImageItem | null;
  activeTab: 'upload' | 'gallery' | 'edit' | 'share';
  isDarkMode: boolean;
  
  // Actions
  addImages: (images: ImageItem[]) => void;
  updateImage: (image: ImageItem) => void;
  selectImage: (image: ImageItem | null) => void;
  setActiveTab: (tab: 'upload' | 'gallery' | 'edit' | 'share') => void;
  toggleDarkMode: () => void;
  removeImage: (id: string) => void;
}

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  selectedImage: null,
  activeTab: 'upload',
  isDarkMode: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : false,

  addImages: (newImages) => set((state) => ({
    images: [...state.images, ...newImages]
  })),

  updateImage: (updatedImage) => set((state) => ({
    images: state.images.map(img => 
      img.id === updatedImage.id ? updatedImage : img
    ),
    selectedImage: state.selectedImage?.id === updatedImage.id 
      ? updatedImage 
      : state.selectedImage
  })),

  selectImage: (image) => set({ selectedImage: image }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (typeof window !== 'undefined') {
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { isDarkMode: newMode };
  }),

  removeImage: (id) => set((state) => ({
    images: state.images.filter(img => img.id !== id),
    selectedImage: state.selectedImage?.id === id ? null : state.selectedImage
  }))
}));