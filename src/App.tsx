import React, { useState, useEffect } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { ChatView } from './components/ChatView';
import { DashboardView } from './components/DashboardView';
import { ScansView } from './components/ScansView';
import { VulnerabilitiesView } from './components/VulnerabilitiesView';
import { ReportsView } from './components/ReportsView';
import { AuthorizationsView } from './components/AuthorizationsView';
import { ToolsCatalogView } from './components/ToolsCatalogView';
import { NewScanModal } from './components/NewScanModal';
import { AnalyzeRawModal } from './components/AnalyzeRawModal';
import { AuthorizationModal } from './components/AuthorizationModal';
import { api } from './services/api';
import {
  ScanJob,
  SecurityFinding,
  AuthorizationRecord,
  ConversationThread,
  SecurityTool,
  VaptReport
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<SecurityFinding | null>(null);
  const [reports, setReports] = useState<VaptReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [authorizations, setAuthorizations] = useState<AuthorizationRecord[]>([]);
  const [tools, setTools] = useState<SecurityTool[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('testphp.vulnweb.com');

  // Modals state
  const [isNewScanOpen, setIsNewScanOpen] = useState(false);
  const [isAnalyzeRawOpen, setIsAnalyzeRawOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTarget, setAuthModalTarget] = useState('testphp.vulnweb.com');

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Periodic refresh when there are running scans
  useEffect(() => {
    const hasRunning = scans.some(s => s.status === 'running' || s.status === 'queued');
    if (!hasRunning) return;

    const interval = setInterval(() => {
      refreshScansAndFindings();
    }, 3000);

    return () => clearInterval(interval);
  }, [scans]);

  const loadAllData = async () => {
    try {
      const [convs, scanList, vulnList, repList, authList, toolList] = await Promise.all([
        api.getConversations().catch(() => []),
        api.getScans().catch(() => []),
        api.getVulnerabilities().catch(() => []),
        api.getReports().catch(() => []),
        api.getAuthorizations().catch(() => []),
        api.getTools().catch(() => [])
      ]);

      setConversations(convs);
      if (convs.length > 0 && !currentConversationId) {
        setCurrentConversationId(convs[0].id);
      }

      setScans(scanList);
      if (scanList.length > 0 && !selectedScanId) {
        setSelectedScanId(scanList[0].id);
      }

      setFindings(vulnList);
      setReports(repList);
      setAuthorizations(authList);
      setTools(toolList);
    } catch (err) {
      console.error('Error loading initial state:', err);
    }
  };

  const refreshScansAndFindings = async () => {
    try {
      const [scanList, vulnList, repList] = await Promise.all([
        api.getScans(),
        api.getVulnerabilities(),
        api.getReports()
      ]);
      setScans(scanList);
      setFindings(vulnList);
      setReports(repList);
    } catch (err) {
      console.error('Error refreshing scans:', err);
    }
  };

  // Chat actions
  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation('New Security Assessment');
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Launch scan handler
  const handleLaunchScan = async (params: {
    target: string;
    targetType?: string;
    scanType?: string;
    authorizationId?: string;
  }) => {
    try {
      const newScan = await api.createScan(params);
      setScans(prev => [newScan, ...prev]);
      setSelectedScanId(newScan.id);
      setSelectedTarget(newScan.target);
      setActiveTab('scans');
    } catch (err: any) {
      alert(err.message || 'Failed to start scan');
    }
  };

  // Authorizations
  const handleAddAuthorization = async (params: any) => {
    const newAuth = await api.createAuthorization(params);
    setAuthorizations(prev => [newAuth, ...prev]);
    setSelectedTarget(newAuth.target);
  };

  const handleRevokeAuthorization = async (id: string) => {
    await api.revokeAuthorization(id);
    setAuthorizations(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'revoked' as const } : a))
    );
  };

  const openAuthForTarget = (target: string) => {
    setAuthModalTarget(target);
    setIsAuthModalOpen(true);
  };

  const activeScanCount = scans.filter(s => s.status === 'running' || s.status === 'queued').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vulnerabilityCount={findings.length}
        activeScanCount={activeScanCount}
        onOpenNewScan={() => setIsNewScanOpen(true)}
        onOpenAnalyzeRaw={() => setIsAnalyzeRawOpen(true)}
        onOpenAuthorization={() => openAuthForTarget(selectedTarget)}
        selectedTarget={selectedTarget}
      />

      {/* Main View Area */}
      <div className="flex-1">
        {activeTab === 'chat' && (
          <ChatView
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={setCurrentConversationId}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onNavigateToScan={(scanId) => {
              setSelectedScanId(scanId);
              setActiveTab('scans');
            }}
            onNavigateToFindings={() => setActiveTab('vulnerabilities')}
            onOpenAuthorizationForTarget={openAuthForTarget}
            selectedTarget={selectedTarget}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            scans={scans}
            findings={findings}
            authorizations={authorizations}
            onLaunchScanType={(type) => {
              handleLaunchScan({
                target: selectedTarget || 'testphp.vulnweb.com',
                scanType: type
              });
            }}
            onSelectScan={(scanId) => {
              setSelectedScanId(scanId);
              setActiveTab('scans');
            }}
            onSelectFinding={(f) => {
              setSelectedFinding(f);
              setActiveTab('vulnerabilities');
            }}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'scans' && (
          <ScansView
            scans={scans}
            selectedScanId={selectedScanId}
            onSelectScan={setSelectedScanId}
            onLaunchNewScan={() => setIsNewScanOpen(true)}
            onSelectFinding={(f) => {
              setSelectedFinding(f);
              setActiveTab('vulnerabilities');
            }}
            onNavigateToReports={(reportId) => {
              setSelectedReportId(reportId);
              setActiveTab('reports');
            }}
          />
        )}

        {activeTab === 'vulnerabilities' && (
          <VulnerabilitiesView
            findings={findings}
            selectedFinding={selectedFinding}
            onSelectFinding={setSelectedFinding}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            reports={reports}
            scans={scans}
            selectedReportId={selectedReportId}
          />
        )}

        {activeTab === 'authorizations' && (
          <AuthorizationsView
            authorizations={authorizations}
            onAddAuthorization={handleAddAuthorization}
            onRevokeAuthorization={handleRevokeAuthorization}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsCatalogView tools={tools} />
        )}
      </div>

      {/* Global Modals */}
      <NewScanModal
        isOpen={isNewScanOpen}
        onClose={() => setIsNewScanOpen(false)}
        onLaunch={handleLaunchScan}
        authorizations={authorizations}
        defaultTarget={selectedTarget}
        onOpenAuthorizationForTarget={openAuthForTarget}
      />

      <AnalyzeRawModal
        isOpen={isAnalyzeRawOpen}
        onClose={() => setIsAnalyzeRawOpen(false)}
        onAnalysisComplete={(scanId) => {
          setSelectedScanId(scanId);
          refreshScansAndFindings();
          setActiveTab('scans');
        }}
      />

      <AuthorizationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        target={authModalTarget}
        onConfirm={async (params) => {
          await handleAddAuthorization(params);
        }}
      />
    </div>
  );
}

export default App;
