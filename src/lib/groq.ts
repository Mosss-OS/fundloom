import { z } from "zod";

// Call Supabase Edge Function instead of Groq directly (protects API key)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callAIHelper(
  type: string,
  messages: GroqMessage[],
  options?: { temperature?: number }
): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-helper`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      type,
      messages,
      options,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(`AI helper error: ${error?.error || response.statusText}`);
  }

  return await response.json();
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

  try {
    const result = await callAIHelper("optimize", messages, { temperature: 0.8 });
    return {
      improvedTitle: result.improvedTitle || params.title,
      improvedDescription: result.improvedDescription || params.description,
      suggestions: result.suggestions || [],
      tags: result.tags || [params.category],
    };
  } catch (error) {
    return {
      improvedTitle: params.title,
      improvedDescription: params.description,
      suggestions: [error instanceof Error ? error.message : "Optimization failed"],
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

  try {
    const result = await callAIHelper("fraud", messages, { temperature: 0.3 });
    return {
      riskScore: result.riskScore || 50,
      riskLevel: result.riskLevel || "medium",
      flags: result.flags || [],
      recommendation: result.recommendation || "Unable to fully analyze",
    };
  } catch (error) {
    return {
      riskScore: 50,
      riskLevel: "medium" as const,
      flags: [error instanceof Error ? error.message : "Analysis failed"],
      recommendation: "Please try again later",
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

  try {
    const result = await callAIHelper("match", messages, { temperature: 0.5 });
    return {
      matchScore: result.matchScore || 50,
      reasons: result.reasons || [],
      suggestedAmount: result.suggestedAmount || 50,
      similarCampaigns: result.similarCampaigns || [],
    };
  } catch (error) {
    return {
      matchScore: 50,
      reasons: [error instanceof Error ? error.message : "Matching failed"],
      suggestedAmount: 50,
      similarCampaigns: [],
    };
  }
}
