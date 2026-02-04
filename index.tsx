
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const startApp = () => {
  const rootElement = document.getElementById('root');
  const loader = document.getElementById('fallback-loader');

  // Función inmediata para liberar la pantalla
  const clearLoader = () => {
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  };

  if (!rootElement) {
    console.error("Critical: Root not found");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    
    // En cuanto React toma el control, borramos el loader
    // No esperamos a 'load' ni 'complete' para evitar cuellos de botella
    clearLoader();
    
  } catch (err) {
    console.error("Mount error:", err);
    clearLoader();
    rootElement.innerHTML = `<div style="color:white; padding:20px; font-family:sans-serif;">Error al iniciar: ${err}</div>`;
  }
};

startApp();
