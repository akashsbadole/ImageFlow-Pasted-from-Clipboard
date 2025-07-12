import QRCode from 'qrcode';

export const generateQRCode = async (
  text: string,
  options: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  } = {}
): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: options.width || 200,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw error;
  }
};

export const generateQRCodeToCanvas = async (
  canvas: HTMLCanvasElement,
  text: string,
  isDarkMode: boolean = false
): Promise<void> => {
  try {
    await QRCode.toCanvas(canvas, text, {
      width: 200,
      margin: 2,
      color: {
        dark: isDarkMode ? '#FFFFFF' : '#000000',
        light: isDarkMode ? '#1F2937' : '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('QR Code canvas generation failed:', error);
    throw error;
  }
};