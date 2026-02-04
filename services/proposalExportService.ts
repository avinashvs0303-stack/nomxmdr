/**
 * Proposal Export Service
 * Generates professional Word documents (.docx) from proposal data
 * 
 * Install: npm install docx file-saver
 * 
 * Usage:
 *   import { exportProposalToWord, exportProposalToPdf } from './proposalExportService';
 *   await exportProposalToWord(proposalData);
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak,
  PageNumber,
  LevelFormat,
} from 'docx';
import saveAs from 'file-saver';

/* ======================
   TYPES
====================== */

export interface ProposalClient {
  name: string;
}

export interface ProposalInputs {
  endpoints?: number;
  ndrIps?: number;
  siemTier?: string;
  contractTerm?: number;
}

export interface ProposalPricing {
  baseMonthly?: number;
  monthly?: number;
  yearly?: number;
  oneTime?: number;
  termDiscount?: number;
  discount?: number;
}

export interface ProposalAddon {
  id: string;
  name?: string;
  days?: number;
  description?: string;
}

export interface ProposalServicePackage {
  tier?: string;
  maturity_label?: string;
  inclusions?: string[];
}

export interface ProposalLineItem {
  category: string;
  description: string | string[];
  metric?: string;
  unit_price?: number;
  extended_monthly?: number;
  extended_onetime?: number;
  discount_percent?: number;
  billing?: string;
}

export interface ProposalOnboarding {
  steps?: string[];
  fee?: number;
}

export interface MaturityDomain {
  domain: string;
  rating: string;
  score: number;
  maxScore: number;
  impact: string;
}

export interface ProposalMaturitySummary {
  level?: string;
  tier?: string;
  domains?: MaturityDomain[];
}

export interface ProposalData {
  calculator?: string;
  client?: ProposalClient;
  inputs?: ProposalInputs;
  addons?: ProposalAddon[];
  pricing?: ProposalPricing;
  maturity?: string;
  maturity_summary?: ProposalMaturitySummary;
  line_items?: ProposalLineItem[];
  service_package?: ProposalServicePackage;
  onboarding?: ProposalOnboarding;
}

export interface ExportOptions {
  companyName?: string;
  companyTagline?: string;
  proposalDate?: Date;
}

/* ======================
   CONSTANTS
====================== */

const COLORS = {
  primary: '1E3A8A',      // Blue-900
  secondary: '3B82F6',    // Blue-500
  accent: '10B981',       // Emerald-500
  dark: '0F172A',         // Slate-900
  medium: '64748B',       // Slate-500
  light: 'F1F5F9',        // Slate-100
  white: 'FFFFFF',
  headerBg: 'E0E7FF',     // Blue-100
};

// Page dimensions in DXA (1440 = 1 inch)
const PAGE = {
  width: 12240,   // 8.5 inches (Letter)
  height: 15840,  // 11 inches
  margin: 1440,   // 1 inch margins
  contentWidth: 9360, // 6.5 inches
};

// Feature inclusion status by tier
const FEATURE_MATRIX: Record<string, Record<string, 'Included' | 'Not Included'>> = {
  CORE: {
    '24x7 SOC in The Netherlands': 'Included',
    'Local Language Support': 'Included',
    'Security Tech Integration': 'Included',
    'Automated Incident Triage': 'Included',
    'SOAR Playbook Development': 'Included',
    'Root Cause Analysis (P1/P2)': 'Not Included',
    'Proactive Threat Hunting': 'Not Included',
    'QBR Meetings': 'Not Included',
    'Custom SIEM Use-Cases': 'Not Included',
  },
  ADVANCE: {
    '24x7 SOC in The Netherlands': 'Included',
    'Local Language Support': 'Included',
    'Security Tech Integration': 'Included',
    'Automated Incident Triage': 'Included',
    'SOAR Playbook Development': 'Included',
    'Root Cause Analysis (P1/P2)': 'Included',
    'Proactive Threat Hunting': 'Included',
    'QBR Meetings': 'Not Included',
    'Custom SIEM Use-Cases': 'Not Included',
  },
  ELITE: {
    '24x7 SOC in The Netherlands': 'Included',
    'Local Language Support': 'Included',
    'Security Tech Integration': 'Included',
    'Automated Incident Triage': 'Included',
    'SOAR Playbook Development': 'Included',
    'Root Cause Analysis (P1/P2)': 'Included',
    'Proactive Threat Hunting': 'Included',
    'QBR Meetings': 'Included',
    'Custom SIEM Use-Cases': 'Included',
  },
};

// Default maturity domains for SOC assessment
const DEFAULT_MATURITY_DOMAINS: Record<string, MaturityDomain[]> = {
  CORE: [
    { domain: 'Detection', rating: 'Basic', score: 30, maxScore: 100, impact: 'Capability to identify security threats across endpoints and networks.' },
    { domain: 'Response', rating: 'Basic', score: 20, maxScore: 100, impact: 'Speed and effectiveness of containment and remediation actions.' },
    { domain: 'Visibility', rating: 'Developing', score: 35, maxScore: 100, impact: 'Depth of insight into IT assets, users, and traffic flows.' },
    { domain: 'Automation', rating: 'Developing', score: 40, maxScore: 100, impact: 'Level of automated triage and playbook execution.' },
    { domain: 'Intelligence', rating: 'Basic', score: 20, maxScore: 100, impact: 'Integration of external threat feeds and proactive hunting.' },
    { domain: 'Governance', rating: 'Basic', score: 20, maxScore: 100, impact: 'Reporting, compliance alignment, and strategic review.' },
  ],
  ADVANCE: [
    { domain: 'Detection', rating: 'Proficient', score: 60, maxScore: 100, impact: 'Capability to identify security threats across endpoints and networks.' },
    { domain: 'Response', rating: 'Proficient', score: 55, maxScore: 100, impact: 'Speed and effectiveness of containment and remediation actions.' },
    { domain: 'Visibility', rating: 'Proficient', score: 65, maxScore: 100, impact: 'Depth of insight into IT assets, users, and traffic flows.' },
    { domain: 'Automation', rating: 'Proficient', score: 60, maxScore: 100, impact: 'Level of automated triage and playbook execution.' },
    { domain: 'Intelligence', rating: 'Developing', score: 45, maxScore: 100, impact: 'Integration of external threat feeds and proactive hunting.' },
    { domain: 'Governance', rating: 'Developing', score: 40, maxScore: 100, impact: 'Reporting, compliance alignment, and strategic review.' },
  ],
  ELITE: [
    { domain: 'Detection', rating: 'Advanced', score: 85, maxScore: 100, impact: 'Capability to identify security threats across endpoints and networks.' },
    { domain: 'Response', rating: 'Advanced', score: 80, maxScore: 100, impact: 'Speed and effectiveness of containment and remediation actions.' },
    { domain: 'Visibility', rating: 'Advanced', score: 85, maxScore: 100, impact: 'Depth of insight into IT assets, users, and traffic flows.' },
    { domain: 'Automation', rating: 'Advanced', score: 80, maxScore: 100, impact: 'Level of automated triage and playbook execution.' },
    { domain: 'Intelligence', rating: 'Proficient', score: 70, maxScore: 100, impact: 'Integration of external threat feeds and proactive hunting.' },
    { domain: 'Governance', rating: 'Proficient', score: 65, maxScore: 100, impact: 'Reporting, compliance alignment, and strategic review.' },
  ],
};

// Add-on descriptions for detailed section
const ADDON_DETAILS: Record<string, { title: string; work: string[]; value: string[] }> = {
  purple_team: {
    title: 'Purple Teaming',
    work: [
      'Attack Simulation: Realistic adversary behaviors (TTPs) deployed in your live environment.',
      'Controlled Execution: Specific tests designed to trigger (or evade) your detection rules.',
      'Real-time Collaboration: Red Team communicates directly with SOC analysts during the exercise.',
    ],
    value: [
      'Validated Defenses: Concrete proof that your tools and rules actually detect specific threats.',
      'Reduced Noise: Opportunities to tune logic that fires falsely or not at all.',
      'Team Training: Valuable hands-on experience for your internal/joint teams under fire.',
    ],
  },
  mail_phish: {
    title: 'Phishing Campaign',
    work: [
      'Design of custom social engineering campaigns tailored to your industry.',
      'Simulation of sophisticated spear-phishing attacks.',
      'Detailed reporting on user interaction and click rates.',
    ],
    value: [
      'Measurable user awareness metrics.',
      'Safe testing environment for employees to learn.',
      'Behavioral change through targeted education.',
    ],
  },
  vulnerability: {
    title: 'Vulnerability Assessment',
    work: [
      'Continuous vulnerability scanning across your infrastructure.',
      'Risk-based prioritization of findings.',
      'Detailed remediation guidance and tracking.',
    ],
    value: [
      'Proactive identification of security weaknesses.',
      'Reduced attack surface through systematic patching.',
      'Compliance readiness with documented assessments.',
    ],
  },
  pen_testing: {
    title: 'Penetration Testing',
    work: [
      'Manual testing by certified security professionals.',
      'Exploitation of discovered vulnerabilities.',
      'Comprehensive report with proof-of-concept demonstrations.',
    ],
    value: [
      'Real-world validation of security controls.',
      'Executive-ready risk reporting.',
      'Actionable remediation roadmap.',
    ],
  },
};

/* ======================
   HELPER FUNCTIONS
====================== */

const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '€0';
  return `€${Math.round(amount).toLocaleString()}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const normalizeTier = (tier: string | undefined): string => {
  if (!tier) return 'CORE';
  const upper = tier.toUpperCase();
  if (upper === 'CORE' || upper === 'ADVANCE' || upper === 'ELITE') return upper;
  return 'CORE';
};

const getBorderStyle = (color: string = COLORS.light) => ({
  style: BorderStyle.SINGLE,
  size: 1,
  color,
});

const getTableBorders = (color: string = COLORS.light) => ({
  top: getBorderStyle(color),
  bottom: getBorderStyle(color),
  left: getBorderStyle(color),
  right: getBorderStyle(color),
});

/* ======================
   DOCUMENT SECTIONS
====================== */

/**
 * Creates the cover page section
 */
function createCoverPage(
  data: ProposalData,
  options: ExportOptions
): Paragraph[] {
  const companyName = options.companyName || 'CompanyX';
  const clientName = data.client?.name || '[Customer Name]';
  const proposalDate = formatDate(options.proposalDate || new Date());
  const tierLabel = data.service_package?.maturity_label || 'Guardian xMDR';

  return [
    // Spacer
    new Paragraph({ spacing: { before: 2400 } }),

    // Company Name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${companyName} ${tierLabel}`,
          bold: true,
          size: 56,
          color: COLORS.primary,
          font: 'Arial',
        }),
      ],
    }),

    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: 'Security Operations Proposal',
          size: 32,
          color: COLORS.medium,
          font: 'Arial',
        }),
      ],
    }),

    // Spacer
    new Paragraph({ spacing: { before: 1200 } }),

    // Prepared for
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Prepared for: ',
          bold: true,
          size: 24,
          font: 'Arial',
        }),
        new TextRun({
          text: clientName,
          size: 24,
          font: 'Arial',
        }),
      ],
    }),

    // Date
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: 'Date: ',
          bold: true,
          size: 24,
          font: 'Arial',
        }),
        new TextRun({
          text: proposalDate,
          size: 24,
          font: 'Arial',
        }),
      ],
    }),

    // Spacer
    new Paragraph({ spacing: { before: 2400 } }),

    // Confidentiality notice
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${companyName} Netherlands B.V. | Confidential`,
          size: 20,
          color: COLORS.medium,
          font: 'Arial',
        }),
      ],
    }),

    // Page break
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

/**
 * Creates the Executive Summary section
 */
function createExecutiveSummary(
  data: ProposalData,
  options: ExportOptions
): Paragraph[] {
  const companyName = options.companyName || 'CompanyX';
  const tier = normalizeTier(data.maturity || data.service_package?.tier);
  const tierLabel = tier.charAt(0) + tier.slice(1).toLowerCase();

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '1. Executive Summary', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: `In an era where cyber threats are becoming increasingly sophisticated and frequent, `,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: 'your organization',
          bold: true,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: ` requires a security partner that offers more than just alerts. ${companyName} is pleased to present this proposal for `,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: 'Guardian xMDR',
          bold: true,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: ', a comprehensive Managed Detection and Response service designed to provide 24x7 visibility, rapid containment, and strategic maturity growth.',
          font: 'Arial',
          size: 22,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `This proposal outlines a tailored solution based on the `,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: tierLabel,
          bold: true,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: ` service tier. By leveraging our certified Security Operations Center (SOC) in The Netherlands, we aim to extend your team's capabilities, ensuring that threats are detected and neutralized before they impact business continuity.`,
          font: 'Arial',
          size: 22,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Our approach combines market-leading technology with human expertise. From automated incident triage to proactive threat hunting, the ${companyName} Guardian platform provides the peace of mind needed to focus on your core business objectives.`,
          font: 'Arial',
          size: 22,
        }),
      ],
    }),
  ];
}

/**
 * Creates the Solution Overview section
 */
function createSolutionOverview(options: ExportOptions): Paragraph[] {
  const companyName = options.companyName || 'CompanyX';

  const pillars = [
    { title: '24x7 Detection & Response', desc: 'Eyes-on-screen monitoring from our certified SOC in The Netherlands.' },
    { title: 'Advanced Analytics', desc: 'Leveraging AI and Machine Learning to identify anomalies in user behavior and network traffic.' },
    { title: 'Automated Response (SOAR)', desc: 'Rapid containment of threats to minimize business impact.' },
    { title: 'Threat Intelligence', desc: 'Proactive hunting using global threat feeds and local insights.' },
  ];

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '2. Solution Overview', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: `${companyName} Guardian xMDR`,
          bold: true,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: ' (Extended Managed Detection and Response) is a modular security operations service designed to detect, investigate, and respond to threats across your IT landscape.',
          font: 'Arial',
          size: 22,
        }),
      ],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Key Service Pillars:', bold: true })],
    }),

    ...pillars.map(pillar =>
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: `${pillar.title}: `,
            bold: true,
            font: 'Arial',
            size: 22,
          }),
          new TextRun({
            text: pillar.desc,
            font: 'Arial',
            size: 22,
          }),
        ],
      })
    ),

    new Paragraph({ spacing: { after: 400 } }),
  ];
}

/**
 * Creates the Scope of Services section with tables
 */
function createScopeOfServices(data: ProposalData): (Paragraph | Table)[] {
  const tier = normalizeTier(data.maturity || data.service_package?.tier);
  const tierLabel = tier.charAt(0) + tier.slice(1).toLowerCase();
  const inputs = data.inputs || {};

  // Environment scope data
  const scopeData = [
    { metric: 'Identities / Endpoints', qty: inputs.endpoints ?? 500, desc: 'Users or devices protected by EDR/ITDR.' },
    { metric: 'NDR Sensors', qty: inputs.ndrIps ?? 0, desc: 'Network detection sensors (IPs).' },
    { metric: 'SIEM Ingestion', qty: inputs.siemTier === 'none' ? '0 GB/Day' : inputs.siemTier || '0 GB/Day', desc: 'Log data volume analyzed for threats.' },
  ];

  // Feature matrix
  const features = FEATURE_MATRIX[tier] || FEATURE_MATRIX.CORE;

  // Column widths for scope table
  const scopeColWidths = [2500, 1800, 5060];

  // Column widths for feature table
  const featureColWidths = [6500, 2860];

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '3. Scope of Services', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: `This proposal is based on the `,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: tierLabel,
          bold: true,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: ' service tier.',
          font: 'Arial',
          size: 22,
        }),
      ],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '3.1 Environment Scope', bold: true })],
    }),

    // Scope Table
    new Table({
      width: { size: PAGE.contentWidth, type: WidthType.DXA },
      columnWidths: scopeColWidths,
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: scopeColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Metric', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: scopeColWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Quantity', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: scopeColWidths[2], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Description', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        // Data rows
        ...scopeData.map(row =>
          new TableRow({
            children: [
              new TableCell({
                borders: getTableBorders(),
                width: { size: scopeColWidths[0], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.metric, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: scopeColWidths[1], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(row.qty), font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: scopeColWidths[2], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.desc, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
            ],
          })
        ),
      ],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
      children: [new TextRun({ text: `3.2 Feature Inclusion (${tierLabel})`, bold: true })],
    }),

    // Feature Table
    new Table({
      width: { size: PAGE.contentWidth, type: WidthType.DXA },
      columnWidths: featureColWidths,
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: featureColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Feature', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: featureColWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Status', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        // Feature rows
        ...Object.entries(features).map(([feature, status]) =>
          new TableRow({
            children: [
              new TableCell({
                borders: getTableBorders(),
                width: { size: featureColWidths[0], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: feature, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: featureColWidths[1], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: status,
                        font: 'Arial',
                        size: 20,
                        color: status === 'Included' ? '059669' : COLORS.medium,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        ),
      ],
    }),

    new Paragraph({ spacing: { after: 400 } }),
  ];
}

/**
 * Creates the SOC Maturity Level section
 */
function createMaturitySection(data: ProposalData): (Paragraph | Table)[] {
  const tier = normalizeTier(data.maturity || data.service_package?.tier);
  const tierLabel = tier.charAt(0) + tier.slice(1).toLowerCase();
  const domains = data.maturity_summary?.domains || DEFAULT_MATURITY_DOMAINS[tier] || DEFAULT_MATURITY_DOMAINS.CORE;

  const colWidths = [1800, 2200, 1000, 4360];

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '4. Estimated SOC Maturity Level', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: `Based on the selected service tier (`,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: tierLabel,
          bold: true,
          font: 'Arial',
          size: 22,
        }),
        new TextRun({
          text: '), we project the following maturity levels across key security domains.',
          font: 'Arial',
          size: 22,
        }),
      ],
    }),

    // Maturity Table
    new Table({
      width: { size: PAGE.contentWidth, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: colWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Domain', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: colWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Maturity Rating', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: colWidths[2], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Score', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: colWidths[3], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Impact', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        // Domain rows
        ...domains.map(domain =>
          new TableRow({
            children: [
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[0], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: domain.domain, bold: true, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[1], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: domain.rating, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[2], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${domain.score}/${domain.maxScore}`,
                        bold: true,
                        font: 'Arial',
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[3], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: domain.impact, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
            ],
          })
        ),
      ],
    }),

    new Paragraph({ spacing: { after: 400 } }),
  ];
}

/**
 * Creates the Financial Investment section
 */
function createFinancialSection(data: ProposalData): (Paragraph | Table)[] {
  const pricing = data.pricing || {};
  const inputs = data.inputs || {};
  const tier = normalizeTier(data.maturity || data.service_package?.tier);
  const tierLabel = tier.charAt(0) + tier.slice(1).toLowerCase();
  const addons = data.addons || [];

  const contractTerm = inputs.contractTerm || 12;
  const discountPct = pricing.termDiscount || pricing.discount || 0;

  // One-time items
  const oneTimeItems: { item: string; cost: number }[] = [
    { item: 'Service Onboarding & Setup', cost: data.onboarding?.fee || 10000 },
  ];

  // Add addon one-time costs
  addons.forEach(addon => {
    const days = addon.days || 1;
    const name = addon.name || ADDON_DETAILS[addon.id]?.title || addon.id;
    oneTimeItems.push({ item: `Add-on: ${name} (${days}x)`, cost: days * 1250 });
  });

  const totalOneTime = oneTimeItems.reduce((sum, item) => sum + item.cost, 0);
  const totalContractValue = (pricing.monthly || 0) * contractTerm + totalOneTime;

  const termColWidths = [5000, 4360];
  const pricingColWidths = [5000, 2500, 1860];
  const oneTimeColWidths = [7000, 2360];

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '5. Financial Investment', bold: true })],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200 },
      children: [new TextRun({ text: '5.1 Commercial Terms', bold: true })],
    }),

    // Commercial Terms Table
    new Table({
      width: { size: PAGE.contentWidth, type: WidthType.DXA },
      columnWidths: termColWidths,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: termColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Contract Duration', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: termColWidths[1], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `${contractTerm} Months`, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: termColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Billing Frequency', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: termColWidths[1], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Monthly', font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: termColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Applied Discount', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: termColWidths[1], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `${Math.round(discountPct * 100)}%`, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
      children: [new TextRun({ text: '5.2 Pricing Breakdown', bold: true })],
    }),

    // Pricing Breakdown Table
    new Table({
      width: { size: PAGE.contentWidth, type: WidthType.DXA },
      columnWidths: pricingColWidths,
      rows: [
        // Header
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Item', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Type', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[2], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Cost', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        // MDR Service row
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[0], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Guardian xMDR (${tierLabel})`, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[1], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Monthly Recurring', font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[2], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(pricing.monthly), font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        // Total Monthly row
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Total Monthly Recurring (Net)', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [] })],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: pricingColWidths[2], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(pricing.monthly), bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
      children: [new TextRun({ text: '5.3 One-Time Investment', bold: true })],
    }),

    // One-Time Table
    new Table({
      width: { size: PAGE.contentWidth, type: WidthType.DXA },
      columnWidths: oneTimeColWidths,
      rows: [
        // Header
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: oneTimeColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Item', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: oneTimeColWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Cost', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
        // One-time item rows
        ...oneTimeItems.map(item =>
          new TableRow({
            children: [
              new TableCell({
                borders: getTableBorders(),
                width: { size: oneTimeColWidths[0], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: item.item, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: oneTimeColWidths[1], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: formatCurrency(item.cost), font: 'Arial', size: 20 })],
                  }),
                ],
              }),
            ],
          })
        ),
        // Total row
        new TableRow({
          children: [
            new TableCell({
              borders: getTableBorders(),
              width: { size: oneTimeColWidths[0], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Total One-Time Fees', bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
            new TableCell({
              borders: getTableBorders(),
              width: { size: oneTimeColWidths[1], type: WidthType.DXA },
              shading: { fill: COLORS.light, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(totalOneTime), bold: true, font: 'Arial', size: 20 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
      children: [new TextRun({ text: '5.4 Total Contract Value', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 400 },
      children: [
        new TextRun({
          text: formatCurrency(totalContractValue),
          bold: true,
          size: 32,
          font: 'Arial',
        }),
        new TextRun({
          text: ' (excl. VAT)',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
  ];
}

/**
 * Creates the Implementation Roadmap section
 */
function createImplementationRoadmap(options: ExportOptions): Paragraph[] {
  const companyName = options.companyName || 'CompanyX';

  const steps = [
    { num: '1', title: 'Kick-off & Discovery', desc: 'Scope validation, access provisioning, and stakeholder alignment to ensure a smooth start.' },
    { num: '2', title: 'Technical Integration', desc: 'Deployment of collectors, connecting EDR agents, SIEM log shippers, and network sensors.' },
    { num: '3', title: 'Tuning & Baselining', desc: "Adjusting detection rules to the customer's specific environment to reduce false positives and establish normalcy." },
    { num: '4', title: 'Validation (Purple Teaming)', desc: 'Simulating real-world attacks to verify detection capabilities and response playbooks.' },
    { num: '5', title: 'Go Live', desc: 'Official handover to 24x7 SOC operations with continuous monitoring active.' },
  ];

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '6. Implementation Roadmap', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: `${companyName} employs a structured onboarding methodology to ensure seamless integration and rapid time-to-value.`,
          font: 'Arial',
          size: 22,
        }),
      ],
    }),

    ...steps.flatMap(step => [
      new Paragraph({
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: `${step.num}. ${step.title}`,
            bold: true,
            font: 'Arial',
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        indent: { left: 360 },
        children: [
          new TextRun({
            text: step.desc,
            font: 'Arial',
            size: 22,
          }),
        ],
      }),
    ]),

    new Paragraph({ spacing: { after: 400 } }),
  ];
}

/**
 * Creates the Strategic Add-ons Detail section
 */
function createAddonsDetail(data: ProposalData): (Paragraph | Table)[] {
  const addons = data.addons || [];

  if (addons.length === 0) {
    return [];
  }

  const elements: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: '7. Strategic Add-ons Detail', bold: true })],
    }),

    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'The following optional modules have been selected to enhance the scope of the service:',
          font: 'Arial',
          size: 22,
        }),
      ],
    }),
  ];

  const colWidths = [4680, 4680];

  addons.forEach(addon => {
    const details = ADDON_DETAILS[addon.id];
    if (!details) return;

    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300 },
        children: [new TextRun({ text: details.title, bold: true })],
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: addon.name || `Professional services (${addon.days || 1} day${(addon.days || 1) > 1 ? 's' : ''})`,
            font: 'Arial',
            size: 22,
            italics: true,
          }),
        ],
      }),

      new Table({
        width: { size: PAGE.contentWidth, type: WidthType.DXA },
        columnWidths: colWidths,
        rows: [
          // Header
          new TableRow({
            children: [
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[0], type: WidthType.DXA },
                shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'What We Do (The Work)', bold: true, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[1], type: WidthType.DXA },
                shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'What You Get (The Value)', bold: true, font: 'Arial', size: 20 })],
                  }),
                ],
              }),
            ],
          }),
          // Content
          new TableRow({
            children: [
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[0], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: details.work.map(item =>
                  new Paragraph({
                    numbering: { reference: 'bullets', level: 0 },
                    children: [new TextRun({ text: item, font: 'Arial', size: 18 })],
                  })
                ),
              }),
              new TableCell({
                borders: getTableBorders(),
                width: { size: colWidths[1], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: details.value.map(item =>
                  new Paragraph({
                    numbering: { reference: 'bullets', level: 0 },
                    children: [new TextRun({ text: item, font: 'Arial', size: 18 })],
                  })
                ),
              }),
            ],
          }),
        ],
      })
    );
  });

  return elements;
}

/* ======================
   MAIN EXPORT FUNCTIONS
====================== */

/**
 * Generate a Word document from proposal data
 */
export async function generateProposalDocument(
  data: ProposalData,
  options: ExportOptions = {}
): Promise<Document> {
  const companyName = options.companyName || 'CompanyX';

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 24 },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: COLORS.dark },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: COLORS.dark },
          paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              right: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${companyName} | Confidential`,
                    size: 18,
                    color: COLORS.medium,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', size: 18, color: COLORS.medium, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLORS.medium, font: 'Arial' }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createCoverPage(data, options),
          ...createExecutiveSummary(data, options),
          ...createSolutionOverview(options),
          ...createScopeOfServices(data),
          ...createMaturitySection(data),
          ...createFinancialSection(data),
          ...createImplementationRoadmap(options),
          ...createAddonsDetail(data),
        ],
      },
    ],
  });

  return doc;
}

/**
 * Export proposal to Word document and trigger download
 */
export async function exportProposalToWord(
  data: ProposalData,
  options: ExportOptions = {}
): Promise<void> {
  const doc = await generateProposalDocument(data, options);
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const clientName = data.client?.name || 'Proposal';
  const date = formatDate(options.proposalDate || new Date()).replace(/\s/g, '_');
  const filename = `${clientName.replace(/\s/g, '_')}_Proposal_${date}.docx`;

  // Native browser download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export proposal to Word and return as Blob (for API usage)
 */
export async function exportProposalToWordBlob(
  data: ProposalData,
  options: ExportOptions = {}
): Promise<Blob> {
  const doc = await generateProposalDocument(data, options);
  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
