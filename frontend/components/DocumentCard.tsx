import React from 'react';
import Link from 'next/link';
import { FiFileText, FiClock } from 'react-icons/fi';
import { useLocale } from '../contexts/LocaleContext';
import T from './T';

interface DocumentCardProps {
  id: string;
  fileName: string;
  createdAt: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  fileName,
  createdAt,
}) => {
  const { locale } = useLocale();
  
  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/documents/${id}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
    >
      <div className="flex justify-between">
        <div className="flex items-start">
          <div className="mr-3 text-primary-500">
            <FiFileText size={24} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{fileName}</h3>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <FiClock className="mr-1" size={14} />
              <span><T id="home.processedAt" />: {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard; 