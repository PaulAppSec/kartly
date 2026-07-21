import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-wrap">
        <div className="panel">
          <h2>Missing reset link</h2>
          <p className="muted">This page needs a valid reset link from your email.</p>
          <Link className="btn btn-ghost" to="/forgot-password">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <h1 style={{ marginBottom: 6 }}>Choose a new password</h1>
      {done ? (
        <div className="panel">
          <p>Your password has been reset. Taking you to sign in…</p>
        </div>
      ) : (
        <form className="panel" onSubmit={submit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <span className="muted" style={{ fontSize: ".82rem" }}>
              At least 8 characters.
            </span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Saving…" : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
}
