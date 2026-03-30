import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  dangerColor: string;
  bgMain: string;
  bgCard: string;
  bgSidebar: string;
  bgInput: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  radiusCard: string;
  fontFamily: string;
  brandName: string;
}

interface ThemeContextType {
  theme: ThemeState;
  updateTheme: (updates: Partial<ThemeState>) => void;
}

const defaultTheme: ThemeState = {
  primaryColor: '#7c3aed', // Roxo base
  secondaryColor: '#10b981', // Verde sucesso
  dangerColor: '#ef4444',
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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeState>(() => {
    const saved = localStorage.getItem('trilhar_theme');
    return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('trilhar_theme', JSON.stringify(theme));
    
    // Aplicando na raiz do documento
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-danger', theme.dangerColor);
    root.style.setProperty('--color-success', theme.secondaryColor); // usando secundária para sucesso por padrão
    
    root.style.setProperty('--bg-main', theme.bgMain);
    root.style.setProperty('--bg-card', theme.bgCard);
    root.style.setProperty('--bg-sidebar', theme.bgSidebar);
    root.style.setProperty('--bg-input', theme.bgInput);
    
    root.style.setProperty('--border-color', theme.borderColor);
    
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    
    root.style.setProperty('--radius-card', theme.radiusCard);
    
    root.style.setProperty('--font-family', `"${theme.fontFamily}", sans-serif`);

    // Injetando fonte dinamicamente se for Google Font
    const fontUrl = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    let link = document.getElementById('dynamic-font') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    if (link.href !== fontUrl) {
      link.href = fontUrl;
    }
    
  }, [theme]);

  const updateTheme = (updates: Partial<ThemeState>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
