
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Senior Production Resilience Pattern:
 * Capturamos cualquier error de carga inicial para evitar la "pantalla azul/negra" persistente.
 */
const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    const loader = document.getElementById('fallback-loader');

    if (!rootElement) {
      console.error("FATAL: No se encontró el elemento raíz (#root).");
      return;
    }

    const root = ReactDOM.createRoot(rootElement);
    
    // Renderizamos la aplicación
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // CRITICAL: Eliminamos el cargador estático del HTML una vez que React toma el control.
    // Esto resuelve el problema de la pantalla de "Iniciando Campus..." que no desaparecía.
    if (loader) {
      // Damos un pequeño margen para que el primer frame de React se dibuje
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }, 100);
    }

  } catch (error) {
    console.error("CRITICAL BOOT ERROR:", error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 40px; color: white; background: #020617; height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <h1 style="color: #ef4444; margin-bottom: 16px;">Error de Ejecución</h1>
          <p style="color: #94a3b8; max-width: 400px; line-height: 1.6;">El sistema no pudo iniciar el motor de React. Esto suele deberse a una falla en la carga de módulos externos o variables de entorno.</p>
          <pre style="background: #1e293b; padding: 20px; border-radius: 12px; margin-top: 20px; font-size: 10px; color: #38bdf8; text-align: left; max-width: 90%; overflow: auto;">${error}</pre>
          <button onclick="window.location.reload()" style="margin-top: 30px; padding: 12px 24px; background: white; color: black; border-radius: 8px; font-weight: bold; cursor: pointer;">Reintentar</button>
        </div>
      `;
    }
  }
};

mountApp();
