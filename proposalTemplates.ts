// src/proposalTemplates.ts

export interface ProposalTemplateMeta {
  title: string;
  sections: string[];
}

export const PROPOSAL_TEMPLATES_META: Record<string, ProposalTemplateMeta> = {
  defensive_pricing: {
    title: 'Guardian xMDR – Managed Detection & Response',
    sections: [
      'Executive Summary',
      'Solution Overview',
      'Scope of Services',
      'SOC Maturity Assessment',
      'Financial Investment',
      'Implementation Roadmap',
      'Strategic Add-ons'
    ]
  },

  exposure_management: {
    title: 'Exposure Management Services',
    sections: [
      'Overview',
      'Asset Coverage',
      'Risk Intelligence',
      'Pricing',
      'Onboarding'
    ]
  }
};
