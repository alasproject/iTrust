import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, Clock, MapPin, MessageSquare, ExternalLink, ChevronRight } from 'lucide-react';
import { Contract } from '../types';
import { cn } from '../lib/utils';

interface ExecutionScreenProps {
  contract: Contract;
  onComplete: () => void;
}

export function ExecutionScreen({ contract, onComplete }: ExecutionScreenProps) {
  const [progress, setProgress] = useState(35);
  const [showNotification, setShowNotification] = useState(false);

  const handleComplete = () => {
    setShowNotification(true);
    setTimeout(onComplete, 2000);
  };

  const timeline = [
    { date: 'Hoje, 10:30', event: 'Escrow provisionado com sucesso', status: 'done' },
    { date: 'Hoje, 10:35', event: 'Projeto iniciado (Kick-off)', status: 'done' },
    { date: 'Em andamento', event: 'Desenvolvimento do conceito visual', status: 'current' },
    { date: 'Previsto', event: 'Primeira revisão de design', status: 'next' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900">{contract.title}</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
             <Clock className="w-3 h-3" /> Entrega em {contract.deadline}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-indigo-600">{progress}%</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Progresso</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
        />
      </div>

      <div className="grid gap-6">
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Linha do Tempo
          </h2>

          <div className="space-y-6 relative ml-3">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-slate-100" />
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-8">
                <div className={cn(
                  "absolute left-[-4px] top-1.5 w-2 h-2 rounded-full",
                  item.status === 'done' ? "bg-emerald-500" :
                  item.status === 'current' ? "bg-indigo-500 ring-4 ring-indigo-50" : "bg-slate-200"
                )} />
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</div>
                <div className={cn(
                  "text-sm font-semibold mt-0.5",
                  item.status === 'done' ? "text-slate-500" :
                  item.status === 'current' ? "text-slate-900" : "text-slate-300"
                )}>
                  {item.event}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Arquivos & Entregas</h2>
            <button className="text-xs font-bold text-indigo-600 hover:underline">Ver tudo</button>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center border-2 border-dashed border-slate-200 h-24">
            <div className="text-center group cursor-pointer">
              <div className="bg-white p-2 rounded-lg inline-block shadow-sm group-hover:scale-110 transition-transform">
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tighter">Nenhum arquivo anexado ainda</p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex gap-4 pt-4">
        <button className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
          <MessageSquare className="w-6 h-6" />
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-100"
        >
          Finalizar & Liberar Pagamento
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl z-50 whitespace-nowrap"
        >
          <div className="bg-emerald-500 p-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Contrato Finalizado!</p>
            <p className="text-slate-400 text-xs">Pagamento liberado para {contract.parties.client}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
