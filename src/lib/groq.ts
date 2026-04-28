import { z } from "zod";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call Groq API with a prompt
 * Uses Llama 3.3 70B for now - future: switch to Claude via API
 */
export async function callGroq(
  messages: GroqMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  },
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model || "llama-3.3-70b-versatile",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(`Groq API error: ${error?.error?.message || response.statusText}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * AI Campaign Optimizer
 * Analyzes campaign and provides optimization suggestions
 */
export async function optimizeCampaign(params: {
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  deadline: string;
}): Promise<{
  improvedTitle: string;
  improvedDescription: string;
  suggestions: string[];
  tags: string[];
}> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `You are an expert crowdfunding campaign optimizer. Analyze campaigns and provide actionable improvements.
Return JSON only with fields: improvedTitle, improvedDescription, suggestions (array), tags (array).`,
    },
    {
      role: "user",
      content: `Optimize this crowdfunding campaign:
Title: ${params.title}
Category: ${params.category}
Goal: $${params.goalAmount}
Deadline: ${params.deadline}
Description: ${params.description}

Provide an improved title, improved description, 3-5 suggestions, and relevant tags.`,
    },
  ];

  const response = await callGroq(messages, { temperature: 0.8 });

  try {
    return JSON.parse(response);
  } catch {
    // Fallback parsing
    return {
      improvedTitle: params.title,
      improvedDescription: params.description,
      suggestions: [response.slice(0, 200)],
      tags: [params.category],
    };
  }
}

/**
 * AI Fraud Detection
 * Analyzes campaign for potential fraud indicators
 */
export async function detectFraud(params: {
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  creatorHistory: {
    campaignsCreated: number;
    successfulCampaigns: number;
    totalRaised: number;
  };
}): Promise<{
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  recommendation: string;
}> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `You are a fraud detection AI for a crowdfunding platform. 
Analyze campaigns and assign risk scores (0-100). 
Return JSON only with fields: riskScore (number), riskLevel (low/medium/high), flags (array), recommendation (string).`,
    },
    {
      role: "user",
      content: `Analyze fraud risk for this campaign:
Title: ${params.title}
Description: ${params.description}
Category: ${params.category}
Goal: $${params.goalAmount}

Creator History:
- Campaigns created: ${params.creatorHistory.campaignsCreated}
- Successful campaigns: ${params.creatorHistory.successfulCampaigns}
- Total raised: $${params.creatorHistory.totalRaised}

Rate the fraud risk (0-100) and explain your reasoning.`,
    },
  ];

  const response = await callGroq(messages, { temperature: 0.3 });

  try {
    return JSON.parse(response);
  } catch {
    return {
      riskScore: 50,
      riskLevel: "medium" as const,
      flags: ["Unable to fully analyze"],
      recommendation: response.slice(0, 200),
    };
  }
}

/**
 * Smart Donor Matching
 * Matches campaigns to potential donors based on interests
 */
export async function matchDonors(params: {
  campaignTitle: string;
  campaignDescription: string;
  campaignCategory: string;
  donorPreferences?: string[];
  donorHistory?: Array<{ title: string; category: string }>;
}): Promise<{
  matchScore: number; // 0-100
  reasons: string[];
  suggestedAmount: number;
  similarCampaigns: string[];
}> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `You are a smart donation matching AI. 
Analyze campaigns and donors to provide matching scores and insights.
Return JSON only with fields: matchScore (0-100), reasons (array), suggestedAmount (number), similarCampaigns (array).`,
    },
    {
      role: "user",
      content: `Match this campaign to a donor:

Campaign:
- Title: ${params.campaignTitle}
- Category: ${params.campaignCategory}
- Description: ${params.campaignDescription}

Donor Profile:
- Preferences: ${params.donorPreferences?.join(", ") || "Not specified"}
- Past donations: ${params.donorHistory?.map((d) => `${d.title} (${d.category})`).join(", ") || "None"}

Provide a match score (0-100), reasons for matching, suggested donation amount, and similar successful campaigns.`,
    },
  ];

  const response = await callGroq(messages, { temperature: 0.5 });

  try {
    return JSON.parse(response);
  } catch {
    return {
      matchScore: 50,
      reasons: [response.slice(0, 200)],
      suggestedAmount: 50,
      similarCampaigns: [],
    };
  }
}
