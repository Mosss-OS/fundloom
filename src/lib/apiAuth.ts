import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-change-in-production";

export interface ApiAuthContext {
  userId: string;
  apiKeyId?: string;
  scopes: string[];
}

/**
 * Verify JWT token from Authorization header
 */
export async function verifyJWT(token: string): Promise<ApiAuthContext | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; scopes: string[] };
    return {
      userId: decoded.userId,
      scopes: decoded.scopes || ["read"],
    };
  } catch {
    return null;
  }
}

/**
 * Verify API key from Authorization header
 */
export async function verifyApiKey(apiKey: string): Promise<ApiAuthContext | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("user_id, scopes, is_active")
      .eq("key_hash", hashApiKey(apiKey))
      .single();

    if (error || !data || !data.is_active) {
      return null;
    }

    // Update last_used_at
    await supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("key_hash", hashApiKey(apiKey));

    return {
      userId: data.user_id,
      scopes: data.scopes || ["read"],
    };
  } catch {
    return null;
  }
}

/**
 * Generate JWT token for API access
 */
export function generateJWT(userId: string, scopes: string[] = ["read"]): string {
  return jwt.sign({ userId, scopes }, JWT_SECRET, { expiresIn: "30d" });
}

/**
 * Generate API key
 */
export function generateApiKey(): { key: string; hashedKey: string } {
  const key = `fl_${randomBytes(32)}`;
  const hashedKey = hashApiKey(key);
  return { key, hashedKey };
}

function hashApiKey(key: string): string {
  // Simple hash for demo - use proper hashing in production
  return Buffer.from(key).toString("base64");
}

function randomBytes(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Middleware to authenticate API requests
 */
export async function authenticateRequest(request: Request): Promise<ApiAuthContext | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  // Check for API key (Bearer token starting with fl_)
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token.startsWith("fl_")) {
      return await verifyApiKey(token);
    }
    // JWT token
    return await verifyJWT(token);
  }

  // Basic auth
  if (authHeader.startsWith("Basic ")) {
    const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
    const [email, password] = credentials.split(":");
    // Verify against Supabase auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.user) {
      return { userId: data.user.id, scopes: ["read", "write"] };
    }
  }

  return null;
}

/**
 * Check if user has required scope
 */
export function hasScope(auth: ApiAuthContext, requiredScope: string): boolean {
  if (auth.scopes.includes("*")) return true;
  return auth.scopes.includes(requiredScope);
}
