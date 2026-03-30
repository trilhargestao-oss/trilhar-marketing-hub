import { useState, useEffect } from 'react';
import { Star, Copy as CopyIcon, Check, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './Copies.css';

interface CopyItem {
  id: string;
  title: string;
  content: string;
  platform: string;
  category: string;
  tone: string;
  context: string;
  is_favorite: boolean;
  format?: string;
  notes?: string;
}

const FORMATS = ['Feed', 'Reels', 'Carrossel', 'Stories', 'TikTok', 'Shorts', 'Artigo', 'LinkedIn'];

const Copies = () => {
  const [copies, setCopies] = useState<CopyItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeFormat, setActiveFormat] = useState<string>('Todos');
  const [selectedCopy, setSelectedCopy] = useState<CopyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCopies();
  }, []);

  const fetchCopies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('copies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setCopies(data as CopyItem[]);
    } catch (err) {
      console.error('Erro ao buscar copies', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (copy?: CopyItem) => {
    if (copy) {
      setSelectedCopy(copy);
    } else {
      setSelectedCopy({
        id: '',
        title: '',
        content: '',
        platform: 'Instagram',
        category: 'Conteúdo',
        tone: 'Casual',
        context: '',
        is_favorite: false,
        format: 'Feed',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCopy(null);
  };

  const handleSave = async () => {
    if (!selectedCopy) return;
    
    // Clean fields that might be empty or missing from old migrations
    const saveData = {
      title: selectedCopy.title || 'Sem Título',
      content: selectedCopy.content || '',
      platform: selectedCopy.platform || 'Instagram',
      category: selectedCopy.category || 'Geral',
      tone: selectedCopy.tone || 'Casual',
      context: selectedCopy.context || '',
      is_favorite: selectedCopy.is_favorite || false,
      format: selectedCopy.format || 'Feed',
      notes: selectedCopy.notes || ''
    };

    try {
      if (selectedCopy.id) {
        // Update
        const { error } = await supabase.from('copies').update(saveData).eq('id', selectedCopy.id);
        if (error) throw error;
        setCopies(prev => prev.map(c => c.id === selectedCopy.id ? { ...c, ...saveData } : c));
      } else {
        // Insert
        const { data, error } = await supabase.from('copies').insert([saveData]).select();
        if (error) throw error;
        if (data) setCopies([data[0] as CopyItem, ...copies]);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar copy. Verifique se você rodou o ALTER TABLE no Supabase para as colunas format e notes.');
    }
  };

  const removeCopy = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if(confirm('Excluir texto?')) {
      try {
        setCopies(prev => prev.filter(c => c.id !== id));
        await supabase.from('copies').delete().eq('id', id);
        if (selectedCopy?.id === id) {
          handleCloseModal();
        }
      } catch (err) {
        fetchCopies();
      }
    }
  }

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = copies.find(c => c.id === id);
    if (!item) return;

    try {
      setCopies(prev => prev.map(c => c.id === id ? { ...c, is_favorite: !c.is_favorite } : c));
      await supabase.from('copies').update({ is_favorite: !item.is_favorite }).eq('id', id);
    } catch (err) {
      setCopies(prev => prev.map(c => c.id === id ? { ...c, is_favorite: item.is_favorite } : c));
    }
  };

  const updateSelected = (field: keyof CopyItem, value: any) => {
    if (selectedCopy) {
      setSelectedCopy({ ...selectedCopy, [field]: value });
    }
  };

  const filteredCopies = copies.filter(c => {
    if (activeFormat === 'Todos') return true;
    if (activeFormat === 'Favoritos') return c.is_favorite;
    return (c.format || 'Feed') === activeFormat;
  });

  return (
    <div className="copies-container">
      <div className="copies-header">
        <div>
          <h1 className="page-title">Biblioteca de Content</h1>
          <p className="page-description">Sua biblioteca visual de copies, roteiros e textos organizados por formato.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nova Copy
        </button>
      </div>

      <div className="format-filters">
        <button 
          className={`format-pill ${activeFormat === 'Todos' ? 'active' : ''}`}
          onClick={() => setActiveFormat('Todos')}
        >
          Todos
        </button>
        <button 
          className={`format-pill ${activeFormat === 'Favoritos' ? 'active' : ''}`}
          onClick={() => setActiveFormat('Favoritos')}
        >
          ⭐ Favoritos
        </button>
        {FORMATS.map(f => (
          <button 
            key={f} 
            className={`format-pill ${activeFormat === f ? 'active' : ''}`}
            onClick={() => setActiveFormat(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando biblioteca...</p>}

      <div className="masonry-grid">
        {filteredCopies.map(copy => (
          <div key={copy.id} className="pinterest-card" onClick={() => handleOpenModal(copy)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="pinterest-card-format">{copy.format || 'Feed'}</span>
              <button 
                style={{ background: 'none', border: 'none', color: copy.is_favorite ? '#f59e0b' : 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={(e) => toggleFavorite(e, copy.id)}
              >
                <Star size={16} fill={copy.is_favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <h3 className="pinterest-card-title">{copy.title}</h3>
            
            <div className="pinterest-card-preview">
              {copy.content}
            </div>
            
            <div className="pinterest-card-footer">
              <div className="pinterest-badges">
                <span>{copy.platform}</span>
                <span>•</span>
                <span>{copy.category}</span>
              </div>
              
              <button 
                className={`btn-icon ${copiedId === copy.id ? 'success' : ''}`}
                style={{ width: '32px', height: '32px' }}
                onClick={(e) => handleCopy(e, copy.id, copy.content)}
                title="Copiar texto"
              >
                {copiedId === copy.id ? <Check size={14} /> : <CopyIcon size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedCopy && (
        <div className="copy-modal-overlay" onClick={handleCloseModal}>
          <div className="copy-modal-content" onClick={e => e.stopPropagation()}>
            <div className="copy-modal-header">
              <input 
                type="text" 
                className="form-control" 
                style={{ fontSize: '20px', fontWeight: 600, background: 'transparent', border: 'none', padding: 0 }}
                value={selectedCopy.title} 
                onChange={e => updateSelected('title', e.target.value)}
                placeholder="Título da Copy"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-icon" 
                  onClick={(e) => handleCopy(e, selectedCopy.id || 'new', selectedCopy.content)} 
                  title="Copiar"
                >
                  {copiedId === (selectedCopy.id || 'new') ? <Check size={20} color="var(--color-success)" /> : <CopyIcon size={20} />}
                </button>
                <button className="btn-icon" onClick={handleCloseModal} title="Fechar"><X size={20} /></button>
              </div>
            </div>

            <div className="copy-modal-body">
              <div className="copy-modal-main">
                <textarea 
                  className="form-control copy-textarea" 
                  value={selectedCopy.content} 
                  onChange={e => updateSelected('content', e.target.value)}
                  placeholder="Escreva a copy completa aqui..."
                />
                
                <div className="form-group">
                  <label>Contexto / Origem</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={selectedCopy.context} 
                    onChange={e => updateSelected('context', e.target.value)}
                    placeholder="Ex: Gerado pelo ChatGPT para campanha de Black Friday..."
                  />
                </div>
              </div>

              <div className="copy-modal-sidebar">
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }} 
                  onClick={handleSave}
                >
                  <Check size={18} /> Salvar Alterações
                </button>

                <div className="form-group">
                  <label>Formato</label>
                  <select className="form-control" value={selectedCopy.format || 'Feed'} onChange={e => updateSelected('format', e.target.value)}>
                    {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Plataforma</label>
                  <input type="text" className="form-control" value={selectedCopy.platform} onChange={e => updateSelected('platform', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Categoria principal</label>
                  <input type="text" className="form-control" value={selectedCopy.category} onChange={e => updateSelected('category', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Tom de Voz</label>
                  <input type="text" className="form-control" value={selectedCopy.tone} onChange={e => updateSelected('tone', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Notas extras</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    value={selectedCopy.notes || ''} 
                    onChange={e => updateSelected('notes', e.target.value)}
                    placeholder="Links adicionais, ideias de design, arquivos..."
                  />
                </div>
                
                {selectedCopy.id && (
                  <button className="btn-primary" style={{ background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', marginTop: 'auto' }} onClick={(e) => removeCopy(selectedCopy.id, e)}>
                    <Trash2 size={16} /> Excluir permanentemente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Copies;
