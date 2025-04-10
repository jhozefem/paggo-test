import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

interface TProps {
  id: string;
  values?: Record<string, string | number>;
}

/**
 * Component for easy localization in JSX
 * Usage: <T id="common.backToHome" />
 * With variables: <T id="greeting" values={{ name: 'John' }} />
 */
const T: React.FC<TProps> = ({ id, values }) => {
  const { t } = useLocale();
  
  let text = t(id);
  
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
  }
  
  return <>{text}</>;
};

export default T; 