import { useState, useEffect } from 'react';
import { Plus, Search, ExternalLink, Globe, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './References.css';

interface Reference {
  id: string;
  title: string;
  url: string;
  platform: string;
  notes: string;
  tags: string[];
}

const References = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRefs();
  }, []);

  const fetchRefs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('references').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setRefs(data as Reference[]);
    } catch (err) {
      console.error('Erro ao buscar referências', err);
    } finally {
      setLoading(false);
    }
  };

  const addMockRef = async () => {
    const newRef = {
      title: 'Nova Referência Visual',
      url: 'https://exemplo.com',
      platform: 'Web',
      notes: 'Referência adicionada dinamicamente',
      tags: ['inspiração', 'ui']
    };

    try {
      const { data, error } = await supabase.from('references').insert([newRef]).select();
      if (error) throw error;
      if (data) setRefs([data[0] as Reference, ...refs]);
    } catch (err) {
      alert('Erro ao criar referência');
    }
  };

  const removeRef = async (id: string) => {
    if(confirm('Apagar esta referência?')) {
      try {
        setRefs(prev => prev.filter(c => c.id !== id));
        await supabase.from('references').delete().eq('id', id);
      } catch (err) {
        fetchRefs();
      }
    }
  };

  const filteredRefs = refs.filter(r => {
    const term = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.platform.toLowerCase().includes(term) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="references-container">
      <div className="references-header">
        <div>
          <h1 className="page-title">Referências Visuais</h1>
          <p className="page-description">Salve links, imagens e referências para inspiração.</p>
        </div>
        <button className="btn-primary" onClick={addMockRef}>
          <Plus size={18} /> Nova Referência
        </button>
      </div>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por título, plataforma ou tag..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando referências...</p>}

      <div className="references-grid">
        {filteredRefs.map(ref => (
          <div key={ref.id} className="reference-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 className="reference-title">{ref.title}</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => removeRef(ref.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="reference-platform">
              <Globe size={14} /> {ref.platform}
            </div>
            
            <div className="reference-tags">
              {ref.tags && ref.tags.map(tag => (
                <span key={tag} className="reference-tag">{tag}</span>
              ))}
            </div>

            {ref.notes && <p className="reference-notes">{ref.notes}</p>}

            <a 
              href={ref.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Acessar Link
            </a>
          </div>
        ))}
        {!loading && filteredRefs.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', padding: '24px' }}>
            Nenhuma referência encontrada.
          </div>
        )}
      </div>
    </div>
  );
};

export default References;
