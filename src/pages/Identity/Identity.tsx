import { useEffect, useState } from 'react';
import { Palette, Type, LayoutTemplate, Save, RefreshCw, PanelsTopLeft } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './Identity.css';

const DEFAULT_THEME = {
  primaryColor: '#7c3aed',
  secondaryColor: '#10b981',
  dangerColor: '#ef4444',
  buttonTextColor: '#ffffff',
  bgMain: '#0f1117',
  bgCard: '#1a1d27',
  bgSidebar: '#13151f',
  bgInput: '#1e2130',
  borderColor: '#2a2d3e',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  radiusCard: '12px',
  fontFamily: 'Inter',
  brandName: 'Trilhar'
};

const FONTS = ['Inter', 'Roboto', 'Outfit', 'Poppins', 'Montserrat', 'Playfair Display'];
const BORDER_RADIUS = [
  { label: 'Quadrado', value: '0px' },
  { label: 'Leve', value: '4px' },
  { label: 'Padrão', value: '8px' },
  { label: 'Moderno', value: '12px' },
  { label: 'Arredondado', value: '24px' }
];

const Identity = () => {
  const { theme, updateTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleChange = (key: keyof typeof theme, value: string) => {
    const nextTheme = { ...localTheme, [key]: value };
    setLocalTheme(nextTheme);
    // Preview em tempo real em toda a aplicação
    updateTheme(nextTheme);
  };

  const handleSave = () => {
    updateTheme(localTheme);
    alert('Tema aplicado com sucesso.');
  };

  const handleReset = () => {
    setLocalTheme(DEFAULT_THEME);
    updateTheme(DEFAULT_THEME);
  };

  return (
    <div className="identity-container">
      <div className="identity-header">
        <div>
          <h1 className="page-title">Identidade Visual</h1>
          <p className="page-description">Gerencie as cores, fontes, fundos e o formato de todo o software.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleReset} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} /> Restaurar Padrão
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} /> Aplicar Marca
          </button>
        </div>
      </div>

      <div className="identity-grid">
        <div className="identity-section">
          <h3><LayoutTemplate size={20} color="var(--color-primary)" /> Estrutura & Marca</h3>
          
          <div className="form-grid">
            <div className="control-group">
              <label>Nome da Marca/Empresa</label>
              <input 
                type="text" 
                className="identity-input" 
                value={localTheme.brandName} 
                onChange={e => handleChange('brandName', e.target.value)}
              />
            </div>

            <div className="control-group">
              <label>Arredondamento de Bordas (Card Radius)</label>
              <select 
                className="identity-input" 
                value={localTheme.radiusCard} 
                onChange={e => handleChange('radiusCard', e.target.value)}
              >
                {BORDER_RADIUS.map(r => (
                  <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Família Tipográfica (Google Fonts)</label>
              <select 
                className="identity-input" 
                value={localTheme.fontFamily} 
                onChange={e => handleChange('fontFamily', e.target.value)}
              >
                {FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="identity-section">
          <h3><Palette size={20} color="var(--color-primary)" /> Cores de Preenchimento</h3>
          
          <div className="form-grid">
            <div className="control-group">
              <label>Fundo da Aplicação (Main Base)</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.bgMain} onChange={e => handleChange('bgMain', e.target.value)} />
                <span className="color-hex">{localTheme.bgMain}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Fundo da Sidebar Menu</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.bgSidebar} onChange={e => handleChange('bgSidebar', e.target.value)} />
                <span className="color-hex">{localTheme.bgSidebar}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Fundo dos Cards/Painéis</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.bgCard} onChange={e => handleChange('bgCard', e.target.value)} />
                <span className="color-hex">{localTheme.bgCard}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Fundo de Inputs (Formulários)</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.bgInput} onChange={e => handleChange('bgInput', e.target.value)} />
                <span className="color-hex">{localTheme.bgInput}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="identity-section">
          <h3><Type size={20} color="var(--color-primary)" /> Detalhes & Componentes</h3>
          
          <div className="form-grid">
            <div className="control-group">
              <label>Cor Primária (Botões e Destaques)</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} />
                <span className="color-hex">{localTheme.primaryColor}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Texto dos Botões</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.buttonTextColor} onChange={e => handleChange('buttonTextColor', e.target.value)} />
                <span className="color-hex">{localTheme.buttonTextColor}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Cor Secundária (Sucesso/Avisos)</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.secondaryColor} onChange={e => handleChange('secondaryColor', e.target.value)} />
                <span className="color-hex">{localTheme.secondaryColor}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Texto Primário (Títulos)</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.textPrimary} onChange={e => handleChange('textPrimary', e.target.value)} />
                <span className="color-hex">{localTheme.textPrimary}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Texto Secundário (Descrições)</label>
              <div className="color-picker-wrap">
                <input type="color" className="color-input-bubble" value={localTheme.textSecondary} onChange={e => handleChange('textSecondary', e.target.value)} />
                <span className="color-hex">{localTheme.textSecondary}</span>
              </div>
            </div>
            
            <div className="control-group" style={{ gridColumn: '1 / -1' }}>
              <label>Linhas de Grade e Bordas (Border Color)</label>
              <div className="color-picker-wrap" style={{ maxWidth: '300px' }}>
                <input type="color" className="color-input-bubble" value={localTheme.borderColor} onChange={e => handleChange('borderColor', e.target.value)} />
                <span className="color-hex">{localTheme.borderColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="identity-section">
          <h3><PanelsTopLeft size={20} color="var(--color-primary)" /> Preview em Tempo Real</h3>
          <div className="theme-preview">
            <aside className="theme-preview-sidebar">
              <div className="theme-preview-brand">Trilhar</div>
              <div className="theme-preview-nav-item active">Dashboard</div>
              <div className="theme-preview-nav-item">Calendario</div>
              <div className="theme-preview-nav-item">Metas</div>
            </aside>
            <div className="theme-preview-main">
              <div className="theme-preview-card">
                <h4>Titulo do card</h4>
                <p>Texto secundario para validar contraste e legibilidade.</p>
                <div className="theme-preview-actions">
                  <button className="btn-primary">Botao primario</button>
                  <button className="theme-preview-ghost">Botao secundario</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Identity;
