import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`theme-toggle ${className}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="hidden sm:inline font-['Noto_Sans_Telugu'] text-[10px] font-bold">
        {isDark ? 'లైట్' : 'డార్క్'}
      </span>
    </button>
  );
};

export default ThemeToggle;
