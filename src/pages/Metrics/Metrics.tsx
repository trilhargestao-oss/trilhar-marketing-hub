import { useState, useEffect } from 'react';
import { BarChart3, Heart, Eye, Plus, Globe, MessageSquare, Briefcase, Trash2, Users, MousePointerClick } from 'lucide-react';
import { hasRealSupabase, supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './Metrics.css';

interface MetricRecord {
  id: string;
  post_title: string;
  platform: string;
  post_date: string;
  reach: number;
  likes: number;
  saves: number;
  comments: number;
  shares: number;
  followers_gained: number;
  followers_total: number;
  profile_visits: number;
  link_clicks: number;
  notes?: string;
  metric_type: 'post' | 'account';
}

const Metrics = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MetricRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MetricRecord>>({
    post_title: '',
    platform: 'Instagram',
    post_date: new Date().toISOString().split('T')[0],
    reach: 0,
    likes: 0,
    saves: 0,
    comments: 0,
    shares: 0,
    followers_gained: 0,
    followers_total: 0,
    profile_visits: 0,
    link_clicks: 0,
    notes: '',
    metric_type: 'post'
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('metrics').select('*').order('post_date', { ascending: false });
      if (error) throw error;
      if (data) setRecords(data as MetricRecord[]);
    } catch (err) {
      console.error('Erro ao buscar métricas', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      post_title: '',
      platform: 'Instagram',
      post_date: new Date().toISOString().split('T')[0],
      reach: 0,
      likes: 0,
      saves: 0,
      comments: 0,
      shares: 0,
      followers_gained: 0,
      followers_total: records.length > 0 ? (records[0].followers_total || 0) : 0,
      profile_visits: 0,
      link_clicks: 0,
      notes: '',
      metric_type: 'post'
    });
    setIsModalOpen(true);
  };

  const handleSaveMetric = async () => {
    if (!formData.post_title) return alert("Preencha a identificação!");
    if (!user?.id) return alert('Sua sessão expirou. Faça login novamente para salvar métricas.');
    if (!hasRealSupabase) return alert('Configuração do Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');

    try {
      const { data, error } = await supabase.from('metrics').insert([{ ...formData, user_id: user.id }]).select();
      if (error) throw error;
      if (data) setRecords([data[0] as MetricRecord, ...records]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar métrica:', err);
      alert(`Erro ao salvar no banco de dados: ${err instanceof Error ? err.message : 'falha desconhecida'}`);
    }
  };

  const removeMetric = async (id: string) => {
    if(confirm('Excluir registro de métrica?')) {
      try {
        setRecords(prev => prev.filter(c => c.id !== id));
        await supabase.from('metrics').delete().eq('id', id);
      } catch (err) {
        fetchMetrics();
      }
    }
  };

  // Calcula totais
  const totalReach = records.reduce((acc, curr) => acc + (curr.reach || 0), 0);
  const totalLikes = records.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  
  // Para seguidores: O total mais recente da plataforma
  const latestFollowersTotal = records.find(r => r.platform === 'Instagram')?.followers_total || 0;
  // O ganho total histórico (soma de todos os ganhos registrados)
  const totalFollowersGained = records.reduce((acc, curr) => acc + (curr.followers_gained || 0), 0);
  
  const totalClicks = records.reduce((acc, curr) => acc + (curr.link_clicks || 0), 0);
  
  const avgReach = records.length ? Math.round(totalReach / records.length) : 0;
  const avgLikes = records.length ? Math.round(totalLikes / records.length) : 0;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Globe size={16} className="platform-icon" style={{marginRight: 8, color: 'var(--text-secondary)'}} />;
      case 'linkedin': return <Briefcase size={16} className="platform-icon" style={{marginRight: 8, color: 'var(--text-secondary)'}} />;
      case 'twitter': return <MessageSquare size={16} className="platform-icon" style={{marginRight: 8, color: 'var(--text-secondary)'}} />;
      default: return <BarChart3 size={16} className="platform-icon" style={{marginRight: 8, color: 'var(--text-secondary)'}} />;
    }
  };

  const updateForm = (field: keyof MetricRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <div>
          <h1 className="page-title">Métricas de Performance</h1>
          <p className="page-description">Acompanhe engajamento, tráfego e crescimento da audiência.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Registrar Métrica
        </button>
      </div>

      <div className="metrics-summary" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}><Eye size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Alcance Médio</span>
            <span className="metric-value">{avgReach.toLocaleString()}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}><Heart size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Curtidas Médias</span>
            <span className="metric-value">{avgLikes.toLocaleString()}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}><Users size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Seguidores Totais</span>
            <span className="metric-value">{latestFollowersTotal.toLocaleString()}</span>
            <span className="metric-sub-label">+{totalFollowersGained} acumulados</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}><MousePointerClick size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Cliques no Link</span>
            <span className="metric-value">{totalClicks.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading && <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Carregando dados...</div>}
        {!loading && records.length === 0 && <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Nenhum dado registrado.</div>}
        
        {!loading && records.length > 0 && (
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Identificação</th>
              <th>Data</th>
              <th>Alcance</th>
              <th>Curtidas</th>
              <th>Novos Seg.</th>
              <th>Total Seg.</th>
              <th>Visitas</th>
              <th>Cliques</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id} className={record.metric_type === 'account' ? 'row-highlight' : ''}>
                <td className="post-title-cell">
                  {getPlatformIcon(record.platform)}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{record.post_title}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {record.metric_type === 'account' ? 'Status da Conta' : 'Métrica de Post'}
                    </span>
                  </div>
                </td>
                <td>{record.post_date}</td>
                <td>{(record.reach || 0).toLocaleString()}</td>
                <td>{(record.likes || 0).toLocaleString()}</td>
                <td style={{ color: 'var(--color-success)', fontWeight: 500 }}>+{(record.followers_gained || 0).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{(record.followers_total || 0).toLocaleString()}</td>
                <td>{(record.profile_visits || 0).toLocaleString()}</td>
                <td>{(record.link_clicks || 0).toLocaleString()}</td>
                <td>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => removeMetric(record.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Registrar Desempenho</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
              
              {/* Seção Básica */}
              <div className="form-group">
                <label>Tipo de Registro</label>
                <select className="form-control" value={formData.metric_type} onChange={e => updateForm('metric_type', e.target.value)}>
                  <option value="post">Métrica de Post Individual</option>
                  <option value="account">Status Geral da Conta (Snapshot)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Plataforma</label>
                <select className="form-control" value={formData.platform} onChange={e => updateForm('platform', e.target.value)}>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter/X</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Blog">Blog</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: formData.metric_type === 'account' ? '1 / -1' : 'auto' }}>
                <label>{formData.metric_type === 'account' ? 'Nome do Snapshot' : 'Identificação do Post'}</label>
                <input type="text" className="form-control" placeholder={formData.metric_type === 'account' ? "Ex: Status Geral Março" : "Ex: Lançamento Post 1"} value={formData.post_title} onChange={e => updateForm('post_title', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Data de Referência</label>
                <input type="date" className="form-control" value={formData.post_date} onChange={e => updateForm('post_date', e.target.value)} />
              </div>

              {/* Seção Engajamento (Ocultar se for snapshot de conta para simplificar, ou deixar opcional) */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', margin: '8px 0 4px', paddingBottom: '4px' }}>
                <strong style={{ color: 'var(--color-primary)', fontSize: '14px' }}>Engajamento e Alcance</strong>
              </div>

              <div className="form-group">
                <label>Pessoas Alcançadas (Reach)</label>
                <input type="number" className="form-control" value={formData.reach} onChange={e => updateForm('reach', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Total de Curtidas (Likes)</label>
                <input type="number" className="form-control" value={formData.likes} onChange={e => updateForm('likes', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Compartilhamentos</label>
                <input type="number" className="form-control" value={formData.shares} onChange={e => updateForm('shares', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Total de Salvamentos</label>
                <input type="number" className="form-control" value={formData.saves} onChange={e => updateForm('saves', Number(e.target.value))} />
              </div>

              {/* Seção Crescimento/Conta */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', margin: '8px 0 4px', paddingBottom: '4px' }}>
                <strong style={{ color: 'var(--color-success)', fontSize: '14px' }}>Status da Audiência (Growth)</strong>
              </div>

              <div className="form-group">
                <label>Seguidores Totais (Acumulado)</label>
                <input type="number" className="form-control" style={{ borderColor: 'var(--color-success)' }} value={formData.followers_total} onChange={e => updateForm('followers_total', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Novos Seguidores Ganhos</label>
                <input type="number" className="form-control" value={formData.followers_gained} onChange={e => updateForm('followers_gained', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Visitas ao Perfil</label>
                <input type="number" className="form-control" value={formData.profile_visits} onChange={e => updateForm('profile_visits', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Cliques no Link (Bio)</label>
                <input type="number" className="form-control" value={formData.link_clicks} onChange={e => updateForm('link_clicks', Number(e.target.value))} />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn-primary" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveMetric}>Registrar Dados</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metrics;
