import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, ShieldCheck, ChevronRight, Palette, Code, Megaphone, Terminal, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { RankingService, type RankingEntry } from '../lib/supabase';

interface RankingScreenProps {
  onSelectUser: (name: string) => void;
  onViewRequirements: () => void;
}

const segments = [
  { name: 'Design',    icon: Palette,   specialty: 'design' },
  { name: 'Dev',       icon: Code,      specialty: 'dev' },
  { name: 'Marketing', icon: Megaphone, specialty: 'marketing' },
  { name: 'Tech',      icon: Terminal,  specialty: 'tech' },
];

export function RankingScreen({ onSelectUser, onViewRequirements }: RankingScreenProps) {
  const [activeSegment, setActiveSegment] = useState(segments[0]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRanking();
  }, [activeSegment]);

  const loadRanking = async () => {
    setIsLoading(true);
    try {
      const data = await RankingService.getGlobalRanking(activeSegment.specialty, 10);
      setRankings(data);
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setRankings([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 p-3 rounded-2xl">
          <Trophy className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Top iTrust Proof</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Os melhores da rede por segmento</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
        {segments.map((seg) => (
          <button
            key={seg.name}
            onClick={() => setActiveSegment(seg)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2',
              activeSegment.name === seg.name
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100',
            )}
          >
            <seg.icon className="w-4 h-4" />
            {seg.name}
          </button>
        ))}
      </div>

      <div className="space-y-4 min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            Nenhum profissional encontrado nesta categoria ainda.
          </div>
        ) : (
          rankings.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelectUser(item.full_name)}
              className="group bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer relative overflow-hidden"
            >
              {i === 0 && (
                <div className="absolute top-0 right-10 bg-amber-400 text-white px-4 py-1 rounded-b-xl text-[10px] font-bold uppercase tracking-widest">
                  #1 Ranking
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 bg-indigo-50 flex items-center justify-center">
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt={item.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl font-black text-indigo-200">{item.full_name.charAt(0)}</span>
                    )}
                  </div>
                  {item.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.full_name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-800">{item.avg_rating?.toFixed(1) ?? '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Projetos</p>
                      <p className="text-sm font-bold text-slate-600">{item.total_contracts}</p>
                    </div>
                    <div className="h-4 w-px bg-slate-100" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Score</p>
                      <p className="text-sm font-bold text-indigo-600">{item.trust_score}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-full text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-indigo-600 p-8 rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-indigo-100">
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-black tracking-tighter leading-tight">Melhore seu Ranking</h2>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed">Complete contratos sem disputas e peça avaliações para subir no iTrust ID.</p>
          <button
            onClick={onViewRequirements}
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors"
          >
            Ver Requisitos
          </button>
        </div>
        <Trophy className="absolute top-0 right-0 w-48 h-48 opacity-10 -mr-10 -mt-10" />
      </div>
    </div>
  );
}
