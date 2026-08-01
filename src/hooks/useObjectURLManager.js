import { useRef, useCallback, useEffect } from 'react';

export const useObjectURLManager = () => {
  const urlsRef = useRef(new Set());

  const createURL = useCallback(blob => {
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  }, []);

  const revokeURL = useCallback(url => {
    if (url && urlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
    }
  }, []);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn('[useObjectURLManager] Error revoking URL:', e);
        }
      });
      urls.clear();
    };
  }, []);

  return { createURL, revokeURL };
};

export default useObjectURLManager;
