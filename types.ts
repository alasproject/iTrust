export type ContractStatus = 'negotiation' | 'active' | 'completed' | 'draft';

export interface Contract {
  id: string;
  title: string;
  parties: {
    contractor: string;
    contractorId?: string;
    contractorEmail?: string;
    client: string;
    clientId?: string;
    clientEmail?: string;
  };
  value: number;
  deadline: string;
  conditions: string[];
  status: ContractStatus;
  createdAt: string;
}

export type AppStep =
  | 'login'
  | 'register'
  | 'search-id'
  | 'ranking'
  | 'ranking-requirements'
  | 'full-report'
  | 'dashboard'
  | 'voice-recording'
  | 'contract-generation'
  | 'signature'
  | 'escrow'
  | 'execution'
  | 'rating'
  | 'profile';
