import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron / scheduled-job endpoints for DRISHTI.
 *   GET /api/cron/audit-overruns — inspect projects with expenditure > originalCost
 *   GET /api/cron/health         — database and platform connectivity check
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const url = new URL(req.url);
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ job: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { job } = await params;

  if (job === "health") {
    const projectCount = await prisma.infrastructureProject.count();
    return NextResponse.json({ ok: true, job, status: "healthy", projectCount });
  }

  if (job === "audit-overruns") {
    const projects = await prisma.infrastructureProject.findMany({
      where: { deletedAt: null },
      select: { id: true, projectId: true, projectName: true, originalCost: true, expenditure: true },
    });
    const overruns = projects.filter((p) => p.expenditure > p.originalCost);
    return NextResponse.json({ ok: true, job, checked: projects.length, overruns: overruns.length });
  }

  return NextResponse.json({ ok: true, job, message: "Job completed" });
}

