// src/templates/guardianXmDRTemplate.ts

export function guardianXmDRTemplate(proposal: any): string {
  const data = proposal.data || {};

  const clientName = data.client?.name || 'Customer';
  const maturity = data.maturity || 'Core';
  const pricing = data.pricing || {};
  const addons = data.addons || [];

  return `
Guardian xMDR
Security Operations Proposal

Prepared for: ${clientName}
Date: ${new Date().toLocaleDateString()}

--------------------------------------------------

1. Executive Summary
In an era where cyber threats are becoming increasingly sophisticated and frequent,
${clientName} requires a security partner that offers more than just alerts.

Guardian xMDR is a comprehensive Managed Detection and Response service designed
to provide 24x7 visibility, rapid containment, and strategic maturity growth.

This proposal is based on the ${maturity} service tier.

--------------------------------------------------

2. Solution Overview
Guardian xMDR provides:
• 24x7 Detection & Response
• Advanced Analytics
• Automated Response (SOAR)
• Threat Intelligence

--------------------------------------------------

5. Financial Investment

Base Monthly Fee: €${pricing.monthly || 0}
Total Yearly Value: €${pricing.yearly || 0}

Add-ons:
${addons.map((a: any) => `• ${a.name} – €${a.price}`).join('\n')}

--------------------------------------------------

6. Implementation Roadmap
1. Kick-off & Discovery
2. Technical Integration
3. Tuning & Baselining
4. Validation
5. Go Live
`;
}
