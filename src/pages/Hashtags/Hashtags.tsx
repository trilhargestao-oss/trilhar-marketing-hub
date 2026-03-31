import { useState, useEffect } from 'react';
import { Plus, Copy, Check, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './Hashtags.css';

interface HashtagGroup {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

const Hashtags = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('hashtag_groups').select('*');
      if (error) throw error;
      if (data) setGroups(data as HashtagGroup[]);
    } catch (err) {
      console.error('Erro ao buscar hashtags', err);
    } finally {
      setLoading(false);
    }
  };

  const addMockGroup = async () => {
    const newGroup = {
      user_id: user?.id,
      name: 'Novo Grupo',
      description: 'Grupo gerado rapidamente',
      tags: ['#novo', '#marketing', '#instagram']
    };

    try {
      const { data, error } = await supabase.from('hashtag_groups').insert([newGroup]).select();
      if (error) throw error;
      if (data) setGroups([...groups, data[0] as HashtagGroup]);
    } catch (err) {
      alert('Erro ao criar grupo');
    }
  };

  const removeGroup = async (id: string) => {
    if(confirm('Excluir gaveta de hashtags?')) {
      try {
        setGroups(prev => prev.filter(c => c.id !== id));
        await supabase.from('hashtag_groups').delete().eq('id', id);
      } catch (err) {
        fetchGroups();
      }
    }
  };

  const handleCopy = (id: string, tags: string[]) => {
    navigator.clipboard.writeText(tags.join(' '));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="hashtags-container">
      <div className="hashtags-header">
        <div>
          <h1 className="page-title">Grupos de Hashtags</h1>
          <p className="page-description">Organize suas hashtags em blocos para copiar rapidamente.</p>
        </div>
        <button className="btn-primary" onClick={addMockGroup}>
          <Plus size={18} /> Novo Grupo
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando grupos...</p>}

      <div className="hashtags-grid">
        {groups.map(group => (
          <div key={group.id} className="hashtag-card">
            <div className="hashtag-card-header">
              <div>
                <h3 className="hashtag-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {group.name} 
                  <span className="hashtag-count">{group.tags.length} tags</span>
                </h3>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => removeGroup(group.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            
            <p className="hashtag-desc">{group.description}</p>
            
            <div className="hashtag-list-container">
              <div className="hashtag-list-text">
                {group.tags.join(' ')}
              </div>
            </div>

            <button 
              className={`btn-primary ${copiedId === group.id ? 'success' : ''}`}
              style={{ width: '100%', justifyContent: 'center', backgroundColor: copiedId === group.id ? 'var(--color-success)' : '' }}
              onClick={() => handleCopy(group.id, group.tags)}
            >
              {copiedId === group.id ? <Check size={18} /> : <Copy size={18} />}
              {copiedId === group.id ? 'Copiado!' : 'Copiar Tudo'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hashtags;
