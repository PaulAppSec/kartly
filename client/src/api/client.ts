export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  sellerId: string | null;
  createdAt: string;
}

export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  body: string;
  rating: number;
  createdAt: string;
  author: { id: string; name: string };
}

export interface OrderItem {
  id: string;
  qty: number;
  unitPrice: number;
  product: { id: string; name: string; imageUrl: string | null } | null;
}

export interface Order {
  id: string;
  total: number;
  status: string;
  couponCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface Message {
  id: string;
  body: string;
  createdAt: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function readCsrfCookie(): string {
  const m = document.cookie.match(/(?:^|;\s*)kartly_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-CSRF-Token"] = readCsrfCookie();

  const res = await fetch(path, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  // catalog
  listProducts: (params?: { q?: string; category?: string; sort?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.category && params.category !== "All") qs.set("category", params.category);
    if (params?.sort) qs.set("sort", params.sort);
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<{ products: Product[] }>("GET", `/api/products${suffix}`);
  },
  getProduct: (id: string) => request<{ product: Product }>("GET", `/api/products/${id}`),
  // Product search. Hits GET /api/search?q= (returns id/name/description/category).
  // The term is URL-encoded in transit and decoded server-side — normal queries
  // return matches; the server's raw-SQL search path is unchanged.
  search: (q: string) =>
    request<{ results: { id: string; name: string; description: string; category: string }[] }>(
      "GET",
      `/api/search?q=${encodeURIComponent(q)}`,
    ),
  listReviews: (id: string) => request<{ reviews: Review[] }>("GET", `/api/products/${id}/reviews`),
  addReview: (id: string, body: string, rating: number) =>
    request<{ review: Review }>("POST", `/api/products/${id}/reviews`, { body, rating }),

  // auth
  register: (email: string, password: string, name: string) =>
    request<{ user: User; csrfToken: string }>("POST", "/api/auth/register", { email, password, name }),
  login: (email: string, password: string) =>
    request<{ user: User; csrfToken: string }>("POST", "/api/auth/login", { email, password }),
  refresh: () => request<{ user: User; csrfToken: string }>("POST", "/api/auth/refresh"),
  logout: () => request<{ ok: true }>("POST", "/api/auth/logout"),
  forgotPassword: (email: string) =>
    request<{ ok: true; message: string }>("POST", "/api/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    request<{ ok: true; message: string }>("POST", "/api/auth/reset-password", { token, password }),

  // account
  me: () => request<{ user: User }>("GET", "/api/me"),
  updateMe: (patch: Partial<Pick<User, "name" | "bio" | "avatarUrl">>) =>
    request<{ user: User }>("PATCH", "/api/me", patch),
  listAddresses: () =>
    request<{ addresses: { id: string; line1: string; city: string; country: string }[] }>("GET", "/api/me/addresses"),
  addAddress: (line1: string, city: string, country: string) =>
    request<{ address: unknown }>("POST", "/api/me/addresses", { line1, city, country }),

  // orders / checkout
  listOrders: () => request<{ orders: Order[] }>("GET", "/api/orders"),
  getOrder: (id: string) => request<{ order: Order }>("GET", `/api/orders/${id}`),
  checkout: (items: { productId: string; qty: number }[], couponCode?: string) =>
    request<{ order: Order }>("POST", "/api/orders", { items, couponCode }),

  // messages
  inbox: () => request<{ messages: Message[] }>("GET", "/api/messages"),
  sendMessage: (toId: string, body: string) =>
    request<{ message: Message }>("POST", "/api/messages", { toId, body }),

  // seller
  sellerProducts: () => request<{ products: Product[] }>("GET", "/api/seller/products"),
  createProduct: (input: { name: string; description: string; price: number; stock: number; category: string }) =>
    request<{ product: Product }>("POST", "/api/seller/products", input),
  getAnnouncement: () => request<{ template: string }>("GET", "/api/seller/announcement"),
  setAnnouncement: (template: string) =>
    request<{ template: string }>("POST", "/api/seller/announcement", { template }),
};
