import OpenAI from "openai";

export interface EnrichmentResult {
  enrichedDescription: string;
  suggestedCategory: string;
}

/**
 * Use gpt-4o-mini to expand a sparse opportunity title into a richer description
 * that keyword matching can work against. Also suggests a category.
 *
 * Cost: ~$0.0002 per call (~$1.80/month at 300 opportunities/day).
 */
export async function enrichOpportunity(input: {
  title: string;
  issuingOrg: string | null;
  state: string | null;
  department: string | null;
}): Promise<EnrichmentResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `You are a government procurement analyst. Given a procurement opportunity title and metadata, produce:

1. An expanded description (2-3 sentences) explaining what this solicitation likely involves, what services or goods are being requested, and what kind of firms would typically bid on it. Be factual and grounded — only state what can reasonably be inferred from the title and issuing organization.

2. A category from this list: Professional Services, Research & Evaluation, IT & Technology, Construction & Infrastructure, Health & Human Services, Education & Training, Environmental, Legal & Compliance, Financial Services, Marketing & Communications, Facilities & Maintenance, Transportation, Public Safety, Other.

OPPORTUNITY:
Title: ${input.title}
Issuing Organization: ${input.issuingOrg || "Unknown"}
Department: ${input.department || "Unknown"}
State: ${input.state || "Unknown"}

Respond with ONLY valid JSON:
{
  "enrichedDescription": "2-3 sentence expanded description",
  "suggestedCategory": "One of the categories listed above"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content);

  return {
    enrichedDescription: parsed.enrichedDescription || input.title,
    suggestedCategory: parsed.suggestedCategory || "Other",
  };
}
