import { useState, useEffect } from 'react';
import { Plus, Trophy, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
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

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('goals').select('*');
      if (error) throw error;
      if (data) setGoals(data as Goal[]);
    } catch (err) {
      console.error('Erro ao buscar metas', err);
    } finally {
      setLoading(false);
    }
  };

  const addMockGoal = async () => {
    const newGoal = {
      title: 'Nova Meta Mensal',
      target_amount: 100,
      current_amount: Math.floor(Math.random() * 100),
      unit: 'itens',
      platform: 'Geral',
      notes: 'Clique para editar (em desenvolvimento)'
    };

    try {
      const { data, error } = await supabase.from('goals').insert([newGoal]).select();
      if (error) throw error;
      if (data) setGoals([...goals, data[0] as Goal]);
    } catch (err) {
      alert('Erro ao criar meta');
    }
  };

  const removeGoal = async (id: string) => {
    if(confirm('Tem certeza que deseja apagar?')) {
      try {
        setGoals(prev => prev.filter(c => c.id !== id));
        await supabase.from('goals').delete().eq('id', id);
      } catch (err) {
        fetchGoals();
      }
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <div>
          <h1 className="page-title">Metas Mensais</h1>
          <p className="page-description">Acompanhe seus objetivos e o progresso em tempo real.</p>
        </div>
        <button className="btn-primary" onClick={addMockGoal}>
          <Plus size={18} /> Nova Meta
        </button>
      </div>

      <div className="goals-grid">
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando metas...</p>}
        {goals.map(goal => {
          const percentage = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
          const isAchieved = goal.current_amount >= goal.target_amount;

          return (
            <div key={goal.id} className={`goal-card ${isAchieved ? 'achieved' : ''}`}>
              <div className="goal-header">
                <div>
                  <h3 className="goal-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {goal.title}
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => removeGoal(goal.id)}>
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
                    <span className="goal-progress-current">{goal.current_amount}</span>
                    <span className="goal-progress-target"> / {goal.target_amount} {goal.unit}</span>
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

              {goal.notes && (
                <div className="goal-notes">
                  {goal.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
