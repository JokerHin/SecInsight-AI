"use client";
import { useState, useCallback } from "react";

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.name.endsWith(".csv")) {
          setSelectedFile(file);
          onUpload(file);
        } else {
          alert("Please upload a CSV file");
        }
      }
    },
    [onUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
        onUpload(file);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  return (
    <div
      className={`relative border-4 border-dashed rounded-2xl p-12 transition-all duration-300 ${
        isDragging
          ? "border-cyan-400 bg-cyan-50 bg-opacity-10"
          : "border-gray-600 bg-slate-800 bg-opacity-50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
      />
      <div className="text-center pointer-events-none">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {selectedFile ? (
          <div>
            <p className="text-lg font-semibold text-cyan-400 mb-2">
              ✓ {selectedFile.name}
            </p>
            <p className="text-sm text-gray-400">Processing with AI...</p>
          </div>
        ) : (
          <>
            <p className="text-xl font-semibold text-white mb-2">
              Drop your security CSV here
            </p>
            <p className="text-sm text-gray-400">
              or click to browse from your computer
            </p>
          </>
        )}
      </div>
    </div>
  );
}
