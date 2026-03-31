import { useState, useEffect } from 'react';
import { Plus, Trophy, Trash2, X, Target } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './Goals.css';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  unit: string;
  platform?: string;
  notes?: string;
}

const PLATFORMS = ['Geral', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'Twitter/X'];
const UNITS = ['seguidores', 'posts', 'curtidas', 'comentários', 'compartilhamentos', 'visualizações', 'cliques', 'leads', 'reels', 'stories', 'itens'];

const emptyGoal = (): Partial<Goal> => ({
  title: '',
  target_amount: 100,
  current_amount: 0,
  unit: 'seguidores',
  platform: 'Instagram',
  notes: '',
});

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Partial<Goal>>(emptyGoal());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setGoals(data as Goal[]);
    } catch (err) {
      console.error('Erro ao buscar metas', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingGoal(emptyGoal());
    setIsModalOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal({ ...goal });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(emptyGoal());
  };

  const handleSave = async () => {
    if (!editingGoal.title?.trim()) return alert('Digite um título para a meta.');
    
    setSaving(true);
    try {
      if (editingGoal.id) {
        // Editar meta existente
        const { error } = await supabase.from('goals').update({
          title: editingGoal.title,
          target_amount: editingGoal.target_amount,
          current_amount: editingGoal.current_amount,
          unit: editingGoal.unit,
          platform: editingGoal.platform,
          notes: editingGoal.notes,
        }).eq('id', editingGoal.id);
        if (error) throw error;
        setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...editingGoal } as Goal : g));
      } else {
        // Nova meta
        const { data, error } = await supabase.from('goals').insert([{
          user_id: user?.id,
          title: editingGoal.title,
          target_amount: editingGoal.target_amount,
          current_amount: editingGoal.current_amount ?? 0,
          unit: editingGoal.unit,
          platform: editingGoal.platform,
          notes: editingGoal.notes,
        }]).select();
        if (error) throw error;
        if (data) setGoals(prev => [data[0] as Goal, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar meta.');
    } finally {
      setSaving(false);
    }
  };

  const removeGoal = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Apagar esta meta?')) return;
    setGoals(prev => prev.filter(g => g.id !== id));
    await supabase.from('goals').delete().eq('id', id);
  };

  const update = (field: keyof Goal, value: any) => {
    setEditingGoal(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <div>
          <h1 className="page-title">Metas Mensais</h1>
          <p className="page-description">Acompanhe seus objetivos e o progresso em tempo real.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nova Meta
        </button>
      </div>

      <div className="goals-grid">
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando metas...</p>}
        {!loading && goals.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', padding: '48px', textAlign: 'center' }}>
            <Target size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p>Nenhuma meta criada ainda. Clique em "Nova Meta" para começar!</p>
          </div>
        )}
        {goals.map(goal => {
          const percentage = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
          const isAchieved = goal.current_amount >= goal.target_amount;

          return (
            <div
              key={goal.id}
              className={`goal-card ${isAchieved ? 'achieved' : ''}`}
              onClick={() => openEdit(goal)}
              style={{ cursor: 'pointer' }}
            >
              <div className="goal-header">
                <div>
                  <h3 className="goal-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {goal.title}
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      onClick={(e) => removeGoal(e, goal.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </h3>
                  {goal.platform && <span className="goal-platform">{goal.platform}</span>}
                </div>
                {isAchieved && (
                  <span className="goal-badge">
                    <Trophy size={14} /> Meta atingida 🎉
                  </span>
                )}
              </div>

              <div className="goal-progress-container">
                <div className="goal-progress-stats">
                  <span>
                    <span className="goal-progress-current">{goal.current_amount.toLocaleString()}</span>
                    <span className="goal-progress-target"> / {goal.target_amount.toLocaleString()} {goal.unit}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: isAchieved ? 'var(--color-success)' : 'var(--color-primary)' }}>
                    {percentage}%
                  </span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {goal.notes && <div className="goal-notes">{goal.notes}</div>}
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 8 }}>Clique para editar</p>
            </div>
          );
        })}
      </div>

      {/* Modal de criação / edição */}
      {isModalOpen && (
        <div className="goal-modal-overlay" onClick={closeModal}>
          <div className="goal-modal-content" onClick={e => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h2>{editingGoal.id ? 'Editar Meta' : 'Nova Meta'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="goal-modal-body">
              <div className="form-group">
                <label>Título da Meta *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Alcançar 10 mil seguidores"
                  autoFocus
                  value={editingGoal.title || ''}
                  onChange={e => update('title', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Meta (valor alvo)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={editingGoal.target_amount || 100}
                    onChange={e => update('target_amount', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Progresso atual</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={editingGoal.current_amount ?? 0}
                    onChange={e => update('current_amount', Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Unidade</label>
                  <select
                    className="form-control"
                    value={editingGoal.unit || 'seguidores'}
                    onChange={e => update('unit', e.target.value)}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Plataforma</label>
                  <select
                    className="form-control"
                    value={editingGoal.platform || 'Instagram'}
                    onChange={e => update('platform', e.target.value)}
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Estratégia, prazo, referências..."
                  value={editingGoal.notes || ''}
                  onChange={e => update('notes', e.target.value)}
                />
              </div>
            </div>

            <div className="goal-modal-footer">
              <button
                className="btn-primary"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editingGoal.id ? 'Salvar Alterações' : 'Criar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
