import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function analyzeWithGemini(csvContent: string, rawData: any[]) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });

  // Sample only representative data to reduce token count
  const sampleSize = Math.min(20, rawData.length);
  const sampledData = rawData.slice(0, sampleSize);

  // Get column headers from first row
  const columns = Object.keys(sampledData[0] || {}).join(", ");

  const prompt = `
You are a DevSecOps expert. Analyze this security scan and return JSON ONLY.

Columns: ${columns}

Data Sample (${sampleSize} of ${rawData.length} rows):
${JSON.stringify(sampledData, null, 2).substring(0, 3000)}

Return JSON ONLY (no markdown):
{
  "summary": { "critical": <count>, "high": <count>, "medium": <count>, "low": <count>, "total": <count> },
  "insights": "<1-2 sentence summary>",
  "prioritizedIssues": [
    {
      "id": "<unique_id>",
      "title": "<vuln_name>",
      "severity": "<Critical|High|Medium|Low>",
      "package": "<component>",
      "cve": "<CVE if available>",
      "priorityScore": <1-10>,
      "aiExplanation": "<concise impact>",
      "remediation": "<fix>",
      "falsePositiveRisk": "<Low|Medium|High>",
      "affectedFiles": ["<location>"]
    }
  ],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Return top 15-30 critical issues. Be concise.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    // Clean and parse JSON - handle markdown code blocks
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/\n?```$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/\n?```$/g, "");
    }

    // Extract JSON object - try to find complete JSON
    const jsonMatch = jsonText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("No JSON found in response. Full response:", text);
      throw new Error("AI did not return valid JSON. Please try again.");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Attempted to parse:", jsonMatch[0].substring(0, 500));
      throw new Error("AI returned malformed JSON. Please try again.");
    }

    // Validate structure
    if (!parsed.summary || !parsed.prioritizedIssues) {
      console.error("Invalid structure:", parsed);
      throw new Error(
        "AI returned incomplete data structure. Please try again."
      );
    }

    // Ensure summary has all required fields with defaults
    parsed.summary = {
      critical: parsed.summary.critical || 0,
      high: parsed.summary.high || 0,
      medium: parsed.summary.medium || 0,
      low: parsed.summary.low || 0,
      total: parsed.summary.total || parsed.prioritizedIssues.length || 0,
    };

    return parsed;
  } catch (error: any) {
    console.error("Gemini analysis error:", error);

    // Check if it's an API error
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your Google AI API key.");
    }
    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      throw new Error("API rate limit exceeded. Please try again in a moment.");
    }

    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
