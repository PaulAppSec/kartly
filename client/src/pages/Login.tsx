import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only allow same-origin, relative returnTo targets — this is the secure
// baseline for the open-redirect lesson (#18). "//evil.com" and absolute URLs
// are rejected in favour of "/".
function safeReturnTo(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = safeReturnTo(params.get("returnTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <h1 style={{ marginBottom: 6 }}>Welcome back</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Sign in to your Kartly account.
      </p>
      <form className="panel" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted" style={{ textAlign: "center", margin: "14px 0 0", fontSize: ".9rem" }}>
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </form>
      <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>
        New to Kartly? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
