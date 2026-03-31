import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import Login from './pages/Login/Login';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#94a3b8' }}>
        Iniciando Trilhar...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <h1>Logado com sucesso!</h1>
      <button onClick={() => supabase.auth.signOut()}>Sair</button>
    </div>
  );
}

export default App;
