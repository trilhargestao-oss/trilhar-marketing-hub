import React from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home,
  Calendar, 
  LayoutTemplate, 
  PenTool, 
  Hash, 
  BarChart3, 
  Target, 
  Image as ImageIcon, 
  Palette,
  ChevronLeft,
  Menu,
  LogOut,
  Users
} from 'lucide-react';
import './Layout.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { path: '/', label: 'Visão Geral', icon: Home },
  { path: '/calendar', label: 'Calendário', icon: Calendar },
  { path: '/content', label: 'Conteúdo', icon: LayoutTemplate },
  { path: '/copies', label: 'Copies & Ideias', icon: PenTool },
  { path: '/hashtags', label: 'Hashtags', icon: Hash },
  { path: '/metrics', label: 'Métricas', icon: BarChart3 },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/references', label: 'Referências', icon: ImageIcon },
  { path: '/identity', label: 'Identidade Visual', icon: Palette },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { isAdmin } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="brand-logo">T</div>
          <span className="brand-name">Marketing Hub</span>
        </div>
        <button className="toggle-btn" onClick={onToggle} title="Alternar Menu">
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">
                <Icon size={20} />
              </div>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink 
            to="/team"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon" style={{ color: '#10b981' }}>
              <Users size={20} />
            </div>
            <span className="nav-label" style={{ color: '#10b981' }}>Visão da Equipe</span>
          </NavLink>
        )}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <button 
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '12px 0' }}
          className="nav-item"
        >
          <div className="nav-icon">
            <LogOut size={20} />
          </div>
          <span className="nav-label">Sair do Hub</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
