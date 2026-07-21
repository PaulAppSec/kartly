import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ejs from "ejs";
import { env } from "./env.js";

// Local "mailer": renders a server-side EJS email template and writes the
// result to a local outbox dir (nothing is actually sent — Kartly never makes
// outbound connections, per the §7 safety rails). In dev we also log a link so
// flows like password reset are demoable.

const VIEWS = [
  resolve(process.cwd(), "server/src/views"),
  resolve(process.cwd(), "src/views"),
].find(existsSync);

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  template: string; // e.g. "password-reset" → views/email/password-reset.ejs
  data: Record<string, unknown>;
}): Promise<void> {
  if (!VIEWS) return;
  const file = resolve(VIEWS, "email", `${opts.template}.ejs`);
  const html = await ejs.renderFile(file, { subject: opts.subject, to: opts.to, ...opts.data });

  try {
    if (!existsSync(env.outboxDir)) mkdirSync(env.outboxDir, { recursive: true });
    const name = `${Date.now()}-${slug(opts.subject)}.html`;
    await writeFile(resolve(env.outboxDir, name), html);
    console.log(`kartly:mail → "${opts.subject}" to ${opts.to} (outbox/${name})`);
  } catch (err) {
    console.warn("kartly:mail write failed", err);
  }
}
