/**
 * BulkUploader Component
 * Drag-and-drop file upload with validation and preview
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateFileSize, validateFileType, formatFileSize } from '@/utils/fileProcessing';

interface BulkUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

export default function BulkUploader({
  onFileSelect,
  acceptedTypes = ['csv', 'xlsx', 'xls'],
  maxSizeMB = 100,
  className,
}: BulkUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!validateFileType(file, acceptedTypes)) {
        return `Invalid file type. Please upload ${acceptedTypes.join(', ')} files only.`;
      }

      if (!validateFileSize(file, maxSizeMB)) {
        return `File size exceeds ${maxSizeMB}MB limit.`;
      }

      return null;
    },
    [acceptedTypes, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : error
            ? 'border-red-300 bg-red-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.map((type) => `.${type}`).join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="p-8">
          {!selectedFile && !error && (
            <div className="text-center">
              <Upload
                className={cn(
                  'mx-auto h-12 w-12 mb-4',
                  isDragging ? 'text-primary' : 'text-gray-400'
                )}
              />
              <p className="text-base font-medium text-gray-700 mb-1">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse from your computer
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseClick}
              >
                Browse Files
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: {acceptedTypes.join(', ').toUpperCase()} (max {maxSizeMB}MB)
              </p>
            </div>
          )}

          {selectedFile && !error && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-sm font-medium text-red-700 mb-4">{error}</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseClick}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedFile && !error && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <File className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                File uploaded successfully
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Click Continue to preview and map columns
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
