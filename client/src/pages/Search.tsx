import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

type Result = { id: string; name: string; description: string; category: string };

export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setInput(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    let live = true;
    setResults(null);
    setError(false);
    api
      .search(q)
      .then((res) => live && setResults(res.results))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = input.trim();
    setParams(term ? { q: term } : {});
  };

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <h1>Search</h1>
      <form className="search-page-form" role="search" onSubmit={submit}>
        <input
          type="search"
          aria-label="Search products"
          placeholder="Search products…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {!q.trim() ? (
        <p className="muted" style={{ marginTop: 20 }}>
          Type a product name or keyword to search the catalog.
        </p>
      ) : error ? (
        <div className="state">
          <h3>Search is unavailable</h3>
          <p>Something went wrong running that search. Try again.</p>
        </div>
      ) : results === null ? (
        <p className="muted" style={{ marginTop: 20 }}>
          Searching…
        </p>
      ) : results.length === 0 ? (
        <div className="state">
          <h3>No matches for “{q}”</h3>
          <p>Try a different keyword.</p>
        </div>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 16 }}>
            {results.length} result{results.length > 1 ? "s" : ""} for “{q}”
          </p>
          <ul className="search-results">
            {results.map((r) => (
              <li key={r.id} className="search-result">
                <Link to={`/product/${r.id}`} className="search-result-link">
                  <div>
                    <span className="card-cat">{r.category}</span>
                    <h3 className="card-name">{r.name}</h3>
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {r.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
