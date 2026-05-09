import React, { useState } from 'react';
import { ShieldCheck, FileText, ListChecks, ChevronRight } from 'lucide-react';
import { Contract } from '../types';
import { type AcordoExtraido, acordoToContract } from '../lib/groq';

interface ContractEditorProps {
  initialData: Partial<Contract>;
  /** Dados extraídos pelo Groq — pré-preenchem o formulário */
  acordoIA?: AcordoExtraido;
  onApprove: (data: Contract) => void;
  onBack: () => void;
  userName?: string;
}

export function ContractEditor({
  initialData,
  acordoIA,
  onApprove,
  onBack,
  userName = 'Você',
}: ContractEditorProps) {
  // Mescla dados da IA com initialData (IA tem prioridade)
  const fromIA = acordoIA ? acordoToContract(acordoIA, userName) : {};

  const [data, setData] = useState<Contract>({
    id:       initialData.id || '',
    title:    fromIA.title    || initialData.title    || 'Contrato de Prestação de Serviços',
    parties: {
      contractor:      userName,
      contractorId:    initialData.parties?.contractorId    || '',
      contractorEmail: initialData.parties?.contractorEmail || '',
      client:          fromIA.parties?.client || initialData.parties?.client || '',
      clientId:        initialData.parties?.clientId    || '',
      clientEmail:     initialData.parties?.clientEmail || '',
    },
    value:      fromIA.value      || initialData.value      || 0,
    deadline:   fromIA.deadline   || initialData.deadline   || '',
    conditions: fromIA.conditions || initialData.conditions || [''],
    status:     'draft',
    createdAt:  initialData.createdAt || new Date().toISOString(),
  });

  const updateCondition = (idx: number, val: string) => {
    const next = [...data.conditions];
    next[idx] = val;
    setData({ ...data, conditions: next });
  };

  const addCondition = () =>
    setData({ ...data, conditions: [...data.conditions, ''] });

  const removeCondition = (idx: number) =>
    setData({ ...data, conditions: data.conditions.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-indigo-100 p-3 rounded-2xl">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inteligência Contratual</h1>
          <p className="text-slate-500 text-sm font-medium">
            {acordoIA ? '✨ Pré-preenchido pela IA · Revise antes de assinar' : 'Preencha os dados do contrato'}
          </p>
        </div>
      </div>

      {/* Badge IA */}
      {acordoIA && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-xs font-bold text-indigo-700">Extraído pelo Groq AI</p>
            <p className="text-[10px] text-indigo-500 font-medium">{acordoIA.resumo}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Estrutura do acordo */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            Estrutura do Acordo
          </div>

          {/* Título */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Título do Projeto
            </label>
            <input
              type="text"
              value={data.title}
              onChange={e => setData({ ...data, title: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            />
          </div>

          {/* Valor + Prazo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Valor Total
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  value={data.value || ''}
                  onChange={e => setData({ ...data, value: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Prazo Estimado
              </label>
              <input
                type="text"
                value={data.deadline}
                onChange={e => setData({ ...data, deadline: e.target.value })}
                placeholder="Ex: 15 dias úteis"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Partes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Contratado */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Contratado
              </label>
              <div className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 flex items-center">
                <span className="text-slate-600 font-bold text-sm">{data.parties.contractor}</span>
              </div>
              <input
                type="text"
                placeholder="CPF/CNPJ"
                value={data.parties.contractorId || ''}
                onChange={e => setData({ ...data, parties: { ...data.parties, contractorId: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={data.parties.contractorEmail || ''}
                onChange={e => setData({ ...data, parties: { ...data.parties, contractorEmail: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Contratante */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Contratante
              </label>
              <input
                type="text"
                value={data.parties.client}
                onChange={e => setData({ ...data, parties: { ...data.parties, client: e.target.value } })}
                placeholder="Nome do contratante"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
              />
              <input
                type="text"
                placeholder="CPF/CNPJ"
                value={data.parties.clientId || ''}
                onChange={e => setData({ ...data, parties: { ...data.parties, clientId: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={data.parties.clientEmail || ''}
                onChange={e => setData({ ...data, parties: { ...data.parties, clientEmail: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Condições & Entregáveis */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <ListChecks className="w-4 h-4" />
              Condições & Entregáveis
            </div>
            <button
              onClick={addCondition}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors"
            >
              + Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {data.conditions.map((condition, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 shrink-0">
                  {idx + 1}
                </div>
                <input
                  value={condition}
                  onChange={e => updateCondition(idx, e.target.value)}
                  placeholder="Descreva o entregável..."
                  className="flex-1 bg-transparent border-none p-0 text-sm font-medium text-slate-700 focus:ring-0 outline-none"
                />
                {data.conditions.length > 1 && (
                  <button
                    onClick={() => removeCondition(idx)}
                    className="text-slate-300 hover:text-red-400 transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Ações */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-4 rounded-2xl font-bold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
        >
          Cancelar
        </button>
        <button
          onClick={() => onApprove(data)}
          disabled={!data.title || !data.value || !data.parties.client}
          className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-100"
        >
          Aprovar & Seguir para Assinatura
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
