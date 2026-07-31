import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export const ImageViewer = React.memo(({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const imgRef = useRef(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.5, 1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((s) => Math.min(Math.max(1, s + delta), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = dist / lastTouchDistance;
      setScale((s) => Math.min(Math.max(1, s * delta), 5));
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  useEffect(() => {
    if (scale === 1) setPosition({ x: 0, y: 0 });
  }, [scale]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black/90 select-none">
      {/* Zoom Controls */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-white text-sm font-bold font-mono min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-white/20 mx-2" />
        <button
          onClick={handleReset}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none pb-16 sm:pb-24"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          className="max-w-full max-h-full object-contain pointer-events-auto"
          draggable={false}
          onError={(e) => {
            if (src && !e.target.dataset.retried) {
              e.target.dataset.retried = 'true';
              const isSignedUrl = src?.includes('X-Goog-Signature');
              const retryUrl = isSignedUrl
                ? src
                : src + (src.includes('?') ? '&' : '?') + 'retry=' + Date.now();
              e.target.src = retryUrl;
            } else {
              e.target.src = `https://placehold.co/800x600/333/eee?text=Image+Loading+Failed%0AClick+to+Retry`;
              e.target.style.cursor = 'pointer';
              e.target.onclick = (event) => {
                event.stopPropagation();
                const isSignedUrl = src?.includes('X-Goog-Signature');
                e.target.src = isSignedUrl
                  ? src
                  : src + (src.includes('?') ? '&' : '?') + 'reload=' + Date.now();
              };
            }
          }}
        />
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';
export default ImageViewer;
