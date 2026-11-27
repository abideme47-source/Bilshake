import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { sql } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ error: "Forbidden" }, { status: a.status });
  const { status } = await req.json();
  if (!["pending","cooking","ready"].includes(status)) return NextResponse.json({ error: "Bad status" }, { status: 400 });
  await sql`UPDATE orders SET status=${status} WHERE id=${params.id}`;
  return NextResponse.json({ ok: true });
}
