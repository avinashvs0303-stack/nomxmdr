import { SecurityPackage } from '../types';

export const MDR_SERVICE_PACKAGES: Record<
  SecurityPackage,
  {
    maturityLabel: string;
    inclusions: string[];
  }
> = {
  [SecurityPackage.CORE]: {
    maturityLabel: 'Level 2 – Managed Visibility',
    inclusions: [
      '24×7 SOC Monitoring',
      'EDR Coverage',
      'Automated Incident Triage',
      'Cyber Threat Intelligence Feeds',
      'Monthly Security Reporting',
    ],
  },

  [SecurityPackage.ADVANCE]: {
    maturityLabel: 'Level 4 – Proactive Defense',
    inclusions: [
      'Everything in Core',
      'XDR Coverage',
      'Proactive Threat Hunting',
      'Custom Detection Engineering',
      'Quarterly Business Review (QBR)',
    ],
  },

  [SecurityPackage.ELITE]: {
    maturityLabel: 'Level 5 – Full Optimized SOC',
    inclusions: [
      'Everything in Advanced',
      'SIEM Integration',
      'Dedicated Service Delivery Manager',
      'Advanced SOAR Automation',
      'Vulnerability Operations Center (VOC)',
    ],
  },
};
