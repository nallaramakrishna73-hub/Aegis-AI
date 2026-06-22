import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { onNewThreat } from '../services/socket.js';
import { ThreatSummary, ThreatRecord } from '../types/index.js';
import { OverviewCards } from '../components/OverviewCards.js';
import { ThreatTable } from '../components/ThreatTable.js';
import { RiskChart } from '../components/RiskChart.js';
import { TopSources } from '../components/TopSources.js';
import { Chat } from '../components/Chat.js';
import { ThreatTrends } from '../components/ThreatTrends.js';
import { LiveAlerts } from '../components/LiveAlerts.js';
import { ScenarioPanel } from '../components/ScenarioPanel.js';
import { ReportPanel } from '../components/ReportPanel.js';
import { ChatPrompts } from '../components/ChatPrompts.js';
import { StatusPanel } from '../components/StatusPanel.js';
import { RefreshCw } from 'lucide-react';

export function Dashboard() {
  const [summary, setSummary] = useState<ThreatSummary | null>(null);
  const [threats, setThreats] = useState<ThreatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [latestThreat, setLatestThreat] = useState<ThreatRecord | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const unsubscribe = onNewThreat((threat) => {
      setThreats((prev) => [threat, ...prev]);
      setLatestThreat(threat);
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              totalAlerts: prev.totalAlerts + 1,
              riskDistribution: {
                ...prev.riskDistribution,
                [threat.risk]: prev.riskDistribution[threat.risk] + 1,
              },
            }
          : null
      );
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryData, threatsData] = await Promise.all([
        api.getSummary(),
        api.getThreats(),
      ]);
      setSummary(summaryData);
      setThreats(threatsData);
      setLastUpdated(new Date());
      if (threatsData.length > 0) {
        setLatestThreat(threatsData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'docx') => {
    setReportGenerating(true);
    try {
      const data = await api.generateReport(format);
      if (data?.file) {
        window.open(data.file, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setReportGenerating(false);
    }
  };

  const handleScenarioAdded = async () => {
    await fetchData();
  };

  const handlePrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handlePromptSent = () => {
    setSelectedPrompt(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card-glow p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-dark-400">Security command center</p>
              <h1 className="text-3xl font-bold text-slate-100 mt-3">Security Dashboard</h1>
              <p className="text-slate-400 mt-2 max-w-2xl">
                Monitor threat activity, investigate alerts, and generate executive reports with confidence.
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Dashboard
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-glow">
              <p className="text-slate-400 text-sm">Latest update</p>
              <p className="text-slate-100 font-semibold mt-2">{lastUpdated.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-glow">
              <p className="text-slate-400 text-sm">Active monitoring</p>
              <p className="text-slate-100 font-semibold mt-2">Live log analysis enabled</p>
            </div>
          </div>
        </div>
        <div className="card-glow p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-dark-950">
          <p className="text-sm uppercase tracking-[0.2em] text-dark-400">Pulse</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-3">System protection status</h2>
          <p className="text-slate-400 mt-3">All sensors are active and the threat feed is connected.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-4">
              <p className="text-slate-400 text-xs uppercase tracking-[0.12em]">Threats</p>
              <p className="text-3xl font-semibold text-slate-100 mt-2">{summary?.totalAlerts ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-4">
              <p className="text-slate-400 text-xs uppercase tracking-[0.12em]">Risk score</p>
              <p className="text-3xl font-semibold text-slate-100 mt-2">{summary ? (summary.highRisk + summary.criticalRisk) : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards summary={summary} loading={loading} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Threat Table */}
        <div className="lg:col-span-2">
          <ThreatTable threats={threats} loading={loading} />
        </div>

        {/* Right column: Charts */}
        <div className="space-y-6">
          <RiskChart summary={summary} loading={loading} />
          <TopSources summary={summary} loading={loading} />
        </div>
      </div>

      {/* Chat + panels */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Chat externalPrompt={selectedPrompt} onPromptSent={handlePromptSent} />
          <ChatPrompts onPrompt={handlePrompt} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <LiveAlerts threat={latestThreat} />
          <ThreatTrends threats={threats} />
          <ReportPanel onGenerate={handleGenerateReport} generating={reportGenerating} />
          <ScenarioPanel onScenarioAdded={handleScenarioAdded} />
          <StatusPanel summaryLoaded={!loading} />
        </div>
      </div>
    </div>
  );
}
