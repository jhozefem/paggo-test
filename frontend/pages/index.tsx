import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import DocumentCard from '../components/DocumentCard';
import { useLocale } from '../contexts/LocaleContext';
import T from '../components/T';

interface Document {
  id: string;
  fileName: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const router = useRouter();
  const { t } = useLocale();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocuments(response.data);
      } catch (err: any) {
        setError(t('home.failedToLoad'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [router, t]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            <T id="home.title" />
          </h1>
          <button
            onClick={() => router.push('/upload')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <T id="home.uploadButton" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              <T id="home.noDocuments" />
            </h3>
            <p className="text-gray-500">
              <T id="home.subtitle" />
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} id={doc.id} fileName={doc.fileName} createdAt={doc.createdAt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 