import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldCheck, TrendingUp, History, Star, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { type Profile } from '../lib/supabase';

interface ProfileScreenProps {
  profile: Profile | null;
  onBack: () => void;
  onViewReport: () => void;
}

export function ProfileScreen({ profile, onBack, onViewReport }: ProfileScreenProps) {
  const stats = [
    { label: 'Score de Confiança', value: profile?.trust_score?.toString() ?? '—', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Taxa de Sucesso',    value: '100%',                                   icon: TrendingUp,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Nível',             value: `Nível ${profile?.level ?? 1}`,            icon: History,     color: 'text-amber-600',   bg: 'bg-amber-50' },
  ];

  const displayName = profile?.full_name || 'Usuário iTrust';
  const avatarUrl   = profile?.avatar_url;
  const itrustId    = profile?.itrust_id || '—';
  const specialty   = profile?.specialty || 'Usuário Verificado';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-500" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Meu iTrust ID</h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto bg-indigo-50 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-4xl font-black text-indigo-300">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {profile?.is_verified && (
            <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg border-4 border-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">{displayName}</h2>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">{specialty}</p>
          <p className="text-indigo-400 text-xs font-mono mt-1">{itrustId}</p>
        </div>

        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <div className="pt-6 grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className={cn('p-2 rounded-xl inline-block mb-1', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider ml-2">Conquistas de Reputação</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-600">Pontualidade Certificada</div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 opacity-50 grayscale">
            <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-400">Investidor Anjo (Privado)</div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-6 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-1">Confiança Máxima</h3>
          <p className="text-indigo-100 text-sm leading-relaxed mb-4">
            Score atual: <strong>{profile?.trust_score ?? 0}</strong>. Continue concluindo contratos para aumentar sua reputação.
          </p>
          <button
            onClick={onViewReport}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors backdrop-blur-sm"
          >
            Ver Relatório Completo
          </button>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
      </div>
    </div>
  );
}
