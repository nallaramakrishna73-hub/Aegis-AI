import React, { useEffect } from 'react';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { Threats } from './pages/Threats.js';
import './index.css';

export function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  useEffect(() => {
    // Handle navigation
    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href === '/') setCurrentPage('dashboard');
        else if (href === '/threats') setCurrentPage('threats');
        else if (href === '/analytics') setCurrentPage('dashboard');
        else if (href === '/assistant') setCurrentPage('dashboard');
        else if (href === '/reports') setCurrentPage('dashboard');
        else if (href === '/settings') setCurrentPage('dashboard');
      }
    };

    document.addEventListener('click', handleNavClick);
    return () => document.removeEventListener('click', handleNavClick);
  }, []);

  return (
    <div className="bg-gradient-dark min-h-screen text-slate-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'threats' && <Threats />}
          </div>
        </main>
      </div>
    </div>
  );
}
