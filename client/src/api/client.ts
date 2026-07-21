export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

// Thin API client. Same-origin in production (Express serves the SPA); the
// Vite dev server proxies /api to the backend.
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const api = {
  listProducts: () => getJson<{ products: Product[] }>("/api/products"),
};
