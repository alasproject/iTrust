import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, User, Briefcase, ChevronLeft, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { AuthService, ProfileService } from '../lib/supabase';

interface RegisterScreenProps {
  onBack: () => void;
  onRegister: () => void;
}

export function RegisterScreen({ onBack, onRegister }: RegisterScreenProps) {
  const [role, setRole] = useState<'contractor' | 'client' | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Campos do formulário
  const [fullName, setFullName]   = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender]       = useState('');
  const [email, setEmail]         = useState('');
  const [cpfCnpj, setCpfCnpj]     = useState('');
  const [password, setPassword]   = useState('');

  const handleNext = async () => {
    setError('');
    if (step === 1 && role) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!email || !password || !fullName) {
        setError('Preencha todos os campos obrigatórios.');
        return;
      }

      setIsLoading(true);
      try {
        // 1. Cria o usuário no Supabase Auth
        await AuthService.signUp(email, password, fullName);

        // 2. Atualiza o perfil com os dados extras
        // O trigger handle_new_user já cria o profile; aqui fazemos update
        await ProfileService.updateProfile({
          full_name: fullName,
          birth_date: birthDate || undefined,
          gender: gender || undefined,
          cpf_cnpj: cpfCnpj || undefined,
          role: role || 'both',
        });

        onRegister();
      } catch (err: any) {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <header className="px-6 py-8 flex items-center gap-4">
        <button
          onClick={step === 1 ? onBack : () => setStep(1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Criar Conta iTrust</h1>
          <div className="flex gap-1 mt-1">
            <div className={cn('h-1 w-8 rounded-full transition-all', step === 1 ? 'bg-indigo-600' : 'bg-emerald-500')} />
            <div className={cn('h-1 w-8 rounded-full transition-all', step === 2 ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-100')} />
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 space-y-10 overflow-y-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Escolha seu Perfil</h2>
              <p className="text-slate-500 font-medium">Como você pretende utilizar a rede iTrust?</p>
            </div>
            <div className="space-y-4">
              {[
                { value: 'client', icon: Briefcase, title: 'Contratante', desc: 'Desejo contratar serviços e gerenciar pagamentos seguros.' },
                { value: 'contractor', icon: User, title: 'Prestador / Contratado', desc: 'Desejo oferecer serviços e garantir o recebimento via Escrow.' },
              ].map(({ value, icon: Icon, title, desc }) => (
                <button
                  key={value}
                  onClick={() => setRole(value as any)}
                  className={cn(
                    'w-full p-6 rounded-[2rem] border-2 text-left transition-all flex items-center gap-5',
                    role === value ? 'bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-50' : 'bg-white border-slate-100 hover:border-slate-200',
                  )}
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-colors', role === value ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400')}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn('font-bold text-lg', role === value ? 'text-indigo-900' : 'text-slate-900')}>{title}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
                  </div>
                  {role === value && <div className="bg-indigo-600 p-1 rounded-full text-white"><Check className="w-4 h-4" /></div>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Informações Básicas</h2>
              <p className="text-slate-500 font-medium">Sua identidade será verificada por KYC descentralizado.</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu Nome" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gênero</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner appearance-none">
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                    <option value="prefer_not_to_say">Prefiro não dizer</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Documento (CPF/CNPJ)</label>
                <input type="text" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} placeholder="000.000.000-00" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner" />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 space-y-4">
        <button
          onClick={handleNext}
          disabled={!role || isLoading}
          className={cn(
            'w-full py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl',
            !role ? 'bg-slate-100 text-slate-300 cursor-not-allowed' :
            isLoading ? 'bg-slate-900 text-slate-500' : 'bg-slate-950 text-white shadow-indigo-100 hover:bg-slate-800',
          )}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Shield className="w-5 h-5 text-indigo-400" />
            </motion.div>
          ) : (
            <>
              {step === 1 ? 'Seguir para Dados' : 'Concluir Cadastro'}
              <ArrowRight className="w-5 h-5 text-indigo-400" />
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-8">
          Ao criar sua conta, você aceita os termos do iTrust Protocol e a governança de rede.
        </p>
      </footer>
    </div>
  );
}
