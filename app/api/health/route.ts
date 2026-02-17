import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars exist (don't reveal values)
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.DIRECT_URL = process.env.DIRECT_URL ? "set" : "MISSING";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "MISSING";
  checks.NODE_ENV = process.env.NODE_ENV || "undefined";

  // Test database connection
  try {
    const userCount = await prisma.user.count();
    checks.database = `connected (${userCount} users)`;
  } catch (err) {
    checks.database = `FAILED: ${err instanceof Error ? err.message : "unknown"}`;
  }

  const ok = checks.DATABASE_URL === "set" && checks.AUTH_SECRET === "set" && checks.database.startsWith("connected");

  return NextResponse.json({ ok, checks });
}
