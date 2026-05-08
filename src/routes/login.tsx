import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFundloomAuth } from "@/auth/useFundloomAuth";

export default function Login() {
  const { user, loginEmail, privyAvailable } = useFundloomAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await loginEmail(email.trim());
      // Privy will either:
      // 1. Send a one-time code to the email (auto-submit flow)
      // 2. Or show the login modal where user types email again
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-16 sm:px-8">
      <div className="w-full">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Welcome.</h1>
        <p className="mt-3 text-pretty text-ink-soft">
          Sign in with your email. A wallet is created for you — no setup required.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Email</span>
            <input
              type="email"
              autoFocus
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="mt-2 block w-full rounded-2xl border border-line bg-paper px-5 py-4 text-base text-ink placeholder:text-ink-soft/60 outline-none transition focus:border-ink focus:ring-0"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Continue"}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>

          {!privyAvailable && (
            <p className="text-xs leading-relaxed text-ink-soft">
              Privy isn't configured yet — running in demo mode. Add{" "}
              <code className="rounded bg-paper px-1 py-0.5 hairline">VITE_PRIVY_APP_ID</code> to{" "}
              <code className="rounded bg-paper px-1 py-0.5 hairline">.env</code> to enable real
              email auth.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
