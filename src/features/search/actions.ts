"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

export type SearchHit = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
};

export type SearchResults = {
  projects: SearchHit[];
  states: SearchHit[];
  ministries: SearchHit[];
  agencies: SearchHit[];
};

/** Global search across the main infrastructure entities. */
export async function globalSearch(query: string): Promise<SearchResults> {
  await requireUser();
  
  const q = query.trim();
  const empty: SearchResults = {
    projects: [],
    states: [],
    ministries: [],
    agencies: [],
  };
  
  if (q.length < 2) return empty;

  const contains = { contains: q, mode: "insensitive" as const };

  const [projects, states, ministries, agencies] = await Promise.all([
    prisma.infrastructureProject.findMany({
      where: { projectName: contains },
      select: { id: true, projectName: true, projectStatus: true },
      take: 5,
    }),
    prisma.state.findMany({
      where: { name: contains },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.ministry.findMany({
      where: { name: contains },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.implementingAgency.findMany({
      where: { name: contains },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
  ]);

  return {
    projects: projects.map((p) => ({
      id: p.id,
      label: p.projectName,
      sublabel: p.projectStatus,
      href: `/projects/${p.id}`,
    })),
    states: states.map((s) => ({
      id: s.id,
      label: s.name,
      sublabel: s.code,
      href: `/states/${s.id}`,
    })),
    ministries: ministries.map((m) => ({
      id: m.id,
      label: m.name,
      sublabel: m.code,
      href: `/ministries/${m.id}`,
    })),
    agencies: agencies.map((a) => ({
      id: a.id,
      label: a.name,
      sublabel: a.code,
      href: `/agencies/${a.id}`,
    })),
  };
}
