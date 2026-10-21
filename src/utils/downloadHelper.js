import toast from 'react-hot-toast';
import { getMediaProxyUrl, resolveMediaUrl } from '../types';

/**
 * Downloads any media asset reliably across origins, browsers, and devices.
 *
 * Supports:
 * - Base64 data URLs (data:image/...)
 * - Local blob URLs (blob:...)
 * - Direct HTTP/HTTPS fetches (same-origin or CORS-enabled)
 * - Cross-origin Google Cloud Storage signed URLs via backend proxy with CORS
 * - Content-Disposition attachment fallback
 *
 * @param {string} url - Target media URL
 * @param {string} [customFilename='AISA-download.png'] - Destination filename
 * @returns {Promise<boolean>} - Whether download was successfully triggered
 */
export const downloadMediaAsset = async (url, customFilename = 'AISA-download.png') => {
  if (!url || typeof url !== 'string') return false;

  const filename = customFilename || 'AISA-download.png';
  const downloadToast = toast.loading('Preparing download...');

  const triggerBlobDownload = (blob, outName) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = outName || filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  };

  try {
    // 1. Base64 Data URL: Convert in-memory to Blob directly (instant, offline)
    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(parts[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      const blob = new Blob([u8arr], { type: mime });
      triggerBlobDownload(blob, filename);
      toast.success('Download complete!', { id: downloadToast });
      return true;
    }

    // 2. Blob URL: Trigger anchor click directly
    if (url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 1000);
      toast.success('Download complete!', { id: downloadToast });
      return true;
    }

    // 3. Attempt direct fetch (works if same-origin or CORS headers already present)
    const directUrl = resolveMediaUrl(url);
    try {
      const directRes = await fetch(directUrl, { mode: 'cors' });
      if (directRes.ok) {
        const blob = await directRes.blob();
        triggerBlobDownload(blob, filename);
        toast.success('Download complete!', { id: downloadToast });
        return true;
      }
    } catch (_) {
      // Direct fetch failed (likely CORS on Google Cloud Storage) - proceed to backend proxy
    }

    // 4. Fetch via Backend Media Proxy (backend injects Access-Control-Allow-Origin: *)
    const proxyDownloadUrl = getMediaProxyUrl(url, { download: true, filename });

    try {
      const proxyRes = await fetch(proxyDownloadUrl);
      if (proxyRes.ok) {
        const blob = await proxyRes.blob();
        triggerBlobDownload(blob, filename);
        toast.success('Download complete!', { id: downloadToast });
        return true;
      }
    } catch (proxyFetchErr) {
      console.warn(
        '[DownloadHelper] Proxy fetch blob failed, falling back to anchor stream:',
        proxyFetchErr
      );
    }

    // 5. Native browser attachment trigger via backend stream
    const a = document.createElement('a');
    a.href = proxyDownloadUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 3000);
    toast.success('Download started!', { id: downloadToast });
    return true;
  } catch (err) {
    console.error('[DownloadHelper] Download failed:', err);
    toast.error('Download failed. Opening in new tab...', { id: downloadToast });
    window.open(url, '_blank');
    return false;
  }
};
