import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.forgotPassword(email);
    } finally {
      // Always show the same confirmation — no account enumeration.
      setSent(true);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <h1 style={{ marginBottom: 6 }}>Reset your password</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        We'll email you a link to choose a new one.
      </p>
      {sent ? (
        <div className="panel">
          <p>
            If <strong>{email}</strong> has a Kartly account, a reset link is on its way. It expires
            in 30 minutes.
          </p>
          <p className="muted" style={{ fontSize: ".84rem" }}>
            (Local demo: nothing is actually emailed — the message is written to the server's
            <code> /app/outbox</code> and logged.)
          </p>
          <Link className="btn btn-ghost" to="/login">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form className="panel" onSubmit={submit}>
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
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>
        Remembered it? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
