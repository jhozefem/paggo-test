import React, { createContext, useContext, useState, ReactNode } from 'react';
import en from '../locales/en';

// Define available locales
export type Locale = 'en';
export type LocaleMessages = typeof en;

// Define context type
interface LocaleContextType {
  locale: Locale;
  messages: LocaleMessages;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// Create context with default values
const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  messages: en,
  setLocale: () => {},
  t: () => '',
});

// Hook for using the locale context
export const useLocale = () => useContext(LocaleContext);

// Context provider component
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const [messages, setMessages] = useState<LocaleMessages>(en);

  // Function to change the locale
  const changeLocale = async (newLocale: Locale) => {
    setLocale(newLocale);
    // For future use when supporting multiple languages
    // Here you would dynamically import the locale file
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      if (value[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      value = value[k];
    }
    
    return value;
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        messages,
        setLocale: changeLocale,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}; 