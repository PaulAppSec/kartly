import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type Message, type Order } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toaster";
import { money } from "../lib/format";

type Tab = "profile" | "orders" | "messages" | "addresses";

export function Account() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("profile");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [addresses, setAddresses] = useState<{ id: string; line1: string; city: string; country: string }[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (tab === "orders") api.listOrders().then((r) => setOrders(r.orders)).catch(() => {});
    if (tab === "messages") api.inbox().then((r) => setMessages(r.messages)).catch(() => {});
    if (tab === "addresses") api.listAddresses().then((r) => setAddresses(r.addresses)).catch(() => {});
  }, [tab, user]);

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="panel" style={{ textAlign: "center" }}>
          <h2>You're signed out</h2>
          <p className="muted">Sign in to see your account.</p>
          <Link className="btn btn-primary" to="/login?returnTo=%2Faccount">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateMe({ name, bio });
      await refreshMe();
      toast("Profile saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    }
  };

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="row-between" style={{ marginBottom: 8 }}>
        <h1>Hi, {user.name.split(" ")[0]}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {(user.role === "SELLER" || user.role === "ADMIN") && (
            <Link to="/seller" className="btn btn-ghost">
              Seller dashboard
            </Link>
          )}
          {user.role === "ADMIN" && (
            <a href="/admin" className="btn btn-ghost">
              Admin
            </a>
          )}
          <button className="btn btn-ghost" onClick={doLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="tabs">
        {(["profile", "orders", "messages", "addresses"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form className="panel" onSubmit={saveProfile} style={{ maxWidth: 520 }}>
          <div className="field">
            <label>Email</label>
            <input value={user.email} disabled />
          </div>
          <div className="field">
            <label htmlFor="pname">Name</label>
            <input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pbio">Bio</label>
            <textarea id="pbio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
          </div>
          <button className="btn btn-primary">Save changes</button>
        </form>
      )}

      {tab === "orders" &&
        (orders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div className="list-card" key={o.id}>
              <div>
                <strong>{o.id}</strong>
                <div className="muted" style={{ fontSize: ".86rem" }}>
                  {o.items.length} item{o.items.length !== 1 ? "s" : ""} · {o.createdAt.slice(0, 10)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="badge-status">{o.status}</span>
                <span className="tnum">{money(o.total)}</span>
                <a className="btn btn-ghost" href={`/receipt/${o.id}`}>
                  Receipt
                </a>
              </div>
            </div>
          ))
        ))}

      {tab === "messages" &&
        (messages.length === 0 ? (
          <p className="muted">No messages.</p>
        ) : (
          messages.map((m) => (
            <div className="list-card" key={m.id}>
              <div>
                <strong>
                  {m.from.id === user.id ? `To ${m.to.name}` : `From ${m.from.name}`}
                </strong>
                <div className="muted" style={{ fontSize: ".9rem" }}>
                  {m.body}
                </div>
              </div>
              <span className="muted" style={{ fontSize: ".82rem" }}>
                {m.createdAt.slice(0, 10)}
              </span>
            </div>
          ))
        ))}

      {tab === "addresses" && <Addresses list={addresses} onAdded={(a) => setAddresses((p) => [...p, a])} />}
    </div>
  );
}

function Addresses({
  list,
  onAdded,
}: {
  list: { id: string; line1: string; city: string; country: string }[];
  onAdded: (a: { id: string; line1: string; city: string; country: string }) => void;
}) {
  const toast = useToast();
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addAddress(line1, city, country);
      onAdded({ id: Math.random().toString(36).slice(2), line1, city, country });
      setLine1("");
      setCity("");
      setCountry("");
      toast("Address added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add address");
    }
  };

  return (
    <>
      {list.map((a) => (
        <div className="list-card" key={a.id}>
          <div>
            <strong>{a.line1}</strong>
            <div className="muted" style={{ fontSize: ".9rem" }}>
              {a.city}, {a.country}
            </div>
          </div>
        </div>
      ))}
      <form className="panel" onSubmit={add} style={{ marginTop: 12, maxWidth: 520 }}>
        <h3 style={{ marginTop: 0 }}>Add an address</h3>
        <div className="field">
          <label htmlFor="line1">Street</label>
          <input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        <button className="btn btn-primary">Add address</button>
      </form>
    </>
  );
}
