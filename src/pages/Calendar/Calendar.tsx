import { useState, useEffect } from 'react';
import { 
  addMonths, subMonths, format, startOfMonth, endOfMonth, 
  eachDayOfInterval, getDay, isSameMonth, isToday, isSameDay, parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Bell, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './Calendar.css';

interface Post {
  id: string;
  title: string;
  platform: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'published' | 'scheduled' | 'pending';
  remind_me: boolean;
  briefing: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState<Partial<Post>>({
    title: '', platform: 'Instagram', type: 'Foto', time: '12:00', remind_me: false, briefing: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: true });
      if (error) throw error;
      if (data) setPosts(data as Post[]);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const startDay = startOfMonth(currentDate);
  const endDay = endOfMonth(currentDate);
  const monthPosts = posts.filter(p => isSameMonth(parseISO(p.date), currentDate));
  
  const scheduledCount = monthPosts.filter(p => p.status === 'scheduled').length;
  const publishedCount = monthPosts.filter(p => p.status === 'published').length;
  const pendingCount = monthPosts.filter(p => p.status === 'pending').length;

  const daysInMonth = eachDayOfInterval({ start: startDay, end: endDay });
  const startOffset = getDay(startDay); // 0 (Sun) to 6 (Sat)
  
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setFormData({ title: '', platform: 'Instagram', type: 'Foto', time: '12:00', remind_me: false, briefing: '' });
    setIsModalOpen(true);
  };

  const savePost = async () => {
    if(!selectedDate || !formData.title) return;
    
    if (formData.remind_me) {
      requestNotificationPermission();
    }

    try {
      const newPost = {
        title: formData.title,
        platform: formData.platform,
        type: formData.type,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: formData.time,
        status: 'scheduled',
        remind_me: formData.remind_me,
        briefing: formData.briefing || null
      };

      const { data, error } = await supabase.from('posts').insert([newPost]).select();
      if (error) throw error;
      
      if (data && data.length > 0) {
        setPosts([...posts, data[0] as Post]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Erro ao salvar post:', err);
      alert('Erro ao salvar no banco de dados.');
    }
  };

  const toggleStatus = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const nextStatus = post.status === 'published' ? 'pending' : 'published';
    
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      
      const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar status', err);
      // Revert optimistic
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: post.status } : p));
    }
  };

  const renderDays = () => {
    const blanks = Array.from({ length: startOffset }, (_, i) => (
      <div key={`blank-${i}`} className="calendar-day empty"></div>
    ));

    const daysList = daysInMonth.map(day => {
      const dayPosts = posts.filter(p => isSameDay(parseISO(p.date), day));
      
      return (
        <div 
          key={day.toString()} 
          className={`calendar-day ${isToday(day) ? 'today' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{format(day, 'd')}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {dayPosts.map(p => (
              <div key={p.id} className={`post-pill status-${p.status}`} title={`${p.title} (${p.platform})`}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.time.substring(0,5)} {p.title}</span>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {p.remind_me && <Bell size={10} />}
                  <div onClick={(e) => toggleStatus(e, p.id)} style={{cursor: 'pointer'}}>
                    {p.status === 'published' ? <CheckCircle size={10} /> : <div style={{width: 10, height: 10, border: '1px solid currentColor', borderRadius: '50%'}} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });

    return [...blanks, ...daysList];
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
          <span className="current-month">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
          <button className="nav-btn" onClick={handleNextMonth}><ChevronRight size={20} /></button>
        </div>
        <div className="calendar-stats">
          {loading && <div className="stat-badge" style={{color: 'var(--text-secondary)'}}>Carregando...</div>}
          <div className="stat-badge purple">{scheduledCount} Agendados</div>
          <div className="stat-badge green">{publishedCount} Publicados</div>
          <div className="stat-badge yellow">{pendingCount} Pendentes</div>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        <div className="calendar-weekdays">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="weekday">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {renderDays()}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Post - {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título / Tópico</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.title} 
                  autoFocus
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Plataforma</label>
                  <select className="form-control" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>TikTok</option>
                    <option>LinkedIn</option>
                    <option>Twitter/X</option>
                    <option>YouTube</option>
                    <option>Pinterest</option>
                    <option>WhatsApp</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tipo</label>
                  <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Foto</option>
                    <option>Vídeo</option>
                    <option>Reels</option>
                    <option>Stories</option>
                    <option>Carrossel</option>
                    <option>Texto</option>
                    <option>Link</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Horário</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1, justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.remind_me} 
                      onChange={e => setFormData({...formData, remind_me: e.target.checked})} 
                    />
                    Notificar no navegador
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Briefing / Observações</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={formData.briefing} 
                  onChange={e => setFormData({...formData, briefing: e.target.value})}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button 
                className="btn-primary" 
                style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}} 
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={savePost}>Salvar Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
