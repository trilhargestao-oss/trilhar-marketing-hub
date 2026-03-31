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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App: Iniciando verificação de sessão...");
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("App: Erro ao buscar sessão:", error);
      }
      console.log("App: Sessão recuperada:", session ? "Logado" : "Deslogado");
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("App: Erro fatal ao buscar sessão:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("App: Estado de autenticação alterado:", _event, session ? "Com Sessão" : "Sem Sessão");
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#1a1d27', 
        color: '#ffffff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Trilhar Marketing Hub</div>
        <div style={{ color: '#94a3b8' }}>Iniciando ambiente seguro...</div>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#4b5563' }}>Se esta tela persistir, verifique a conexão com o banco de dados.</div>
      </div>
    );
  }

  if (!session) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="content" element={<Content />} />
            <Route path="copies" element={<Copies />} />
            <Route path="hashtags" element={<Hashtags />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="goals" element={<Goals />} />
            <Route path="references" element={<References />} />
            <Route path="identity" element={<Identity />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
