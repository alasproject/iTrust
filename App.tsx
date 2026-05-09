import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, User, Shield, Info, Trophy, Search } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { VoiceRecording } from './components/VoiceRecording';
import { ContractEditor } from './components/ContractEditor';
import { SignatureScreen } from './components/SignatureScreen';
import { EscrowScreen } from './components/EscrowScreen';
import { ExecutionScreen } from './components/ExecutionScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { SearchIDScreen } from './components/SearchIDScreen';
import { RatingScreen } from './components/RatingScreen';
import { RankingScreen } from './components/RankingScreen';
import { RankingRequirementsScreen } from './components/RankingRequirementsScreen';
import { FullReportScreen } from './components/FullReportScreen';
import { AppStep, Contract } from './types';
import { cn } from './lib/utils';
import {
  AuthService,
  ContractService,
  EscrowService,
  RatingService,
  ProfileService,
  type Profile,
} from './lib/supabase';
import { type AcordoExtraido } from './lib/groq';

export default function App() {
  const [step, setStep]                     = useState<AppStep>('login');
  const [contracts, setContracts]           = useState<Contract[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [currentUser, setCurrentUser]       = useState<Profile | null>(null);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  // Guarda o AcordoExtraido do Groq para repassar ao ContractEditor
  const [acordoIA, setAcordoIA] = useState<AcordoExtraido | undefined>(undefined);

  // ─── Sessão ────────────────────────────────────────────────
  useEffect(() => {
    AuthService.getSession().then(async (session) => {
      if (session) {
        const profile = await ProfileService.getMyProfile();
        setCurrentUser(profile);
        setStep('dashboard');
        loadContracts();
      }
    });

    (window as any).onNavigateToRegister = () => setStep('register');

    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await ProfileService.getMyProfile();
        setCurrentUser(profile);
        loadContracts();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setContracts([]);
        setStep('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadContracts = async () => {
    setIsLoadingContracts(true);
    try {
      const data = await ContractService.getMyContracts();
      setContracts(data);
    } catch (err) {
      console.error('Erro ao carregar contratos:', err);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────

  const handleLogin = async () => {
    const profile = await ProfileService.getMyProfile();
    setCurrentUser(profile);
    await loadContracts();
    setStep('search-id');
  };

  const handleRegister = async () => {
    const profile = await ProfileService.getMyProfile();
    setCurrentUser(profile);
    setStep('search-id');
  };

  /**
   * Chamado pelo VoiceRecording quando o Groq termina.
   * Guarda o acordo extraído e abre o ContractEditor pré-preenchido.
   */
  const handleVoiceGenerate = (transcript: string, acordo: AcordoExtraido) => {
    setAcordoIA(acordo);
    setActiveContract({
      id:         '',
      title:      acordo.titulo_projeto || 'Novo Acordo',
      parties: {
        contractor: currentUser?.full_name || 'Você',
        client:     acordo.contratante || '',
      },
      value:      0,
      deadline:   acordo.prazo_estimado || '',
      conditions: [
        ...acordo.condicoes_entregaveis,
        ...acordo.condicoes_pagamento,
      ].filter(Boolean),
      status:     'draft',
      createdAt:  new Date().toISOString(),
      _voiceTranscript: transcript,
    } as any);
    setStep('contract-generation');
  };

  const handleApproveContract = async (contract: Contract) => {
    try {
      const clientId = (contract as any)._selectedClientId || currentUser!.id;

      const saved = await ContractService.createContract({
        title:           contract.title,
        clientId,
        totalValue:      contract.value,
        deadline:        contract.deadline,
        conditions:      contract.conditions,
        voiceTranscript: (activeContract as any)?._voiceTranscript,
        aiGenerated:     !!acordoIA,
        contractorName:  contract.parties.contractor,
        clientName:      contract.parties.client,
        contractorCpf:   contract.parties.contractorId,
        clientCpf:       contract.parties.clientId,
        contractorEmail: contract.parties.contractorEmail,
        clientEmail:     contract.parties.clientEmail,
      });

      setAcordoIA(undefined); // limpa após salvar
      setActiveContract(saved);
      setStep('signature');
    } catch (err) {
      console.error('Erro ao salvar contrato:', err);
      alert('Erro ao salvar contrato. Tente novamente.');
    }
  };

  const handleSign = async () => {
    if (!activeContract) return;
    try {
      const updated = await ContractService.signContract(activeContract.id);
      setActiveContract(updated);
      setStep('escrow');
    } catch (err) {
      console.error('Erro ao assinar:', err);
    }
  };

  const handleEscrowComplete = async () => {
    if (!activeContract || !currentUser) return;
    try {
      await EscrowService.createEscrow(
        activeContract.id,
        currentUser.id,
        currentUser.id,
        activeContract.value * 0.5,
      );
      const updated = await ContractService.activateContract(activeContract.id);
      setActiveContract(updated);
      setContracts(prev => [updated, ...prev.filter(c => c.id !== updated.id)]);
      setStep('execution');
    } catch (err) {
      console.error('Erro no escrow:', err);
    }
  };

  const handleExecutionComplete = async () => {
    if (!activeContract) return;
    try {
      await EscrowService.releaseEscrow(activeContract.id);
      const updated = await ContractService.completeContract(activeContract.id);
      setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
      setActiveContract(updated);
      setStep('rating');
    } catch (err) {
      console.error('Erro ao finalizar:', err);
    }
  };

  const handleRatingComplete = async (payload?: {
    score: number; tags: string[]; comment: string; reviewedId: string;
  }) => {
    if (payload && activeContract) {
      try {
        await RatingService.submitRating({
          contractId: activeContract.id,
          reviewedId: payload.reviewedId,
          score:      payload.score,
          tags:       payload.tags,
          comment:    payload.comment,
        });
      } catch (err) {
        console.error('Erro ao avaliar:', err);
      }
    }
    await loadContracts();
    setActiveContract(null);
    setStep('dashboard');
  };

  // ─── Render ────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;

      case 'register':
        return <RegisterScreen onBack={() => setStep('login')} onRegister={handleRegister} />;

      case 'search-id':
        return (
          <SearchIDScreen
            onSelect={() => setStep('dashboard')}
            onSkip={() => setStep('dashboard')}
          />
        );

      case 'ranking':
        return (
          <RankingScreen
            onSelectUser={() => setStep('dashboard')}
            onViewRequirements={() => setStep('ranking-requirements')}
          />
        );

      case 'ranking-requirements':
        return <RankingRequirementsScreen onBack={() => setStep('ranking')} />;

      case 'dashboard':
        return (
          <Dashboard
            contracts={contracts}
            isLoading={isLoadingContracts}
            onNewContract={() => setStep('voice-recording')}
            onSelectContract={(c) => {
              setActiveContract(c);
              setStep(c.status === 'completed' ? 'dashboard' : 'execution');
            }}
          />
        );

      case 'voice-recording':
        return (
          <VoiceRecording
            onCancel={() => setStep('dashboard')}
            onGenerate={handleVoiceGenerate}
            userName={currentUser?.full_name}
          />
        );

      case 'contract-generation':
        return (
          <ContractEditor
            initialData={activeContract || {}}
            acordoIA={acordoIA}
            onApprove={handleApproveContract}
            onBack={() => { setAcordoIA(undefined); setStep('dashboard'); }}
            userName={currentUser?.full_name}
          />
        );

      case 'signature':
        return <SignatureScreen contract={activeContract!} onSign={handleSign} />;

      case 'escrow':
        return <EscrowScreen contract={activeContract!} onContinue={handleEscrowComplete} />;

      case 'execution':
        return <ExecutionScreen contract={activeContract!} onComplete={handleExecutionComplete} />;

      case 'rating':
        return <RatingScreen contract={activeContract!} onFinish={handleRatingComplete} />;

      case 'profile':
        return (
          <ProfileScreen
            profile={currentUser}
            onBack={() => setStep('dashboard')}
            onViewReport={() => setStep('full-report')}
          />
        );

      case 'full-report':
        return <FullReportScreen profile={currentUser} onBack={() => setStep('profile')} />;

      default:
        return (
          <Dashboard
            contracts={contracts}
            isLoading={isLoadingContracts}
            onNewContract={() => setStep('voice-recording')}
            onSelectContract={setActiveContract}
          />
        );
    }
  };

  const isFullscreen = [
    'login', 'register', 'voice-recording', 'signature',
    'escrow', 'rating', 'ranking-requirements', 'full-report',
  ].includes(step);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {!isFullscreen && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-950">iTrust</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Info className="w-6 h-6" />
          </button>
        </header>
      )}

      <main className={cn(
        'max-w-md mx-auto min-h-[calc(100vh-80px)]',
        isFullscreen ? 'p-0 h-screen' : 'p-6 pb-24',
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isFullscreen && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
            { id: 'search-id', icon: Search,          label: 'Buscar' },
            { id: 'ranking',   icon: Trophy,           label: 'Ranking' },
            { id: 'profile',   icon: User,             label: 'Perfil' },
          ].map(({ id, icon: Icon, label }, i) => (
            <React.Fragment key={id}>
              {i === 2 && (
                <div className="relative -top-6">
                  <button
                    onClick={() => setStep('voice-recording')}
                    className="bg-indigo-600 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100 border-4 border-white active:scale-95 transition-transform"
                  >
                    <Shield className="w-7 h-7" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setStep(id as AppStep)}
                className={cn(
                  'flex flex-col items-center gap-1 transition-all',
                  step === id ? 'text-indigo-600' : 'text-slate-400',
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}
    </div>
  );
}
