import { NextResponse } from "next/server";
import { getSession, projectScopeFilter } from "@/lib/access";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const u = session.user as unknown as Record<string, unknown>;
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (u.role as "SENIOR_DECISION_MAKER" | "DEPARTMENT" | "AGENCY") ?? "AGENCY",
    departmentId: (u.departmentId as string | null) ?? null,
    agencyId: (u.agencyId as string | null) ?? null,
  };

  const scopeFilter = projectScopeFilter(user);

  const projects = await prisma.infrastructureProject.findMany({
    where: { ...scopeFilter },
    select: { id: true, projectName: true, projectId: true },
    orderBy: { projectName: "asc" },
  });

  return NextResponse.json({ projects });
}
