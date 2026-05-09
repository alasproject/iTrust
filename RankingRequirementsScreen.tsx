import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, CheckCircle2, Zap, TrendingUp, Award, Clock, MessageSquare, Handshake } from 'lucide-react';
import { cn } from '../lib/utils';

interface RankingRequirementsScreenProps {
  onBack: () => void;
}

export function RankingRequirementsScreen({ onBack }: RankingRequirementsScreenProps) {
  const steps = [
    {
      title: "Verificação Biométrica",
      description: "Garante que sua conta é única e real através de prova de vida descentralizada.",
      points: "+200 pontos",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
       title: "Contratos Finalizados",
       description: "Cada contrato concluído com sucesso e sem disputas aumenta sua relevância.",
       points: "+50 pontos por Job",
       icon: CheckCircle2,
       color: "text-indigo-500",
       bg: "bg-indigo-50"
    },
    {
       title: "NPS e Avaliações",
       description: "Feedback positivo dos seus clientes é o maior peso no algoritmo iTrust.",
       points: "Multiplicador 1.5x",
       icon: Award,
       color: "text-amber-500",
       bg: "bg-amber-50"
    }
  ];

  const subRequirements = [
     { icon: Clock, text: "Tempo de resposta < 2h" },
     { icon: MessageSquare, text: "Comunicação fluida" },
     { icon: Handshake, text: "Taxa de resolução 100%" },
     { icon: TrendingUp, text: "Volume transacionado" }
  ];

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <header className="px-6 py-6 flex items-center gap-4 border-b border-slate-50">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Requisitos do Ranking</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">iTrust ID Protocol</p>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-10 overflow-y-auto">
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
           <Zap className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-6 -mt-6" />
           <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tighter mb-2">Seu Score Atual: 450</h2>
              <p className="text-indigo-100 text-sm font-medium">Você está no top 15% da sua categoria. Faltam 100 pontos para o nível Platinum.</p>
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Atividades de Impacto</h3>
           <div className="space-y-4">
              {steps.map((step, i) => (
                 <motion.div 
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-5 rounded-3xl border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm"
                 >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", step.bg, step.color)}>
                       <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-900">{step.title}</h4>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", step.color)}>{step.points}</span>
                       </div>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">{step.description}</p>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Critérios de Desempate</h3>
           <div className="grid grid-cols-2 gap-3">
              {subRequirements.map((req, i) => (
                 <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <req.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{req.text}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-[3rem] text-white">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Próximo Nível</h4>
           </div>
           <h3 className="text-xl font-bold tracking-tight mb-4">Alcance o Nível Platinum</h3>
           <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs text-slate-400">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span>Taxa de Escrow reduzida em 0.5%</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-400">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span>Destaque prioritário na busca</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-400">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span>Acesso ao iTrust Lounge Premium</span>
              </li>
           </ul>
        </div>
      </main>

      <footer className="p-8">
        <button 
           onClick={onBack}
           className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-100"
        >
           Entendi, vamos crescer!
        </button>
      </footer>
    </div>
  );
}
