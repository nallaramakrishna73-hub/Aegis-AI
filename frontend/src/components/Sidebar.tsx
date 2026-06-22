import React from 'react';
import { LayoutDashboard, AlertTriangle, BarChart3, MessageSquare, FileText, Settings } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Threats', href: '/threats' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/analytics' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Assistant', href: '/assistant' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', href: '/reports' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = React.useState('Dashboard');

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-700 flex-col h-screen sticky top-0">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setActiveItem(item.label)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeItem === item.label
                ? 'bg-dark-600 text-dark-100 shadow-glow'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">v0.1.0</p>
      </div>
    </aside>
  );
}
