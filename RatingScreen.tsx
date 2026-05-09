import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft } from 'lucide-react';
import { Contract } from '../types';
import { cn } from '../lib/utils';

interface RatingScreenProps {
  contract: Contract;
  onFinish: (payload?: {
    score: number;
    tags: string[];
    comment: string;
    reviewedId: string;
  }) => void;
}

export function RatingScreen({ contract, onFinish }: RatingScreenProps) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const tags = [
    { label: 'Entregou no Prazo',  emoji: '⏰' },
    { label: 'Boa Comunicação',    emoji: '💬' },
    { label: 'Qualidade Técnica',  emoji: '✅' },
    { label: 'Resolveu Problemas', emoji: '⚠️' },
    { label: 'Profissionalismo',   emoji: '🤝' },
    { label: 'Preço Justo',        emoji: '💸' },
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    // Em produção: usar o ID real do cliente do contrato
    // Aqui usamos o parties.client como fallback
    onFinish({
      score:      rating,
      tags:       selectedTags,
      comment,
      reviewedId: (contract as any)._clientUserId || contract.id, // ID do avaliado
    });
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => onFinish()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <div className="text-center flex-1 pr-10">
          <h1 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avaliar Contrato Finalizado</h1>
          <div className="text-lg font-black text-indigo-900 tracking-tighter">iTrust</div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-6">Avaliação do Prestador</h2>

          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-white shadow-md">
              <span className="text-3xl font-black text-indigo-300">
                {contract.parties.client.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-bold text-slate-900">{contract.parties.client}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Contratante</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 p-6 flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                  <Star className={cn('w-10 h-10 transition-all', star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                </button>
              ))}
            </div>
            <div className="font-bold text-slate-800 text-sm mt-1">{rating}/5</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">O que você mais gostou?</h3>
          <div className="grid grid-cols-2 gap-3 pb-4">
            {tags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => handleToggleTag(tag.label)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all',
                  selectedTags.includes(tag.label)
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200',
                )}
              >
                <span>{tag.emoji}</span>
                <span className="truncate">{tag.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva seu depoimento opcional..."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-700 h-32 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all resize-none shadow-inner"
          />
        </div>
      </main>

      <footer className="p-6 pt-2">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-indigo-100 text-xs uppercase tracking-widest flex items-center justify-center gap-3"
        >
          Concluir e Enviar Avaliação
        </button>
      </footer>
    </div>
  );
}
