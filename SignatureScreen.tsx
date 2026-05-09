import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { PenTool, CheckCircle2, FileText, Lock, ShieldCheck } from 'lucide-react';
import { Contract } from '../types';

interface SignatureScreenProps {
  contract: Contract;
  onSign: () => void;
}

export function SignatureScreen({ contract, onSign }: SignatureScreenProps) {
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleSign = () => {
    setIsSigned(true);
    setTimeout(onSign, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Formalização Digital</h1>
        <p className="text-slate-500 font-medium">Assine para ativar a proteção de Escrow</p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-20 custom-scrollbar">
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-400 text-xs tracking-widest uppercase">Documento #ITR-{contract.id.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
              <Lock className="w-3 h-3" /> Criptografia iTrust 256-bit
            </div>
          </div>

          <article className="prose prose-slate max-w-none text-slate-600 pb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{contract.title}</h2>
            <p className="text-sm leading-relaxed mb-4">
              Este documento estabelece o acordo comercial entre:
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 space-y-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contratado</p>
                <p className="text-sm font-bold text-slate-800">{contract.parties.contractor}</p>
                <p className="text-xs text-slate-500">{contract.parties.contractorId} • {contract.parties.contractorEmail}</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contratante</p>
                <p className="text-sm font-bold text-slate-800">{contract.parties.client}</p>
                <p className="text-xs text-slate-500">{contract.parties.clientId} • {contract.parties.clientEmail}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Cláusula 1: Objeto</h3>
            <ul className="text-sm space-y-1 mb-4 list-disc pl-5">
              {contract.conditions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>

            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Cláusula 2: Valores e Pagamento</h3>
            <p className="text-sm leading-relaxed mb-4">
              O valor total deste acordo é de <strong>R$ {contract.value.toLocaleString('pt-BR')}</strong>. O pagamento deverá ser iniciado via serviço de Escrow da plataforma iTrust imediatamente após esta assinatura.
            </p>

            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Cláusula 3: Validade</h3>
            <p className="text-sm leading-relaxed">
              O prazo para entrega final é de {contract.deadline}. A liberação dos fundos ocorrerá mediante aprovação da entrega final neste aplicativo.
            </p>
          </article>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 pt-10 bg-gradient-to-t from-white via-white to-transparent">
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center space-y-4">
            <div className="flex justify-center">
              {isSigned ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500 p-3 rounded-full text-white shadow-lg shadow-emerald-100"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
              ) : (
                <button
                  onClick={handleSign}
                  className="w-full h-32 flex flex-col items-center justify-center gap-3 text-slate-400 font-medium hover:text-slate-600 hover:bg-slate-100/50 transition-all active:scale-95"
                >
                  <div className="bg-white p-4 rounded-full border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                    <PenTool className="w-8 h-8 text-indigo-400" />
                  </div>
                  Clique aqui para assinar digitalmente
                </button>
              )}
            </div>
            {isSigned && (
              <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest animate-pulse">
                Assinado Digitalmente por {contract.parties.contractor.split(' (')[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest py-2">
        <ShieldCheck className="w-4 h-4" /> Autenticado por Biometria e Chave Assimétrica
      </div>
    </div>
  );
}
