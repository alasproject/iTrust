// ============================================================
// src/lib/supabase.ts
// Cliente e serviços Supabase para o iTrust
//
// Instalação:
//   npm install @supabase/supabase-js
//
// Crie o arquivo .env na raiz do projeto:
//   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
//   VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Contract, ContractStatus } from '../types';

// ─────────────────────────────────────────
// Cliente
// ─────────────────────────────────────────
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────
// Tipos internos do banco
// ─────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string;
  itrust_id: string;
  role: 'contractor' | 'client' | 'both';
  cpf_cnpj?: string;
  birth_date?: string;
  gender?: string;
  avatar_url?: string;
  bio?: string;
  specialty?: string;
  trust_score: number;
  level: number;
  is_verified: boolean;
  created_at: string;
}

export interface DBContract {
  id: string;
  itrust_ref: string;
  title: string;
  contractor_id: string;
  client_id: string;
  contractor_name?: string;
  client_name?: string;
  contractor_cpf?: string;
  client_cpf?: string;
  contractor_email?: string;
  client_email?: string;
  total_value: number;
  escrow_amount: number;
  platform_fee: number;
  deadline: string;
  conditions: string[];
  status: ContractStatus;
  voice_transcript?: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  signed_at?: string;
  completed_at?: string;
}

export interface Rating {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewed_id: string;
  score: number;
  tags: string[];
  comment?: string;
  created_at: string;
}

export interface RankingEntry {
  id: string;
  full_name: string;
  itrust_id: string;
  avatar_url?: string;
  specialty?: string;
  trust_score: number;
  level: number;
  is_verified: boolean;
  total_ratings: number;
  avg_rating: number;
  total_contracts: number;
}

// ─────────────────────────────────────────
// Conversor: DBContract → Contract (types.ts)
// ─────────────────────────────────────────
export function dbToContract(db: DBContract): Contract {
  return {
    id: db.id,
    title: db.title,
    parties: {
      contractor:      db.contractor_name || 'Você',
      contractorId:    db.contractor_cpf,
      contractorEmail: db.contractor_email,
      client:          db.client_name    || 'Cliente',
      clientId:        db.client_cpf,
      clientEmail:     db.client_email,
    },
    value:      db.total_value,
    deadline:   db.deadline,
    conditions: db.conditions || [],
    status:     db.status,
    createdAt:  db.created_at,
  };
}

// ─────────────────────────────────────────
// AUTH — Autenticação
// ─────────────────────────────────────────
export const AuthService = {

  /** Login com e-mail e senha */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  /** Cadastro com e-mail e senha */
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  /** Logout */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /** Usuário atual */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /** Sessão atual */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /** Observador de mudança de sessão */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ─────────────────────────────────────────
// PROFILES — Perfis de usuário
// ─────────────────────────────────────────
export const ProfileService = {

  /** Busca o perfil do usuário autenticado */
  async getMyProfile(): Promise<Profile> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return data as Profile;
  },

  /** Busca perfil por ID */
  async getProfileById(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Profile;
  },

  /** Atualiza o perfil do usuário autenticado */
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Profile;
  },

  /** Busca perfis pelo nome ou iTrust ID (para SearchIDScreen) */
  async searchProfiles(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,itrust_id.ilike.%${query}%`)
      .limit(10);

    if (error) throw new Error(error.message);
    return (data || []) as Profile[];
  },
};

// ─────────────────────────────────────────
// CONTRACTS — Contratos
// ─────────────────────────────────────────
export const ContractService = {

  /** Lista todos os contratos do usuário autenticado */
  async getMyContracts(): Promise<Contract[]> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .or(`contractor_id.eq.${user.id},client_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(dbToContract);
  },

  /** Busca um contrato por ID */
  async getContractById(id: string): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return dbToContract(data as DBContract);
  },

  /** Cria um novo contrato (gerado por voz ou manualmente) */
  async createContract(payload: {
    title: string;
    clientId: string;
    totalValue: number;
    deadline: string;
    conditions: string[];
    voiceTranscript?: string;
    aiGenerated?: boolean;
    contractorName?: string;
    clientName?: string;
    contractorCpf?: string;
    clientCpf?: string;
    contractorEmail?: string;
    clientEmail?: string;
  }): Promise<Contract> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        title:             payload.title,
        contractor_id:     user.id,
        client_id:         payload.clientId,
        total_value:       payload.totalValue,
        deadline:          payload.deadline,
        conditions:        payload.conditions,
        voice_transcript:  payload.voiceTranscript,
        ai_generated:      payload.aiGenerated ?? false,
        contractor_name:   payload.contractorName,
        client_name:       payload.clientName,
        contractor_cpf:    payload.contractorCpf,
        client_cpf:        payload.clientCpf,
        contractor_email:  payload.contractorEmail,
        client_email:      payload.clientEmail,
        status:            'draft',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return dbToContract(data as DBContract);
  },

  /** Atualiza um contrato (ContractEditor) */
  async updateContract(id: string, updates: Partial<DBContract>): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return dbToContract(data as DBContract);
  },

  /** Marca contrato como assinado */
  async signContract(id: string): Promise<Contract> {
    return ContractService.updateContract(id, {
      status: 'signed',
      signed_at: new Date().toISOString(),
    });
  },

  /** Marca escrow como provisionado e contrato como ativo */
  async activateContract(id: string): Promise<Contract> {
    return ContractService.updateContract(id, { status: 'active' });
  },

  /** Finaliza o contrato e libera pagamento */
  async completeContract(id: string): Promise<Contract> {
    return ContractService.updateContract(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },
};

// ─────────────────────────────────────────
// ESCROW — Transações de Escrow
// ─────────────────────────────────────────
export const EscrowService = {

  /** Cria uma transação de escrow ao iniciar contrato */
  async createEscrow(contractId: string, payerId: string, receiverId: string, amount: number) {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .insert({
        contract_id: contractId,
        payer_id:    payerId,
        receiver_id: receiverId,
        amount,
        status:      'locked',
        locked_at:   new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /** Libera o pagamento ao finalizar contrato */
  async releaseEscrow(contractId: string) {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .update({ status: 'released', released_at: new Date().toISOString() })
      .eq('contract_id', contractId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

// ─────────────────────────────────────────
// RATINGS — Avaliações
// ─────────────────────────────────────────
export const RatingService = {

  /** Envia uma avaliação após conclusão do contrato */
  async submitRating(payload: {
    contractId: string;
    reviewedId: string;
    score: number;
    tags: string[];
    comment?: string;
  }) {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('ratings')
      .insert({
        contract_id:  payload.contractId,
        reviewer_id:  user.id,
        reviewed_id:  payload.reviewedId,
        score:        payload.score,
        tags:         payload.tags,
        comment:      payload.comment,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Rating;
  },

  /** Busca avaliações de um perfil */
  async getRatingsForProfile(profileId: string): Promise<Rating[]> {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('reviewed_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Rating[];
  },
};

// ─────────────────────────────────────────
// RANKING — Ranking público
// ─────────────────────────────────────────
export const RankingService = {

  /** Retorna o ranking global (usa a view ranking_view) */
  async getGlobalRanking(specialty?: string, limit = 20): Promise<RankingEntry[]> {
    let query = supabase
      .from('ranking_view')
      .select('*')
      .order('trust_score', { ascending: false })
      .limit(limit);

    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as RankingEntry[];
  },
};

// ─────────────────────────────────────────
// MILESTONES — Linha do tempo do contrato
// ─────────────────────────────────────────
export const MilestoneService = {

  async getMilestones(contractId: string) {
    const { data, error } = await supabase
      .from('contract_milestones')
      .select('*')
      .eq('contract_id', contractId)
      .order('sort_order');

    if (error) throw new Error(error.message);
    return data || [];
  },

  async updateMilestoneStatus(id: string, status: 'pending' | 'in_progress' | 'done') {
    const { data, error } = await supabase
      .from('contract_milestones')
      .update({
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

// ─────────────────────────────────────────
// FILES — Arquivos e entregas
// ─────────────────────────────────────────
export const FileService = {

  /** Upload de arquivo para o Storage do Supabase */
  async uploadFile(contractId: string, file: File) {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const path = `contracts/${contractId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('contract-files')
      .upload(path, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('contract-files')
      .getPublicUrl(path);

    const { data, error } = await supabase
      .from('contract_files')
      .insert({
        contract_id:  contractId,
        uploaded_by:  user.id,
        file_name:    file.name,
        file_url:     publicUrl,
        file_size:    file.size,
        mime_type:    file.type,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getContractFiles(contractId: string) {
    const { data, error } = await supabase
      .from('contract_files')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },
};
