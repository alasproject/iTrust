import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, Calendar, Shield, BarChart3, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { type Profile } from '../lib/supabase';

interface FullReportScreenProps {
  profile: Profile | null;
  onBack: () => void;
}

export function FullReportScreen({ profile, onBack }: FullReportScreenProps) {
  const score = profile?.trust_score ?? 0;
  const percentile = Math.round((score / 1000) * 100);

  const stats = [
    { label: 'Score Geral',  value: score.toString(),          change: '+12%',    trend: 'up' },
    { label: 'Nível',        value: `${profile?.level ?? 1}`,  change: 'Ativo',   trend: 'up' },
    { label: 'Recusa/Disputa', value: '0%',                    change: '0%',      trend: 'stable' },
    { label: 'Destaque',     value: `Top ${100 - percentile}%`, change: 'Platinum', trend: 'up' },
  ];

  const breakdown = [
    { category: 'Integridade',   score: Math.min(99, Math.round(score * 0.1)),  status: 'Impecável' },
    { category: 'Pontualidade',  score: Math.min(95, Math.round(score * 0.095)), status: 'Excelente' },
    { category: 'Comunicação',   score: Math.min(92, Math.round(score * 0.09)),  status: 'Boa' },
    { category: 'Qualidade',     score: Math.min(98, Math.round(score * 0.098)), status: 'Referência' },
  ];

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <header className="px-6 py-6 flex items-center gap-4 border-b border-slate-50">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Relatório iTrust</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análise de Redução de Risco</p>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Hero */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Status da Rede</p>
                <h2 className="text-3xl font-black tracking-tighter">Confiança Máxima</h2>
              </div>
              <Shield className="w-10 h-10 text-indigo-500" />
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentile}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              />
            </div>
            <div className="flex justify-between items-end">
              <p className="text-slate-400 text-xs font-medium">Você é mais confiável que {percentile}% dos usuários.</p>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Score</p>
                <p className="text-2xl font-black text-white">{score}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-100"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <div className={cn('flex items-center text-[10px] font-black uppercase', stat.trend === 'up' ? 'text-emerald-500' : 'text-slate-400')}>
                  {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Detalhamento de Prova
          </h3>
          <div className="space-y-4">
            {breakdown.map((item, i) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600">{item.category}</span>
                  <span className="text-slate-400 uppercase tracking-tighter">{item.status}</span>
                </div>
                <div className="h-6 w-full bg-slate-50 rounded-xl overflow-hidden p-1 flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    className="h-full bg-indigo-600 rounded-lg relative"
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-white">{item.score}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight */}
        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-bold text-indigo-900">Insight do Mês</h4>
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed font-medium">
            {profile?.full_name?.split(' ')[0] ?? 'Você'}, sua taxa de finalização rápida aumentou. Isso sugere que você está otimizando seus processos de entrega, o que reflete positivamente nos novos contratos iTrust.
          </p>
        </div>
      </main>

      <footer className="p-6 pt-0">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <Calendar className="w-4 h-4 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Relatório gerado em {today}</p>
        </div>
      </footer>
    </div>
  );
}
