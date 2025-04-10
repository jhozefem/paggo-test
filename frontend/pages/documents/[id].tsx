import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { FiDownload } from 'react-icons/fi';
import { useLocale } from '../../contexts/LocaleContext';

interface Document {
  id: string;
  fileName: string;
  textContent: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

const DocumentDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLocale();
  
  const [docData, setDocData] = useState<Document | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!id) return;

    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upload/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocData(response.data);
        
        // In a real app, you would also fetch the conversations here
        setConversations(response.data.conversations || []);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id, router]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    const token = Cookies.get('token');
    if (!token || !id) return;
    
    setIsAskingQuestion(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/${id}/ask`,
        { question },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const newConversation = response.data;
      setConversations([newConversation, ...conversations]);
      setQuestion('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to ask question');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleDownload = async () => {
    const token = Cookies.get('token');
    if (!token || !id) return;

    setIsDownloading(true);
    
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/upload/${id}/download`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        responseType: 'blob'
      });

      console.log(response.data);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docData?.fileName || 'document');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t('document.failedToDownload'));
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.notFound')}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{docData.fileName}</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
            >
              <FiDownload className="mr-2" />
              {isDownloading ? t('common.downloading') : t('common.download')}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {t('common.backToHome')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Text Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('document.title')}</h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {docData.textContent || t('document.noContent')}
              </pre>
            </div>
          </div>

          {/* Ask Questions Panel */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('document.askQuestions')}</h2>
            
            <form onSubmit={handleAskQuestion}>
              <div className="mb-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t('document.questionPlaceholder')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isAskingQuestion || !question.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isAskingQuestion ? t('document.processingQuestion') : t('document.askButton')}
                </button>
              </div>
            </form>

            {/* Conversation History */}
            <div className="mt-8">
              <h3 className="text-md font-medium mb-4">{t('document.conversationHistory')}</h3>
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('document.noQuestions')}</p>
              ) : (
                <div className="space-y-6">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="border-l-4 border-primary-500 pl-4">
                      <p className="font-medium text-gray-800">{conv.question}</p>
                      <p className="mt-2 text-gray-600 text-sm">{conv.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail; 