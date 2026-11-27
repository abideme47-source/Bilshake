import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { sql } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ error: "Forbidden" }, { status: a.status });
  const { paid } = await req.json();
  await sql`UPDATE orders SET paid=${paid}, paid_at=${paid ? new Date() : null} WHERE id=${params.id}`;
  return NextResponse.json({ ok: true });
}
