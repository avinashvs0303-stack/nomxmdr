
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'super_admin';


export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export enum SecurityPackage {
  CORE = 'Core',
  ADVANCE = 'Advance',
  ELITE = 'Elite'
}

export interface PricingProposal {
  id: string;
  user_id: string;
  calculator_type: 'defensive' | 'solutions' | 'exposure';
  status: 'draft' | 'pending_approval' | 'approved';
  tags?: string[];
  data: {
    calculator: string;
    client?: {
      name?: string | null;
    };
    maturity?: 'core' | 'advanced' | 'elite';
    inputs?: Record<string, any>;
    addons?: any[];
    pricing?: {
      monthly?: number;
      yearly?: number;
      total_contract?: number;
    };
    onboarding?: Record<string, any>;
  };
  created_at: string;
  updated_at: string;
}



export interface NewsArticle {
  title: string;
  date: string;
  summary: string;
  source_url: string;   // ✅ MATCHES DATABASE
  severity: 'low' | 'medium' | 'high' | 'critical';
}

