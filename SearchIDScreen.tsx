import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, User, ArrowRight, X, Loader2 } from 'lucide-react';
import { ProfileService, type Profile } from '../lib/supabase';

interface SearchIDScreenProps {
  onSelect: (id: string, name: string) => void;
  onSkip: () => void;
}

export function SearchIDScreen({ onSelect }: SearchIDScreenProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (val: string) => {
    setQuery(val);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (val.length > 2) {
      setIsSearching(true);
      const t = setTimeout(async () => {
        try {
          const data = await ProfileService.searchProfiles(val);
          setResults(data);
        } catch (err) {
          console.error('Erro na busca:', err);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      setSearchTimeout(t);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Buscar Parceiros</h1>
          <p className="text-slate-500 font-medium">Localize por iTrust ID, Nome ou Especialidade.</p>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            {isSearching
              ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              : <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            }
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ID, Nome ou Provedor..."
            className="w-full bg-slate-50 border-none rounded-[2rem] p-5 pl-14 text-lg font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute inset-y-0 right-5 flex items-center"
            >
              <X className="w-5 h-5 text-slate-300 hover:text-slate-500" />
            </button>
          )}
        </div>

        <div className="pt-4">
          <AnimatePresence>
            {results.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Resultados Encontrados</h2>
                {results.map((res, i) => (
                  <motion.button
                    key={res.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelect(res.id, res.full_name)}
                    className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {res.avatar_url
                          ? <img src={res.avatar_url} alt={res.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          : <User className="w-6 h-6" />
                        }
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900">{res.full_name}</div>
                        <div className="text-xs font-mono text-slate-400">ID: {res.itrust_id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <div className="text-sm font-bold text-emerald-500">{res.trust_score}</div>
                        <div className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Score</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-500 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : query.length > 2 && !isSearching ? (
              <div className="text-center py-12 space-y-4">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-medium">Nenhum resultado para "{query}"</p>
              </div>
            ) : !query && (
              <div className="space-y-6">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Dica</h2>
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-400 shrink-0" />
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                    Digite o nome ou ID de um parceiro para iniciar um contrato. Você também pode pular esta etapa e criar um contrato depois.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
