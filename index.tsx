
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  const loader = document.getElementById('fallback-loader');

  if (!rootElement) return;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // En producción, queremos que el loader desaparezca lo antes posible
    const removeLoader = () => {
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    };

    if (document.readyState === 'complete') {
      removeLoader();
    } else {
      window.addEventListener('load', removeLoader);
    }

  } catch (error) {
    console.error("Mount Error:", error);
    // Si falla el render, removemos el loader para ver el mensaje de error de App o el watchdog.
    if (loader) loader.remove();
  }
};

mountApp();
