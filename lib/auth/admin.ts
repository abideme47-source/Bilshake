import { auth } from "@/lib/auth/server";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email?.toLowerCase() || null;
  if (!email) return { ok: false as const, status: 401 as const, email: null };
  if (!adminEmails().includes(email)) return { ok: false as const, status: 403 as const, email };
  return { ok: true as const, status: 200 as const, email };
}
