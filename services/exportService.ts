import * as XLSX from 'xlsx';

/* =====================================================
   MDR PACKAGES EXPORT (EXISTING – UNCHANGED)
===================================================== */

export const exportPackagesToExcel = () => {
  const data = [
    // ===============================
    // 1. Framework & Commercial Terms
    // ===============================
    { Feature: 'Service Term (months)', Core: '12 / 36 / 60', Advanced: '36 / 60', Elite: '36 / 60' },
    { Feature: 'Predictable Costs (Fixed Fee Model)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Monthly / Quarterly / Annual Billing', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Annual Billing Discount', Core: '–', Advanced: '–', Elite: '2%' },
    { Feature: 'ISO 9001, 14001, 22301, 27001 & SOC2 Type II Certified', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: '24×7 SOC (Netherlands)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Local Support Phone Number', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Online Support Portal', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Local Language Support', Core: '8×5', Advanced: '8×5', Elite: '8×5' },

    // =========================================
    // 2. Security Technology & Platform Coverage
    // =========================================
    { Feature: 'Security Technology Integration', Core: 'EDR', Advanced: 'XDR', Elite: 'XDR / SIEM' },
    { Feature: '24×7 Detection, Response & Eyes-on-Screen', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Automated Incident Triage & Containment', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Nomios SOAR Platform', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Cyber Threat Intelligence (CTI) Feeds', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Cyber Knowledge & Intelligence Sharing', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'ITSM Service Integration', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Platform Health Monitoring (Logs & Alerts)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },

    // ===============================
    // 3. Onboarding & Operations
    // ===============================
    { Feature: 'Streamlined Onboarding Project Coordination', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Security Operations Reporting (Monthly & Automated)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Customizable Security Operations Reporting', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Major Incident Response (P1 & P2) with Root Cause Analysis', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Orchestration with Customer Security Tools', Core: '–', Advanced: 'Yes', Elite: 'Yes' },

    // ===============================
    // 4. Governance & Service Management
    // ===============================
    { Feature: 'Monthly Operational Governance Meeting', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Quarterly Business Review (QBR)', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Designated Service Delivery Manager', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'Proactive Threat Hunting', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'Microsoft Teams Incident Collaboration (War Room)', Core: '–', Advanced: '–', Elite: 'Yes' },

    // ===============================
    // 5. Advanced Security Capabilities
    // ===============================
    { Feature: 'Digital Forensics & Incident Response (CSIRT / DFIR)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Vulnerability Management', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Hybrid SOC (After-Hours Customer SOC Extension)', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Purple Teaming (Attack Simulations)', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Mail Phishing Campaigns', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'MITRE ATT&CK-Based Threat Modelling', Core: '–', Advanced: '1× / year', Elite: '2× / year' },

    // ===============================
    // 6. SIEM Capabilities
    // ===============================
    { Feature: 'Integrate Existing SIEM into Nomios SOAR', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'Supported SIEMs (Splunk, QRadar, Sentinel)', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'SOC Engineering (Build, Config, Setup)', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'SOC Content Engineering (30 Standard Use-Cases)', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'SOC Security Assessment & Asset Mapping', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'Real-Time SIEM Dashboards', Core: '–', Advanced: '–', Elite: 'Yes' },
    { Feature: 'Licenses / Hosting / Hardware', Core: 'Excluded', Advanced: 'Excluded', Elite: 'Excluded' },

    // ===============================
    // 7. Complementary Security Services
    // ===============================
    { Feature: 'EDR / NDR / XDR Implementation & Management', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Deception (Honeypots)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Security Consulting, Assessment & Pentesting', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Security Expert Advisory Services', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Vulnerability Operations Center (VOC)', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'IoT / OT Security Monitoring', Core: '–', Advanced: '–', Elite: 'Yes' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MDR Packages');
  XLSX.writeFile(workbook, 'Nomios_MDR_Service_Packages.xlsx');
};

/* =====================================================
   DARK WEB MONITORING EXPORT (EXISTING – UNCHANGED)
===================================================== */

export const exportDarkWebMonitoringToExcel = () => {
  const data = [
    { Feature: 'Dark Web Marketplaces & Forums', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Paste Sites & Breach Dumps', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Corporate Domain Monitoring', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Employee Credential Exposure', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Executive / VIP Exposure', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Brand & Impersonation Monitoring', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Risk Severity Scoring', Core: 'Yes', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'SOC Escalation & Incident Advisory', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
    { Feature: 'Executive Risk Reporting', Core: '–', Advanced: 'Yes', Elite: 'Yes' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dark Web Monitoring');
  XLSX.writeFile(workbook, 'Dark_Web_Monitoring_Proposal.xlsx');
};

/* =====================================================
   EXPOSURE MANAGEMENT PRICING EXPORT (FIXED)
===================================================== */

export const exportExposureManagementToExcel = (payload: {
  tier: string;
  term: number;
  discount: number;
  assets: {
    domains: number;
    cloud: number;
    ipRanges: number;
  };
  pricing: {
    monthly: number;
    onboarding: number;
    total: number;
  };
}) => {
  const { tier, term, discount, assets, pricing } = payload;

  const data = [
    { Item: 'Selected Tier', Value: tier },
    { Item: 'Service Term (Months)', Value: term },
    { Item: 'Sales Discount (%)', Value: discount },

    { Item: 'Domains / Brands Monitored', Value: assets.domains },
    { Item: 'Cloud Accounts', Value: assets.cloud },
    { Item: 'IP Ranges / External Assets', Value: assets.ipRanges },

    { Item: 'Monthly Service Fee (€)', Value: pricing.monthly.toFixed(2) },
    { Item: 'One-time Onboarding (€)', Value: pricing.onboarding.toFixed(2) },
    { Item: 'Total Contract Value (€)', Value: pricing.total.toFixed(2) },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Exposure Management');

  XLSX.writeFile(
    workbook,
    `Exposure_Management_${tier.replace(/\s+/g, '_')}_Proposal.xlsx`
  );
};

/* =====================================================
   SOLUTIONS CALCULATOR EXPORT (NEW)
===================================================== */

export const exportSolutionsToExcel = (payload: {
  termMonths: number;
  billingFrequency: string;
  globalDiscount: number;
  items: Array<{
    type: string;
    name: string;
    sku: string;
    units: number;
    unitLabel: string;
    unitMsrp: number;
    resellerMarginPct: number;
    lineDiscountPct: number;
    globalDiscountPct: number;
    listMonthly: number;
    customerMonthly: number;
    oneTimeOnboarding: number;
  }>;
  totals: {
    recurringMonthly: number;
    oneTime: number;
    tcv: number;
  };
}) => {
  const { termMonths, billingFrequency, globalDiscount, items, totals } = payload;

  const summarySheet = XLSX.utils.json_to_sheet([
    { Item: 'Contract Term (Months)', Value: termMonths },
    { Item: 'Billing Frequency', Value: billingFrequency },
    { Item: 'Global Discount (%)', Value: globalDiscount },
    { Item: 'Recurring Monthly (€)', Value: totals.recurringMonthly.toFixed(2) },
    { Item: 'One-time Fees (€)', Value: totals.oneTime.toFixed(2) },
    { Item: 'Total Contract Value (€)', Value: totals.tcv.toFixed(2) },
  ]);

  const lineItemsSheet = XLSX.utils.json_to_sheet(
    items.map(i => ({
      Type: i.type,
      Product: i.name,
      SKU: i.sku,
      Units: i.units,
      Unit: i.unitLabel,
      'Unit MSRP (€)': i.unitMsrp,
      'Reseller Margin (%)': i.resellerMarginPct,
      'Line Discount (%)': i.lineDiscountPct,
      'Global Discount (%)': i.globalDiscountPct,
      'List Monthly (€)': i.listMonthly.toFixed(2),
      'Customer Monthly (€)': i.customerMonthly.toFixed(2),
      'Onboarding (one-time €)': i.oneTimeOnboarding.toFixed(2),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, lineItemsSheet, 'Line Items');

  XLSX.writeFile(workbook, 'Solutions_Proposal.xlsx');
};





