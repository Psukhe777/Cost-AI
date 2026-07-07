import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user.id);
  const { apiSecret: _apiSecret, ...safeUser } = data.user;

  return NextResponse.json({
    ok: true,
    user: safeUser,
    metrics: data.metrics
  });
}
