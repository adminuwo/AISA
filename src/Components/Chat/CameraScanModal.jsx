import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, RefreshCw, Check, Upload, AlertCircle, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraScanModal = ({ isOpen, onClose, onCapture, onFallbackUpload }) => {
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks helper
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCameraReady(false);
  }, []);

  // Start camera with preferred facingMode or deviceId
  const startCamera = useCallback(
    async (deviceIndex = 0) => {
      stopStream();
      setCameraError('');
      setIsCameraReady(false);
      setCapturedImage(null);
      setCapturedBlob(null);

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

        // Enumerate devices to allow switching
        let videoDevices = [];
        try {
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          videoDevices = allDevices.filter(d => d.kind === 'videoinput');
          setDevices(videoDevices);
        } catch (e) {
          console.warn('Could not enumerate video devices', e);
        }

        const selectedDevice = videoDevices[deviceIndex];
        const constraints = {
          video: selectedDevice?.deviceId
            ? {
                deviceId: { exact: selectedDevice.deviceId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }
            : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
          audio: false,
        };

        let mediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (primaryErr) {
          // Fallback to basic video constraint
          console.warn('Primary constraint failed, falling back to basic video', primaryErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(e => console.warn('Play error:', e));
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error('[CameraScanModal] Error accessing camera:', err);
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'Camera permission was denied. Please allow camera access in your browser settings.'
            : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
              ? 'No camera was found on your device.'
              : err.message || 'Unable to access the camera.'
        );
      }
    },
    [stopStream]
  );

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera(activeDeviceIndex);
    } else {
      stopStream();
      setCapturedImage(null);
      setCapturedBlob(null);
      setCameraError('');
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Switch between available cameras
  const handleSwitchCamera = () => {
    if (devices.length <= 1) return;
    const nextIndex = (activeDeviceIndex + 1) % devices.length;
    setActiveDeviceIndex(nextIndex);
    startCamera(nextIndex);
  };

  // Capture current video frame
  const handleCapture = () => {
    if (!videoRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      blob => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setCapturedImage(previewUrl);
          setCapturedBlob(blob);
          // Pause stream while previewing
          stopStream();
        }
      },
      'image/jpeg',
      0.92
    );
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera(activeDeviceIndex);
  };

  // Confirm photo and attach to chat
  const handleConfirm = () => {
    if (!capturedBlob) return;

    const fileName = `scan_${Date.now()}.jpg`;
    const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });

    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }

    stopStream();
    onCapture(file);
    onClose();
  };

  const handleClose = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-[680px] bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Scan className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Camera & Document Scan
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {capturedImage
                    ? 'Review photo before attaching'
                    : isCameraReady
                      ? 'Align document or object in frame'
                      : 'Initializing camera...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {devices.length > 1 && !capturedImage && isCameraReady && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                  title="Switch camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewfinder / Preview Body */}
          <div className="relative w-full bg-black aspect-[4/3] sm:aspect-[16/10] overflow-hidden flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                capturedImage ? 'hidden' : isCameraReady ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Frozen Capture Preview */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured scan"
                className="w-full h-full object-contain bg-black"
              />
            )}

            {/* Camera Viewfinder Guides (when live) */}
            {!capturedImage && isCameraReady && (
              <div className="absolute inset-0 pointer-events-none p-6 sm:p-10 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-xl shadow-sm" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-xl shadow-sm" />
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-xl shadow-sm" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-xl shadow-sm" />
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {!capturedImage && !isCameraReady && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 text-white p-6">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Starting Camera...
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 text-white p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-white mb-1">Camera Unavailable</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => startCamera(activeDeviceIndex)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
                  >
                    Try Again
                  </button>
                  {onFallbackUpload && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onFallbackUpload();
                      }}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Choose File From Device
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-3">
            {/* Left: Alternate action */}
            {onFallbackUpload && !capturedImage ? (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onFallbackUpload();
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from files</span>
              </button>
            ) : (
              <div />
            )}

            {/* Center / Action Buttons */}
            <div className="flex items-center gap-3">
              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-primary/30"
                  >
                    <Check className="w-4 h-4" />
                    Use Photo & Attach
                  </button>
                </>
              ) : (
                isCameraReady && (
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="relative group p-1 rounded-full border-2 border-white/30 hover:border-primary transition-all active:scale-95"
                    title="Capture photo"
                  >
                    <div className="w-14 h-14 rounded-full bg-white group-hover:bg-primary transition-colors flex items-center justify-center text-slate-900 group-hover:text-white shadow-lg">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>
                )
              )}
            </div>

            <div />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CameraScanModal;
