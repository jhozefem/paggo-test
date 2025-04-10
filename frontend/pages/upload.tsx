import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import FileDropzone from '../components/FileDropzone';

const Upload: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleFileAccepted = (acceptedFile: File) => {
    setFile(acceptedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStage('Uploading file');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            setUploadProgress(percentCompleted);
            
            if (percentCompleted === 100) {
              setProcessingStage('Processing file with OCR');
            }
          },
        }
      );

      setProcessingStage('Complete');
      router.push(`/documents/${response.data.document.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading file');
      setIsUploading(false);
      setProcessingStage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Upload Document</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <FileDropzone onFileAccepted={handleFileAccepted} />
            
            {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}
            
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
            
            {isUploading && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {processingStage} {uploadProgress < 100 ? `(${uploadProgress}%)` : ''}
                </p>
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload; 