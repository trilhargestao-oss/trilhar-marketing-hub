import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Calendar, PenTool, Hash, Target, type LucideIcon, Rocket, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './Dashboard.css';

interface DashboardStats {
  todayPosts: any[];
  scheduledMonth: number;
  publishedMonth: number;
  totalCopies: number;
  activeGoals: number;
  latestFollowers: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayPosts: [],
    scheduledMonth: 0,
    publishedMonth: 0,
    totalCopies: 0,
    activeGoals: 0,
    latestFollowers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const startOfMonthStr = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const endOfMonthStr = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');

      // Fetch Today's Posts
      const { data: todayP } = await supabase
        .from('posts')
        .select('*')
        .eq('date', today)
        .order('time', { ascending: true });

      // Fetch Month Posts Count
      const { data: monthP } = await supabase
        .from('posts')
        .select('status')
        .gte('date', startOfMonthStr)
        .lte('date', endOfMonthStr);

      const scheduled = monthP?.filter(p => p.status === 'scheduled').length || 0;
      const published = monthP?.filter(p => p.status === 'published').length || 0;

      // Fetch Copies Count
      const { count: copiesCount } = await supabase
        .from('copies')
        .select('*', { count: 'exact', head: true });

      // Fetch Active Goals
      const { count: goalsCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true });

      // Fetch Latest Followers Metric
      const { data: latestM } = await supabase
        .from('metrics')
        .select('followers_total')
        .order('post_date', { ascending: false })
        .limit(1);
      
      const lastF = latestM?.[0]?.followers_total || 0;

      setStats({
        todayPosts: todayP || [],
        scheduledMonth: scheduled,
        publishedMonth: published,
        totalCopies: copiesCount || 0,
        activeGoals: goalsCount || 0,
        latestFollowers: lastF
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const Shortcut = ({ icon: Icon, label, path }: { icon: LucideIcon, label: string, path: string }) => (
    <div className="shortcut-btn" onClick={() => navigate(path)}>
      <Icon size={24} className="shortcut-icon" />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="welcome-text">Bem-vindo(a) ao Trilhar! 🚀</h1>
        <p className="welcome-sub">Aqui está o resumo da sua operação de marketing para hoje.</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Carregando seu painel...</div>
      ) : (
        <div className="dashboard-grid">
          
          {/* Section 1: Today */}
          <div className="dash-section">
            <h3 className="dash-section-title">
              <Clock size={20} /> Posts de Hoje
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.todayPosts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nenhum post agendado para hoje. Que tal criar um?</p>
              ) : (
                stats.todayPosts.map(post => (
                  <div key={post.id} className={`today-item ${post.status}`}>
                    {post.status === 'published' ? <CheckCircle size={16} color="var(--color-success)" /> : <div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-primary)'}} />}
                    <span className="today-time">{post.time.substring(0,5)}</span>
                    <span className="today-title">{post.title}</span>
                    <span className="badge" style={{ fontSize: '10px' }}>{post.platform}</span>
                  </div>
                ))
              )}
            </div>
            {stats.todayPosts.length === 0 && (
              <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => navigate('/calendar')}>
                Ir para o Calendário
              </button>
            )}
          </div>

          {/* Section 2: Resumo do Mês */}
          <div className="dash-section">
            <h3 className="dash-section-title">
              <Target size={20} /> Visão Geral (Histórico)
            </h3>
            
            <div className="dash-stat-row">
              <span className="dash-stat-label">Seguidores Atuais</span>
              <span className="dash-stat-value" style={{ color: 'var(--color-success)', fontWeight: 700 }}>{stats.latestFollowers.toLocaleString()}</span>
            </div>
            <div className="dash-stat-row">
              <span className="dash-stat-label">Posts Agendados (Mês)</span>
              <span className="dash-stat-value" style={{ color: 'var(--color-primary)' }}>{stats.scheduledMonth}</span>
            </div>
            <div className="dash-stat-row">
              <span className="dash-stat-label">Posts Publicados (Mês)</span>
              <span className="dash-stat-value">{stats.publishedMonth}</span>
            </div>
            <div className="dash-stat-row">
              <span className="dash-stat-label">Ideias e Copies salvas</span>
              <span className="dash-stat-value">{stats.totalCopies}</span>
            </div>
          </div>

          {/* Section 3: Atalhos */}
          <div className="dash-section">
            <h3 className="dash-section-title">
              <Rocket size={20} /> Acesso Rápido
            </h3>
            <div className="dash-shortcuts">
              <Shortcut icon={Calendar} label="Ver Calendário" path="/calendar" />
              <Shortcut icon={PenTool} label="Suas Copies" path="/copies" />
              <Shortcut icon={Hash} label="Suas Gavetas" path="/hashtags" />
              <Shortcut icon={Target} label="Ver Metas" path="/goals" />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
