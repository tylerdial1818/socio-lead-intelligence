import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface BriefInput {
  title: string;
  description: string | null;
  issuingOrg: string | null;
  category: string | null;
  estimatedValue: number | null;
  locationState: string | null;
  locationCountry: string;
  deadline: string | null;
  icpScore: number | null;
  tier: string | null;
}

interface GeneratedBrief {
  summary: string;
  fitAnalysis: string;
  strengths: string[];
  concerns: string[];
  recommendation: "PURSUE" | "CONSIDER" | "PASS";
}

export async function generateBrief(input: BriefInput): Promise<GeneratedBrief> {
  const prompt = `You are an analyst for a social-impact consulting firm (Socio Analytics) based in Utah. Analyze this government contracting opportunity and provide a structured intelligence brief.

OPPORTUNITY:
Title: ${input.title}
Issuing Organization: ${input.issuingOrg || "Unknown"}
Description: ${input.description || "No description available"}
Category: ${input.category || "Unspecified"}
Estimated Value: ${input.estimatedValue ? `$${input.estimatedValue.toLocaleString()}` : "Not specified"}
Location: ${input.locationState || "N/A"}, ${input.locationCountry}
Deadline: ${input.deadline || "Not specified"}
ICP Score: ${input.icpScore ?? "Not scored"}/100 (${input.tier || "Unranked"})

Respond with ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentence executive summary of the opportunity",
  "fitAnalysis": "2-3 sentences on how this aligns with a Utah-based social impact research & evaluation firm",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendation": "PURSUE" | "CONSIDER" | "PASS"
}

Guidelines:
- PURSUE: Strong fit (score 75+, relevant sector, good geography)
- CONSIDER: Moderate fit (score 50-74, adjacent sector or distant geography)
- PASS: Poor fit (score <50, unrelated sector, or significant barriers)
- Be specific and actionable, not generic
- Reference the firm's Utah base and social-impact focus`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as GeneratedBrief;
}
