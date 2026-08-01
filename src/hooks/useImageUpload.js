import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useImageUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const uploadInputRef = useRef(null);
  const driveInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processFile = useCallback(file => {
    if (!file) return;

    let fileName = file.name || `file_${Date.now()}`;
    let fileType = file.type;

    if (!fileType && fileName.includes('.')) {
      const ext = fileName.split('.').pop().toLowerCase();
      const mimeMap = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        doc: 'application/msword',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xls: 'application/vnd.ms-excel',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ppt: 'application/vnd.ms-powerpoint',
        txt: 'text/plain',
        csv: 'text/csv',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
      };
      if (mimeMap[ext]) fileType = mimeMap[ext];
    }

    const fileWithMetadata = new File([file], fileName, {
      type: fileType || 'application/octet-stream',
    });
    setSelectedFiles(prev => [...prev, fileWithMetadata]);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews(prev => [
        ...prev,
        {
          url: reader.result,
          name: fileName,
          type: fileType || 'application/octet-stream',
          size: file.size,
          id: Math.random().toString(36).substr(2, 9),
        },
      ]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback(
    e => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      files.forEach(file => processFile(file));
    },
    [processFile]
  );

  const handleRemoveFile = useCallback(id => {
    if (id) {
      setFilePreviews(prev => {
        const previewToRemove = prev.find(p => p.id === id);
        if (previewToRemove) {
          setSelectedFiles(sf => sf.filter(f => f.name !== previewToRemove.name));
        }
        return prev.filter(p => p.id !== id);
      });
    } else {
      setSelectedFiles([]);
      setFilePreviews([]);
    }
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (driveInputRef.current) driveInputRef.current.value = '';
    if (photosInputRef.current) photosInputRef.current.value = '';
  }, []);

  const handlePaste = useCallback(
    e => {
      const items = e.clipboardData?.items;
      const files = e.clipboardData?.files;
      let handled = false;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file') {
            const file = items[i].getAsFile();
            if (file) {
              processFile(file);
              handled = true;
            }
          }
        }
      }

      if (!handled && files && files.length > 0) {
        Array.from(files).forEach(file => {
          processFile(file);
          handled = true;
        });
      }

      if (handled) {
        e.preventDefault();
        toast.success('File pasted! 📎');
      }
    },
    [processFile]
  );

  return {
    selectedFiles,
    filePreviews,
    uploadInputRef,
    driveInputRef,
    photosInputRef,
    cameraInputRef,
    processFile,
    handleFileSelect,
    handleRemoveFile,
    handlePaste,
  };
};

export default useImageUpload;
