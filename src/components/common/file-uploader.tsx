'use client';

import React, { useState } from 'react';
import { CloudArrowUp, CheckCircle, WarningCircle, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { getApiBaseUrl } from '@/lib/api';

interface FileUploaderProps {
  onUploadSuccess: (url: string, filename: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUploader({
  onUploadSuccess,
  accept = '*/*',
  maxSizeMB = 10,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds limit of ${maxSizeMB}MB`);
        return;
      }
      setFile(selected);
      setError(null);
      setSuccess(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const xhr = new XMLHttpRequest();
      const apiBase = getApiBaseUrl();
      xhr.open('POST', `${apiBase}/notifications/upload-attachment`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          setSuccess(true);
          onUploadSuccess(res.attachment_url, res.attachment_name || file.name);
        } else {
          setError('Upload failed. Please try again.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Network error during upload.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch {
      setError('An error occurred during upload.');
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/70 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-900/40">
        <CloudArrowUp size={36} className="text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-200">
          {file ? file.name : 'Choose a file or drag and drop'}
        </p>
        <p className="text-xs text-slate-500 mt-1">Up to {maxSizeMB}MB</p>

        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />

        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="file-upload-input">
            <span className="inline-flex items-center justify-center rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 px-3 py-1.5 cursor-pointer border border-slate-700">
              Browse
            </span>
          </label>
          {file && !success && (
            <Button
              size="sm"
              onClick={uploadFile}
              disabled={uploading}
              className="text-xs"
            >
              {uploading ? `Uploading (${progress}%)` : 'Upload Now'}
            </Button>
          )}
        </div>

        {uploading && (
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {success && (
          <div className="flex items-center text-xs text-emerald-400 mt-3">
            <CheckCircle size={16} className="mr-1.5" />
            File uploaded successfully
          </div>
        )}

        {error && (
          <div className="flex items-center text-xs text-rose-400 mt-3">
            <WarningCircle size={16} className="mr-1.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploader;
