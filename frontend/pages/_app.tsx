import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { LocaleProvider } from '../contexts/LocaleContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LocaleProvider>
      <Component {...pageProps} />
    </LocaleProvider>
  );
}

export default MyApp; 