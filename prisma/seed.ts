import { PrismaClient } from "../lib/generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create user
  const hashedPassword = await hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "tyler@socio.com" },
    update: {},
    create: {
      email: "tyler@socio.com",
      password: hashedPassword,
      name: "Tyler Martinez",
    },
  });

  // Create team members
  const teamMembers = [
    { name: "Dr. Sarah Chen", email: "sarah@socio.com" },
    { name: "Tyler Martinez", email: "tyler@socio.com" },
    { name: "Dr. Maya Johnson", email: "maya@socio.com" },
    { name: "Dr. James Wilson", email: "james@socio.com" },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { email: member.email },
      update: {},
      create: member,
    });
  }

  const now = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

  // Create opportunities with full seed data
  const opportunities = [
    {
      source: "UTAH_BONFIRE" as const,
      sourceId: "UT-2026-001",
      title: "Community Health Assessment for Rural Utah Counties",
      description: "The Utah Department of Health and Human Services seeks qualified consultants to conduct a comprehensive Community Health Assessment (CHA) for five rural counties: Beaver, Iron, Garfield, Kane, and Washington. The assessment will inform the development of the 2026-2030 State Health Improvement Plan. The scope includes quantitative data analysis of existing health indicators, qualitative research through community focus groups and key informant interviews, geographic analysis of health resource distribution, and strategic recommendations for resource allocation.",
      issuingOrg: "Utah Department of Health and Human Services",
      category: "Professional Services",
      postedDate: now,
      deadline: addDays(now, 14),
      estimatedValue: 150000,
      locationState: "UT",
      locationCountry: "USA",
      isUtah: true,
      contactName: "Jane Smith",
      contactEmail: "jane.smith@utah.gov",
      icpScore: 94,
      tier: "HOT" as const,
      scoreBreakdown: { budget: 85, sector: 95, geography: 100, timing: 70 },
      aiBrief: {
        summary: "Utah DHHS seeks a consultant to conduct a comprehensive community health assessment across 5 rural counties. The project includes quantitative data analysis, community focus groups, and strategic recommendations for health resource allocation.",
        fitAnalysis: "Strong alignment with Socio's Contextual Analytics approach. The mixed-methods requirement (quant + focus groups) is exactly our wheelhouse. Rural health equity is an emerging focus area.",
        strengths: [
          "Utah-based: relationship-building advantage",
          "Mixed methods: core Socio competency",
          "Health focus: strong past performance"
        ],
        concerns: [
          "Timeline is tight (5 counties in 6 months)",
          "May require local data collection partners"
        ],
        recommendation: "PURSUE"
      },
      aiGeneratedAt: now,
      status: "NEW" as const,
    },
    {
      source: "SAM_GOV" as const,
      sourceId: "SAM-2026-001",
      title: "Family Strengthening Program Evaluation",
      description: "HHS Administration for Children and Families seeks an independent evaluator for the Family Strengthening Initiative across 12 states. The evaluation will assess program fidelity, participant outcomes, and cost-effectiveness over a 3-year period.",
      issuingOrg: "Administration for Children and Families",
      category: "Research and Evaluation",
      postedDate: now,
      deadline: addDays(now, 29),
      estimatedValue: 300000,
      locationState: null,
      locationCountry: "USA",
      isUtah: false,
      contactName: "Robert Chen",
      contactEmail: "robert.chen@acf.hhs.gov",
      icpScore: 87,
      tier: "HOT" as const,
      scoreBreakdown: { budget: 95, sector: 90, geography: 70, timing: 85 },
      aiBrief: {
        summary: "Federal evaluation opportunity for family strengthening programs. Multi-state scope with substantial budget.",
        fitAnalysis: "Good fit for Socio's evaluation expertise. Federal work would expand portfolio beyond state-level contracts.",
        strengths: [
          "Strong budget ($300K)",
          "Multi-year engagement potential",
          "Human services focus aligns with mission"
        ],
        concerns: [
          "No Utah connection - travel required",
          "Federal contracting complexity and compliance"
        ],
        recommendation: "PURSUE"
      },
      aiGeneratedAt: now,
      status: "NEW" as const,
    },
    {
      source: "WORLD_BANK" as const,
      sourceId: "WB-2026-001",
      title: "Kenya Health M&E Framework Development",
      description: "Development of monitoring and evaluation framework for Kenya's primary healthcare system strengthening program.",
      issuingOrg: "World Bank - Kenya",
      category: "Consulting Services",
      postedDate: now,
      deadline: addDays(now, 15),
      estimatedValue: 200000,
      locationState: null,
      locationCountry: "Kenya",
      isUtah: false,
      icpScore: 82,
      tier: "HOT" as const,
      scoreBreakdown: { budget: 90, sector: 95, geography: 60, timing: 75 },
      aiBrief: {
        summary: "International health M&E opportunity in Kenya. World Bank funding ensures payment reliability.",
        fitAnalysis: "Aligns with health sector expertise. International work diversifies portfolio.",
        strengths: [
          "World Bank credibility and payment reliability",
          "Health sector focus matches expertise",
          "Strong budget for scope"
        ],
        concerns: [
          "International travel required",
          "Time zone challenges for remote work"
        ],
        recommendation: "CONSIDER"
      },
      aiGeneratedAt: now,
      status: "NEW" as const,
    },
    {
      source: "STATE_BONFIRE" as const,
      sourceId: "CO-2026-001",
      title: "Health Equity Assessment Services",
      description: "Colorado Department of Public Health and Environment seeks consultant for statewide health equity assessment and strategic planning.",
      issuingOrg: "Colorado CDPHE",
      category: "Professional Services",
      postedDate: now,
      deadline: addDays(now, 24),
      estimatedValue: 180000,
      locationState: "CO",
      locationCountry: "USA",
      isUtah: false,
      icpScore: 72,
      tier: "WARM" as const,
      scoreBreakdown: { budget: 80, sector: 85, geography: 50, timing: 80 },
      status: "NEW" as const,
    },
    {
      source: "STATE_BONFIRE" as const,
      sourceId: "NV-2026-001",
      title: "Workforce Development Program Evaluation",
      description: "Nevada DHHS seeks evaluation services for workforce development initiatives targeting underserved communities.",
      issuingOrg: "Nevada DHHS",
      category: "Research Services",
      postedDate: now,
      deadline: addDays(now, 11),
      estimatedValue: 120000,
      locationState: "NV",
      locationCountry: "USA",
      isUtah: false,
      icpScore: 68,
      tier: "WARM" as const,
      scoreBreakdown: { budget: 70, sector: 75, geography: 55, timing: 65 },
      status: "NEW" as const,
    },
    {
      source: "UNDP" as const,
      sourceId: "UNDP-2026-001",
      title: "Governance Impact Assessment Study",
      description: "UNDP Kenya seeks consultant for governance program impact assessment covering 12 counties.",
      issuingOrg: "UNDP Kenya",
      category: "Evaluation Services",
      postedDate: now,
      deadline: addDays(now, 34),
      estimatedValue: 95000,
      locationState: null,
      locationCountry: "Kenya",
      isUtah: false,
      icpScore: 65,
      tier: "WARM" as const,
      scoreBreakdown: { budget: 60, sector: 70, geography: 50, timing: 90 },
      status: "NEW" as const,
    },
    {
      source: "UTAH_BONFIRE" as const,
      sourceId: "UT-2026-002",
      title: "Utah Education Equity Research Partnership",
      description: "Utah State Board of Education seeks research partner for education equity study across Title I schools.",
      issuingOrg: "Utah State Board of Education",
      category: "Research Services",
      postedDate: now,
      deadline: addDays(now, 21),
      estimatedValue: 175000,
      locationState: "UT",
      locationCountry: "USA",
      isUtah: true,
      contactName: "Maria Garcia",
      contactEmail: "maria.garcia@schools.utah.gov",
      icpScore: 91,
      tier: "HOT" as const,
      scoreBreakdown: { budget: 80, sector: 75, geography: 100, timing: 80 },
      aiBrief: {
        summary: "Utah education equity research opportunity. Partnership model with state board of education for Title I school analysis.",
        fitAnalysis: "Strong Utah connection and research methodology fit. Education is an adjacent sector for Socio with room for growth.",
        strengths: [
          "Utah-based: home market advantage",
          "Research partnership model suits Socio",
          "Growing education equity practice area"
        ],
        concerns: [
          "Education sector is newer territory",
          "May require specialized education data expertise"
        ],
        recommendation: "PURSUE"
      },
      aiGeneratedAt: now,
      status: "NEW" as const,
    },
    {
      source: "SAM_GOV" as const,
      sourceId: "SAM-2026-002",
      title: "CDC Community Health Worker Program Evaluation",
      description: "Centers for Disease Control and Prevention seeks evaluator for national Community Health Worker integration program.",
      issuingOrg: "Centers for Disease Control and Prevention",
      category: "Evaluation Services",
      postedDate: now,
      deadline: addDays(now, 45),
      estimatedValue: 250000,
      locationState: null,
      locationCountry: "USA",
      isUtah: false,
      icpScore: 78,
      tier: "WARM" as const,
      scoreBreakdown: { budget: 90, sector: 90, geography: 50, timing: 90 },
      status: "NEW" as const,
    },
    {
      source: "BIDNET" as const,
      sourceId: "BN-2026-001",
      title: "Municipal Data Analytics Platform Assessment",
      description: "City of Denver seeks consultant to assess and recommend improvements for municipal data analytics capabilities.",
      issuingOrg: "City of Denver",
      category: "Technology Consulting",
      postedDate: now,
      deadline: addDays(now, 18),
      estimatedValue: 85000,
      locationState: "CO",
      locationCountry: "USA",
      isUtah: false,
      icpScore: 52,
      tier: "COOL" as const,
      scoreBreakdown: { budget: 60, sector: 50, geography: 50, timing: 70 },
      status: "NEW" as const,
    },
    {
      source: "UNGM" as const,
      sourceId: "UNGM-2026-001",
      title: "UN Women Gender Equality Program M&E",
      description: "UN Women seeks monitoring and evaluation consultant for gender equality programming in East Africa.",
      issuingOrg: "UN Women",
      category: "Monitoring and Evaluation",
      postedDate: now,
      deadline: addDays(now, 40),
      estimatedValue: 110000,
      locationState: null,
      locationCountry: "Kenya",
      isUtah: false,
      icpScore: 58,
      tier: "COOL" as const,
      scoreBreakdown: { budget: 65, sector: 70, geography: 40, timing: 85 },
      status: "NEW" as const,
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.upsert({
      where: {
        source_sourceId: { source: opp.source, sourceId: opp.sourceId },
      },
      update: {},
      create: opp as any,
    });
  }

  console.log("Seed data created successfully!");
  console.log(`  - 1 user (tyler@socio.com / password123)`);
  console.log(`  - ${teamMembers.length} team members`);
  console.log(`  - ${opportunities.length} opportunities`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
