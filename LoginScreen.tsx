import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Lock, Fingerprint } from 'lucide-react';
import { cn } from '../lib/utils';
import { AuthService } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await AuthService.signIn(email, password);
      onLogin();
    } catch (err: any) {
      setError('Acesso negado. Verifique suas credenciais de segurança.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-12 p-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-200">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-slate-950">iTrust</h1>
          <p className="text-slate-500 font-medium text-sm uppercase tracking-widest mt-1">Trust Protocol v2.4</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full space-y-6"
      >
        <div className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Segura</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl',
            isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-950 text-white shadow-slate-200 hover:bg-slate-800',
          )}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Lock className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              Entrar na Rede
              <ArrowRight className="w-5 h-5 text-indigo-400" />
            </>
          )}
        </button>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="h-px w-full bg-slate-100" />
          <div className="flex justify-between w-full">
            <button type="button" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Fingerprint className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Biometria</span>
            </button>
            <button
              type="button"
              onClick={() => (window as any).onNavigateToRegister()}
              className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Não tem conta? <br />
              <span className="text-xs">Criar Cadastro</span>
            </button>
          </div>
        </div>
      </motion.form>

      <div className="text-center pt-8">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Protegido por Criptografia de Ponta-a-Ponta<br />
          & Protocolos de Prova de Participação
        </p>
      </div>
    </div>
  );
}
