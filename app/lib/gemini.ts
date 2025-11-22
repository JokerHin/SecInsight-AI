// src/lib/gemini.ts
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

    console.log("Gemini Response (first 500 chars):", text.substring(0, 500));

    // Clean and parse JSON - handle markdown code blocks
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/\n?```$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/\n?```$/g, "");
    }

    // Extract JSON object
    const jsonMatch = jsonText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      throw new Error("No valid JSON from Gemini");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsed.summary || !parsed.prioritizedIssues) {
      throw new Error("Invalid JSON structure from Gemini");
    }

    return parsed;
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
