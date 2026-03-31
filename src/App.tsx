import { useState, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';

import Layout from './components/layout/Layout';
import Identity from './pages/Identity/Identity';
import Copies from './pages/Copies/Copies';
import Hashtags from './pages/Hashtags/Hashtags';
import Goals from './pages/Goals/Goals';
import Metrics from './pages/Metrics/Metrics';
import References from './pages/References/References';
import Content from './pages/Content/Content';
import Calendar from './pages/Calendar/Calendar';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';

// Componente simples para capturar erros fatais
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ERRO FATAL DETECTADO:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#450a0a', color: '#fecaca', height: '100vh', fontFamily: 'monospace' }}>
          <h1>Algo deu errado no React</h1>
          <pre>{this.state.error?.toString()}</pre>
          <p>Tente recarregar a página ou verifique os logs no console.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'white', 
      color: 'black',
      fontSize: '32px',
      fontWeight: 'bold',
      position: 'fixed',
      inset: 0,
      zIndex: 9999
    }}>
      TESTE DE RENDERIZAÇÃO: SE VOCÊ ESTÁ VENDO ISSO, O REACT FUNCIONOU!
    </div>
  );
}

export default App;
