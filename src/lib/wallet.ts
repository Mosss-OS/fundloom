/**
 * Generates a deterministic-looking embedded wallet address for demo/MVP use.
 * In production this is replaced by Privy's `embeddedWallet.address` returned
 * automatically when a user signs in with email.
 */
export function mockEmbeddedWallet(seed: string): string {
  // Simple FNV-1a hash → 40 hex chars. Deterministic per seed (email/privy id).
  let h = BigInt("0xcbf29ce484222325");
  const prime = BigInt("0x100000001b3");
  const mask = (BigInt(1) << BigInt(64)) - BigInt(1);
  for (let i = 0; i < seed.length; i++) {
    h ^= BigInt(seed.charCodeAt(i));
    h = (h * prime) & mask;
  }
  let hex = h.toString(16).padStart(16, "0");
  while (hex.length < 40) hex += h.toString(16).padStart(16, "0");
  return "0x" + hex.slice(0, 40);
}