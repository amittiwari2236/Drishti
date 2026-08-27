import type { Metadata } from "next";
import { requireRole, companyScope } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = { title: "New Project" };

export default async function NewProjectPage() {
  const user = await requireRole("SUPER_ADMIN", "COMPANY_ADMIN");
  const scope = await companyScope(user);

  const [batches, companies] = await Promise.all([
    prisma.batch.findMany({
      where: scope ? { companyId: scope } : {},
      select: { id: true, name: true },
      orderBy: { startDate: "desc" },
    }),
    user.role === "SUPER_ADMIN" && !scope
      ? prisma.company.findMany({
          where: { status: "ACTIVE" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve(undefined),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        title="New project"
        description="Define the project scope, stack, and timeline. Assign people afterwards."
      />
      <ProjectForm batches={batches} companies={companies} />
    </div>
  );
}
