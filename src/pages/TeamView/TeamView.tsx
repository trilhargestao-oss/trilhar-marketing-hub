import { useState, useEffect } from 'react';
import { Users, Target, TrendingUp, BarChart3, UserPlus, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TeamView.css';

interface TeamMember {
  id: string;
  member_name: string;
  member_email: string;
  member_user_id: string;
  role: string;
}

interface MemberStats {
  memberId: string;
  memberName: string;
  followers: number;
  totalGoals: number;
  completedGoals: number;
  reachAvg: number;
}

const TeamView = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', user_id: '' });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchTeam();
  }, [isAdmin]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*')
        .eq('admin_user_id', user?.id);

      if (teamData) {
        setMembers(teamData);
        await fetchMemberStats(teamData);
      }
    } catch (err) {
      console.error('Erro ao buscar equipe', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStats = async (team: TeamMember[]) => {
    const stats: MemberStats[] = [];

    for (const member of team) {
      const [metricsRes, goalsRes] = await Promise.all([
        supabase.from('metrics').select('*').eq('user_id', member.member_user_id).order('post_date', { ascending: false }).limit(5),
        supabase.from('goals').select('target_amount, current_amount').eq('user_id', member.member_user_id),
      ]);

      const latestFollowers = metricsRes.data?.[0]?.followers_total || metricsRes.data?.[0]?.followers || 0;
      const reachAvg = metricsRes.data ? Math.round(metricsRes.data.reduce((acc, m) => acc + (m.reach || 0), 0) / Math.max(metricsRes.data.length, 1)) : 0;
      const totalGoals = goalsRes.data?.length || 0;
      const completedGoals = goalsRes.data?.filter(g => g.current_amount >= g.target_amount).length || 0;

      stats.push({
        memberId: member.member_user_id,
        memberName: member.member_name,
        followers: latestFollowers,
        totalGoals,
        completedGoals,
        reachAvg,
      });
    }

    setMemberStats(stats);
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.email) return alert('Preencha nome e e-mail!');
    try {
      const { data, error } = await supabase.from('team_members').insert([{
        admin_user_id: user?.id,
        member_user_id: newMember.user_id || null,
        member_name: newMember.name,
        member_email: newMember.email,
      }]).select();
      if (error) throw error;
      if (data) setMembers(prev => [...prev, data[0]]);
      setShowAddModal(false);
      setNewMember({ name: '', email: '', user_id: '' });
    } catch (err) {
      alert('Erro ao adicionar membro.');
    }
  };

  const removeMember = async (id: string) => {
    if (!confirm('Remover membro da equipe?')) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    await supabase.from('team_members').delete().eq('id', id);
  };

  if (!isAdmin) return null;

  return (
    <div className="team-container">
      <div className="team-header">
        <div>
          <h1 className="page-title">Visão da Equipe 🏢</h1>
          <p className="page-description">Acompanhe o desempenho de cada sócio no mesmo painel.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Adicionar Membro
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Carregando dados da equipe...</div>
      ) : members.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Equipe vazia</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Adicione os sócios usando o botão acima para começar a acompanhar o desempenho de cada um.
          </p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={18} /> Adicionar 1º Membro
          </button>
        </div>
      ) : (
        <div className="team-grid">
          {members.map((member) => {
            const stats = memberStats.find(s => s.memberId === member.member_user_id);
            const progress = stats ? Math.min(100, Math.round((stats.completedGoals / Math.max(stats.totalGoals, 1)) * 100)) : 0;

            return (
              <div key={member.id} className="member-card card">
                <div className="member-header">
                  <div className="member-avatar">
                    {member.member_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="member-name">{member.member_name}</h3>
                    <span className="member-email">{member.member_email}</span>
                  </div>
                  <button className="btn-icon" onClick={() => removeMember(member.id)} title="Remover membro">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="member-stats">
                  <div className="member-stat">
                    <div className="member-stat-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="member-stat-value">{(stats?.followers || 0).toLocaleString()}</span>
                      <span className="member-stat-label">Seguidores</span>
                    </div>
                  </div>

                  <div className="member-stat">
                    <div className="member-stat-icon" style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}>
                      <BarChart3 size={18} />
                    </div>
                    <div>
                      <span className="member-stat-value">{(stats?.reachAvg || 0).toLocaleString()}</span>
                      <span className="member-stat-label">Alcance Médio</span>
                    </div>
                  </div>

                  <div className="member-stat">
                    <div className="member-stat-icon" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                      <Target size={18} />
                    </div>
                    <div>
                      <span className="member-stat-value">{stats?.totalGoals || 0}</span>
                      <span className="member-stat-label">Metas Ativas</span>
                    </div>
                  </div>

                  <div className="member-stat">
                    <div className="member-stat-icon" style={{ color: '#22d3ee', background: 'rgba(34,211,238,0.1)' }}>
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <span className="member-stat-value">{stats?.completedGoals || 0}</span>
                      <span className="member-stat-label">Metas Batidas</span>
                    </div>
                  </div>
                </div>

                <div className="member-progress-wrap">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <TrendingUp size={12} style={{ marginRight: 4, display: 'inline' }} />
                      Progresso Geral
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: progress >= 75 ? '#10b981' : 'var(--color-primary)' }}>{progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, background: progress >= 75 ? '#10b981' : 'var(--color-primary)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Adicionar Membro</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Nome do Sócio</label>
                <input type="text" className="form-control" placeholder="Ex: Gabriel" value={newMember.name} onChange={e => setNewMember(v => ({ ...v, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" className="form-control" placeholder="Ex: gabriel@trilhar.com" value={newMember.email} onChange={e => setNewMember(v => ({ ...v, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>ID do Usuário Supabase (opcional)</label>
                <input type="text" className="form-control" placeholder="UUID encontrado em Auth > Users" value={newMember.user_id} onChange={e => setNewMember(v => ({ ...v, user_id: e.target.value }))} />
                <small style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Necessário para ver métricas e metas do sócio.</small>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-primary" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }} onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={addMember}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
