import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Wallet, ArrowRight, CheckCircle2, Timer, Lock, RefreshCcw } from 'lucide-react';
import { Contract } from '../types';
import { cn } from '../lib/utils';

interface EscrowScreenProps {
  contract: Contract;
  onContinue: () => void;
}

export function EscrowScreen({ contract, onContinue }: EscrowScreenProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3500),
      setTimeout(() => setStep(3), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: 'Verificando Chaves do Contrato', status: step >= 1 ? 'done' : 'loading' },
    { label: 'Provisionando Cofre Escrow', status: step >= 2 ? 'done' : step === 1 ? 'loading' : 'pending' },
    { label: 'Bloqueando Fundos no Protocolo iTrust', status: step >= 3 ? 'done' : step === 2 ? 'loading' : 'pending' },
  ];

  return (
    <div className="flex flex-col h-full space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="bg-indigo-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Segurança iTrust Escrow</h1>
        <p className="text-slate-500 font-medium">Seus ativos protegidos por código</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Valor Protegido</span>
            <span className="text-3xl font-mono font-bold tracking-tighter">R$ {(contract.value * 0.5).toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Taxa iTrust</span>
            <span className="text-lg font-mono font-bold text-slate-300">R$ 15,00</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  s.status === 'done' ? "bg-emerald-500 border-emerald-500 text-white" :
                  s.status === 'loading' ? "border-indigo-500 text-indigo-500 animate-pulse" : "border-slate-100 text-slate-200"
                )}>
                  {s.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> :
                   s.status === 'loading' ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Timer className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-sm font-semibold transition-all duration-300",
                  s.status === 'done' ? "text-slate-900" :
                  s.status === 'loading' ? "text-indigo-600" : "text-slate-300"
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className={cn(
            "transition-all duration-700 bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between",
            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status de Ativos</p>
                <p className="text-sm font-bold text-emerald-600">FUNDO GARANTIDO</p>
              </div>
            </div>
            <button
              onClick={onContinue}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Iniciar Execução
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end pb-4">
        <p className="text-[10px] text-center text-slate-400 leading-relaxed max-w-xs mx-auto">
          O iTrust retém os fundos em uma conta de custódia inteligente até que ambos os lados confirmem a entrega através de provas de trabalho digitais.
        </p>
      </div>
    </div>
  );
}
