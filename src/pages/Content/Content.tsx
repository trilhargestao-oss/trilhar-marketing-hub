import { useState, useEffect } from 'react';
import { LayoutTemplate, CheckCircle, Trash2, Calendar as CalIcon } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './Content.css';

interface PostContent {
  id: string;
  title: string;
  platform: string;
  type: string;
  date: string;
  status: 'published' | 'pending' | 'scheduled';
}

const Content = () => {
  const [contents, setContents] = useState<PostContent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: true });
      if (error) throw error;
      if (data) setContents(data as PostContent[]);
    } catch (err) {
      console.error('Erro ao buscar conteúdos', err);
    } finally {
      setLoading(false);
    }
  };

  const publishedCount = contents.filter(c => c.status === 'published').length;
  const progress = contents.length ? Math.round((publishedCount / contents.length) * 100) : 0;

  const toggleStatus = async (id: string) => {
    const post = contents.find(c => c.id === id);
    if (!post) return;

    const nextStatus = post.status === 'published' ? 'pending' : 'published';

    try {
      setContents(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
      const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar status', err);
      setContents(prev => prev.map(c => c.id === id ? { ...c, status: post.status } : c));
    }
  };

  const removePost = async (id: string) => {
    if(confirm('Tem certeza que deseja excluir este conteúdo?')) {
      try {
        setContents(prev => prev.filter(c => c.id !== id));
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao excluir', err);
        fetchContents(); // revert
      }
    }
  }

  return (
    <div className="content-container">
      <div className="content-header">
        <div>
          <h1 className="page-title">Conteúdo</h1>
          <p className="page-description">Lista cronológica e status de todas as suas publicações.</p>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-stats">
          <span className="progress-title">Progresso Geral</span>
          <span className="progress-percentage">{progress}% <span style={{fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 400}}>({publishedCount} de {contents.length})</span></span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }} />
        </div>
      </div>

      <div className="content-list">
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>}
        {!loading && contents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Nenhum conteúdo planejado. Crie no Calendário!
          </div>
        )}

        {contents.map(item => (
          <div key={item.id} className={`content-item ${item.status}`}>
            <div className="content-info">
              <h3 className="content-title">{item.title}</h3>
              <div className="content-meta">
                <span className={`badge ${item.status}`}>
                  {item.status === 'published' ? 'Publicado' : item.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LayoutTemplate size={14} /> {item.platform} • {item.type}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CalIcon size={14} /> {item.date}
                </span>
              </div>
            </div>

            <div className="content-actions">
              <button 
                className={`btn-icon ${item.status === 'published' ? 'success' : ''}`}
                onClick={() => toggleStatus(item.id)}
                title={item.status === 'published' ? 'Desmarcar' : 'Marcar como Publicado'}
              >
                <CheckCircle size={18} />
              </button>
              <button 
                className="btn-icon danger"
                onClick={() => removePost(item.id)}
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
