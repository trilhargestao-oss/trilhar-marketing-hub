import { useState, useEffect } from 'react';
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

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#94a3b8' }}>
        Iniciando ambiente seguro...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
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
  );
}

export default App;
