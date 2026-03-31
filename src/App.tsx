import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
import TeamView from './pages/TeamView/TeamView';

// Componente para capturar erros fatais e evitar tela preta
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: ErrorInfo) { console.error("ERRO FATAL:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#1a1d27', color: '#ef4444', height: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Ops! Algo deu errado.</h2>
          <p>O sistema encontrou um erro ao carregar os componentes.</p>
          <pre style={{ background: '#0f1117', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#94a3b8' }}>
        Iniciando Trilhar...
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
            <Route path="team" element={<TeamView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
