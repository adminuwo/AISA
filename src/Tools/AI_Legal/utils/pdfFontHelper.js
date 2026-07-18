let regularFontBase64 = null;
let boldFontBase64 = null;

const arrayBufferToBase64 = buffer => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/**
 * Initializes and fetches Devanagari font files from the local public directory.
 * Converts the fonts to base64 strings and caches them in memory.
 */
export const initDevanagariFonts = async () => {
  if (regularFontBase64 && boldFontBase64) {
    return { regularFont: regularFontBase64, boldFont: boldFontBase64 };
  }

  try {
    const [regRes, boldRes] = await Promise.all([
      fetch('/fonts/NotoSansDevanagari-Regular.ttf'),
      fetch('/fonts/NotoSansDevanagari-Bold.ttf'),
    ]);

    if (!regRes.ok || !boldRes.ok) {
      throw new Error('Failed to load Devanagari font files from local server.');
    }

    const [regBuf, boldBuf] = await Promise.all([regRes.arrayBuffer(), boldRes.arrayBuffer()]);

    regularFontBase64 = arrayBufferToBase64(regBuf);
    boldFontBase64 = arrayBufferToBase64(boldBuf);

    return { regularFont: regularFontBase64, boldFont: boldFontBase64 };
  } catch (err) {
    console.error('[pdfFontHelper] Error loading Devanagari fonts:', err);
    return null;
  }
};

/**
 * Helper to add loaded Devanagari fonts to a jsPDF instance.
 */
export const addDevanagariFontsToDoc = (doc, fonts) => {
  if (!doc || !fonts) return;
  try {
    // Add Regular weight
    doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', fonts.regularFont);
    doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');

    // Add Bold weight
    doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', fonts.boldFont);
    doc.addFont('NotoSansDevanagari-Bold.ttf', 'NotoSansDevanagari', 'bold');
  } catch (err) {
    console.error('[pdfFontHelper] Error adding fonts to document:', err);
  }
};
