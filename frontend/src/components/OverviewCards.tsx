import React from 'react';
import { ThreatSummary } from '../types/index.js';
import { AlertCircle, TrendingUp, Zap, Clock } from 'lucide-react';

interface OverviewCardsProps {
  summary: ThreatSummary | null;
  loading: boolean;
}

export function OverviewCards({ summary, loading }: OverviewCardsProps) {
  const colorMap = {
    'dark-500': {
      bg: 'bg-dark-500/10',
      icon: 'text-dark-500',
    },
    'orange-500': {
      bg: 'bg-orange-500/10',
      icon: 'text-orange-500',
    },
    'red-500': {
      bg: 'bg-red-500/10',
      icon: 'text-red-500',
    },
    'yellow-500': {
      bg: 'bg-yellow-500/10',
      icon: 'text-yellow-500',
    },
  } as const;

  const cards = [
    {
      title: 'Total Alerts',
      value: summary?.totalAlerts ?? 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: colorMap['dark-500'],
    },
    {
      title: 'High-Risk Threats',
      value: summary?.highRisk ?? 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: colorMap['orange-500'],
    },
    {
      title: 'Critical Threats',
      value: summary?.criticalRisk ?? 0,
      icon: <Zap className="w-6 h-6" />,
      color: colorMap['red-500'],
    },
    {
      title: 'Active Incidents',
      value: summary?.activeIncidents ?? 0,
      icon: <Clock className="w-6 h-6" />,
      color: colorMap['yellow-500'],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="card-glow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{card.title}</p>
              <p className={`text-3xl font-bold mt-2 ${loading ? 'opacity-50' : ''}`}>
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.color.bg}`}>
              <div className={`${card.color.icon}`}>{card.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
