import React from 'react';
import { motion } from 'motion/react';
import { Plus, ListChecks, Activity, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Contract } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  contracts: Contract[];
  isLoading?: boolean;
  onNewContract: () => void;
  onSelectContract: (contract: Contract) => void;
}

export function Dashboard({ contracts, isLoading = false, onNewContract, onSelectContract }: DashboardProps) {
  const stats = [
    { label: 'Em Negociação', value: contracts.filter(c => c.status === 'negotiation' || c.status === 'draft').length, icon: ListChecks, color: 'text-amber-500' },
    { label: 'Ativos',        value: contracts.filter(c => c.status === 'active').length,    icon: Activity,     color: 'text-indigo-500' },
    { label: 'Concluídos',    value: contracts.filter(c => c.status === 'completed').length, icon: CheckCircle,  color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meus Contratos</h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-semibold tracking-wider">Gestão de confiança autenticada</p>
        </div>
        <button
          onClick={onNewContract}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Contrato
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg bg-slate-50', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 truncate">{stat.label}</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Recentes</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Você ainda não tem contratos.</p>
            <button onClick={onNewContract} className="mt-4 text-indigo-600 font-semibold hover:underline">
              Criar meu primeiro contrato
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract, i) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectContract(contract)}
                className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white',
                    contract.status === 'active'    ? 'bg-indigo-500' :
                    contract.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500',
                  )}>
                    {contract.status === 'active'    ? <Activity className="w-6 h-6" /> :
                     contract.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <ListChecks className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{contract.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">{contract.parties.client}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">R$ {contract.value.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    contract.status === 'active'    ? 'bg-indigo-50 text-indigo-600' :
                    contract.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
                  )}>
                    {contract.status === 'active' ? 'Ativo' : contract.status === 'completed' ? 'Concluído' : 'Processando'}
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
