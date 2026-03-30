import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Lock, Mail, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './Login.css';

const Login = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos. Verifique seus dados do Supabase.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">{theme.brandName.charAt(0)}</div>
          <div>
            <h1 className="login-title">Acesso ao Hub</h1>
            <p className="login-subtitle">Entre com suas credenciais do {theme.brandName}</p>
          </div>
        </div>

        {error && (
          <div className="login-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> E-mail
            </label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> Senha
            </label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar no Hub'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
