import { useState, useEffect } from 'react';
import { BarChart3, Heart, Eye, Plus, Globe, MessageSquare, Briefcase, Trash2, Users, MousePointerClick } from 'lucide-react';
import { supabase } from '../../services/supabase';
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
  profile_visits: number;
  link_clicks: number;
  notes?: string;
}

const Metrics = () => {
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
    profile_visits: 0,
    link_clicks: 0,
    notes: ''
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
      profile_visits: 0,
      link_clicks: 0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveMetric = async () => {
    if (!formData.post_title) return alert("Preencha a identificação!");

    try {
      const { data, error } = await supabase.from('metrics').insert([formData]).select();
      if (error) throw error;
      if (data) setRecords([data[0] as MetricRecord, ...records]);
      setIsModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar. Tem certeza que rodou os comandos SQL no Supabase para as colunas novas?');
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
  const totalFollowers = records.reduce((acc, curr) => acc + (curr.followers_gained || 0), 0);
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
            <span className="metric-label">Novos Seguidores</span>
            <span className="metric-value">{totalFollowers.toLocaleString()}</span>
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
              <th>Salvamentos</th>
              <th>Seguidores</th>
              <th>Visitas (P)</th>
              <th>Cliques</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td className="post-title-cell">
                  {getPlatformIcon(record.platform)}
                  {record.post_title}
                </td>
                <td>{record.post_date}</td>
                <td>{(record.reach || 0).toLocaleString()}</td>
                <td>{(record.likes || 0).toLocaleString()}</td>
                <td>{(record.saves || 0).toLocaleString()}</td>
                <td style={{ color: 'var(--color-success)', fontWeight: 500 }}>+{(record.followers_gained || 0).toLocaleString()}</td>
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
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Identificação do Post / Lote</label>
                <input type="text" className="form-control" placeholder="Ex: Lançamento Post 1" value={formData.post_title} onChange={e => updateForm('post_title', e.target.value)} />
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

              <div className="form-group">
                <label>Data de Referência</label>
                <input type="date" className="form-control" value={formData.post_date} onChange={e => updateForm('post_date', e.target.value)} />
              </div>

              {/* Seção Engajamento */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', margin: '8px 0 4px', paddingBottom: '4px' }}>
                <strong style={{ color: 'var(--color-primary)', fontSize: '14px' }}>Engajamento no Post</strong>
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
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Comentários Mapeados</label>
                <input type="number" className="form-control" value={formData.comments} onChange={e => updateForm('comments', Number(e.target.value))} />
              </div>

              {/* Seção Crescimento/Conta */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', margin: '8px 0 4px', paddingBottom: '4px' }}>
                <strong style={{ color: 'var(--color-success)', fontSize: '14px' }}>Crescimento do Perfil & Conversão</strong>
              </div>

              <div className="form-group">
                <label>Novos Seguidores Ganhos</label>
                <input type="number" className="form-control" value={formData.followers_gained} onChange={e => updateForm('followers_gained', Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label>Visitas ao Perfil</label>
                <input type="number" className="form-control" value={formData.profile_visits} onChange={e => updateForm('profile_visits', Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Cliques no Link (Site/Bio)</label>
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
