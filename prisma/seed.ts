import type { Role } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const PASSWORD = "Password@123";

async function createUser(opts: {
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
  designation?: string;
  phone?: string;
  password?: string;
}) {
  const passwordHash = await hashPassword(opts.password ?? PASSWORD);
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    update: {
      name: opts.name,
      role: opts.role,
      companyId: opts.companyId ?? null,
      designation: opts.designation,
      phone: opts.phone,
    },
    create: {
      name: opts.name,
      email: opts.email,
      emailVerified: true,
      role: opts.role,
      companyId: opts.companyId ?? null,
      designation: opts.designation,
      phone: opts.phone,
      accounts: {
        create: {
          accountId: opts.email,
          providerId: "credential",
          password: passwordHash,
        },
      },
    },
  });

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: opts.email,
        providerId: "credential",
        password: passwordHash,
      },
    });
  }
  return user;
}

async function main() {
  console.log("==================================================");
  console.log("🌱 Seeding DRISHTI with Clean Roles, Permissions & Accounts...");
  console.log("==================================================");

  // ── Clean up any legacy conflicting accounts ──
  const legacyUsers = await prisma.user.findMany({
    where: { email: { in: ["amittiwari@example.com", "admin@gmail.com"] } },
    select: { id: true },
  });
  for (const u of legacyUsers) {
    await prisma.session.deleteMany({ where: { userId: u.id } }).catch(() => {});
    await prisma.account.deleteMany({ where: { userId: u.id } }).catch(() => {});
    await prisma.notification.deleteMany({ where: { userId: u.id } }).catch(() => {});
    await prisma.activityLog.deleteMany({ where: { userId: u.id } }).catch(() => {});
    await prisma.userPermissionOverride.deleteMany({ where: { userId: u.id } }).catch(() => {});
    await prisma.task.deleteMany({ where: { createdById: u.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: u.id } }).catch(() => {});
  }

  // ── 1. Sole Authoritative Super Admin (admin@example.com / Password@123) ──
  const superAdmin = await createUser({
    name: "System Administrator",
    email: "admin@example.com",
    role: "MANAGER",
    designation: "Chief System Administrator & Super Admin",
    phone: "+1 (555) 010-9999",
    password: PASSWORD,
  });
  console.log("✓ Sole Super Admin initialized (admin@example.com / Password@123)");

  // ── 2. Academic Years ──
  await prisma.academicYear.upsert({
    where: { label: "2025-26" },
    update: { isActive: false },
    create: {
      label: "2025-26",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2026-06-30"),
      isActive: false,
    },
  });
  await prisma.academicYear.upsert({
    where: { label: "2026-27" },
    update: { isActive: true },
    create: {
      label: "2026-27",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2027-06-30"),
      isActive: true,
    },
  });

  // ── 3. Departments ──
  const departments = [
    { name: "Computer Science", code: "CS" },
    { name: "Information Technology", code: "IT" },
    { name: "Artificial Intelligence & Data Science", code: "AIDS" },
    { name: "Electronics & Communication", code: "ECE" },
  ];
  for (const dept of departments) {
    const existing = await prisma.department.findFirst({
      where: { name: dept.name },
    });
    if (existing) {
      await prisma.department.update({
        where: { id: existing.id },
        data: { code: dept.code },
      });
    } else {
      await prisma.department.create({
        data: dept,
      });
    }
  }

  // ── 4. Technologies ──
  const technologies: Array<[string, string]> = [
    ["React", "Frontend"],
    ["Next.js", "Frontend"],
    ["TypeScript", "Language"],
    ["Node.js", "Backend"],
    ["Python", "Language"],
    ["FastAPI", "Backend"],
    ["Flutter", "Mobile"],
    ["PostgreSQL", "Database"],
    ["MongoDB", "Database"],
    ["Redis", "Database"],
    ["PyTorch", "AI/ML"],
    ["Docker", "DevOps"],
    ["Kubernetes", "DevOps"],
    ["Figma", "Design"],
    ["GraphQL", "Backend"],
  ];
  for (const [name, category] of technologies) {
    await prisma.technology.upsert({
      where: { name },
      update: { category },
      create: { name, category },
    });
  }

  // ── 5. Holidays ──
  const holidays: Array<[string, string]> = [
    ["National Innovation Day", "2026-07-15"],
    ["Independence Day", "2026-08-15"],
    ["Founders Memorial Day", "2026-10-02"],
    ["Festival of Lights", "2026-11-08"],
    ["Winter Recess", "2026-12-25"],
  ];
  for (const [name, date] of holidays) {
    const existing = await prisma.holiday.findFirst({
      where: { name, companyId: null },
    });
    if (!existing) {
      await prisma.holiday.create({
        data: { name, date: new Date(date) },
      });
    }
  }

  // ── 6. Companies & Structure ──
  const companiesData = [
    {
      name: "Apex Innovations",
      slug: "apex-innovations",
      description: "Cloud-native SaaS platforms for supply chain optimization and analytics.",
      industry: "Enterprise Software",
      website: "https://apex-innovations.example.com",
      contactPerson: "Sarah Jenkins",
      contactEmail: "admin.apex@example.com",
      contactPhone: "+1 (555) 101-0001",
      internshipDuration: "12 weeks",
      internshipType: "HYBRID" as const,
      themeColor: "#6366f1",
      techStack: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
      adminName: "Sarah Jenkins",
      coordName: "David Miller",
      mentors: [
        { name: "Elena Rostova", email: "elena.r@example.com", designation: "Staff Software Engineer" },
        { name: "Marcus Vance", email: "marcus.v@example.com", designation: "Senior Backend Architect" },
      ],
      students: [
        { name: "Alex Johnson", email: "alex.j@example.com", roll: "CS26A01", skills: ["TypeScript", "React", "Next.js"] },
        { name: "Samira Khan", email: "samira.k@example.com", roll: "CS26A02", skills: ["Node.js", "PostgreSQL", "Redis"] },
        { name: "Jordan Lee", email: "jordan.l@example.com", roll: "CS26A03", skills: ["Fullstack", "GraphQL", "TailwindCSS"] },
        { name: "Morgan Chen", email: "morgan.c@example.com", roll: "CS26A04", skills: ["React", "UI/UX", "Figma"] },
        { name: "Taylor Brooks", email: "taylor.b@example.com", roll: "CS26A05", skills: ["Node.js", "Docker", "DevOps"] },
      ],
    },
    {
      name: "Nexus Cloud Systems",
      slug: "nexus-cloud-systems",
      description: "Scalable distributed databases, telemetry platforms, and DevOps automation.",
      industry: "Cloud Infrastructure",
      website: "https://nexus-cloud.example.com",
      contactPerson: "Robert Sterling",
      contactEmail: "admin.nexus@example.com",
      contactPhone: "+1 (555) 202-0002",
      internshipDuration: "16 weeks",
      internshipType: "REMOTE" as const,
      themeColor: "#0ea5e9",
      techStack: ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"],
      adminName: "Robert Sterling",
      coordName: "Claire Underwood",
      mentors: [
        { name: "Ananya Sharma", email: "ananya.s@example.com", designation: "Principal Cloud Engineer" },
        { name: "Lucas Dubois", email: "lucas.d@example.com", designation: "DevOps Tech Lead" },
      ],
      students: [
        { name: "Riley Rivera", email: "riley.r@example.com", roll: "IT26N01", skills: ["Python", "FastAPI", "PostgreSQL"] },
        { name: "Aiden Scott", email: "aiden.s@example.com", roll: "IT26N02", skills: ["Docker", "Kubernetes", "CI/CD"] },
        { name: "Zoe Martinez", email: "zoe.m@example.com", roll: "IT26N03", skills: ["Python", "Telemetry", "Prometheus"] },
        { name: "Ethan Wright", email: "ethan.w@example.com", roll: "IT26N04", skills: ["Backend", "Go", "Distributed Systems"] },
        { name: "Maya Lin", email: "maya.l@example.com", roll: "IT26N05", skills: ["Linux", "Cloud Networking", "Bash"] },
      ],
    },
    {
      name: "Quantum Digital Studio",
      slug: "quantum-digital-studio",
      description: "High-performance mobile experiences and intelligent interactive design systems.",
      industry: "Design & Mobile Tech",
      website: "https://quantum-studio.example.com",
      contactPerson: "Jessica Walsh",
      contactEmail: "admin.quantum@example.com",
      contactPhone: "+1 (555) 303-0003",
      internshipDuration: "10 weeks",
      internshipType: "ONSITE" as const,
      themeColor: "#f59e0b",
      techStack: ["Flutter", "React Native", "Figma", "Node.js", "MongoDB"],
      adminName: "Jessica Walsh",
      coordName: "Arthur Pendelton",
      mentors: [
        { name: "Sofia Alvarez", email: "sofia.a@example.com", designation: "Mobile Experience Lead" },
        { name: "Kofi Mensah", email: "kofi.m@example.com", designation: "Senior Design Technologist" },
      ],
      students: [
        { name: "Lucas Campbell", email: "lucas.c@example.com", roll: "AI26Q01", skills: ["Flutter", "Dart", "State Management"] },
        { name: "Emma Watson", email: "emma.w@example.com", roll: "AI26Q02", skills: ["Figma", "UI/UX", "Prototyping"] },
        { name: "Noah Patel", email: "noah.p@example.com", roll: "AI26Q03", skills: ["Flutter", "Firebase", "REST APIs"] },
        { name: "Olivia Davis", email: "olivia.d@example.com", roll: "AI26Q04", skills: ["Mobile Animations", "Canvas", "React Native"] },
        { name: "Liam Wilson", email: "liam.w@example.com", roll: "AI26Q05", skills: ["Node.js", "GraphQL", "Mobile Backends"] },
      ],
    },
  ];

  for (const [idx, comp] of companiesData.entries()) {
    const company = await prisma.company.upsert({
      where: { slug: comp.slug },
      update: {
        name: comp.name,
        description: comp.description,
        industry: comp.industry,
        website: comp.website,
        contactPerson: comp.contactPerson,
        contactEmail: comp.contactEmail,
        contactPhone: comp.contactPhone,
        internshipDuration: comp.internshipDuration,
        internshipType: comp.internshipType,
        themeColor: comp.themeColor,
        techStack: comp.techStack,
      },
      create: {
        name: comp.name,
        slug: comp.slug,
        description: comp.description,
        industry: comp.industry,
        website: comp.website,
        contactPerson: comp.contactPerson,
        contactEmail: comp.contactEmail,
        contactPhone: comp.contactPhone,
        internshipDuration: comp.internshipDuration,
        internshipType: comp.internshipType,
        themeColor: comp.themeColor,
        techStack: comp.techStack,
        createdById: superAdmin.id,
      },
    });

    // ── Company Admin ──
    const compAdmin = await createUser({
      name: comp.adminName,
      email: comp.contactEmail,
      role: "MANAGER",
      companyId: company.id,
      designation: "VP of Engineering & Internship Director",
    });

    // ── Coordinator ──
    const coordinator = await createUser({
      name: comp.coordName,
      email: `coord.${comp.slug.split("-")[0]}@example.com`,
      role: "SENIOR",
      companyId: company.id,
      designation: "Program Coordinator",
    });

    // ── Mentors ──
    const mentorUsers = [];
    for (const m of comp.mentors) {
      const mentor = await createUser({
        name: m.name,
        email: m.email,
        role: "EXECUTIVE",
        companyId: company.id,
        designation: m.designation,
      });
      mentorUsers.push(mentor);
    }

    // ── Batch ──
    let batch = await prisma.batch.findFirst({
      where: { companyId: company.id, name: "Summer Internship Cohort 2026" },
    });
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          companyId: company.id,
          name: "Summer Internship Cohort 2026",
          description: "Flagship summer engineering internship program.",
          startDate: new Date("2026-06-01"),
          endDate: new Date("2026-08-31"),
          status: "ACTIVE",
          createdById: superAdmin.id,
        },
      });
    }

    // ── Students ──
    const studentUsers = [];
    for (const [sIndex, s] of comp.students.entries()) {
      const student = await createUser({
        name: s.name,
        email: s.email,
        role: "INTERN",
        companyId: company.id,
        designation: "Software Engineering Intern",
      });
      studentUsers.push(student);

      await prisma.studentProfile.upsert({
        where: { userId: student.id },
        update: {
          batchId: batch.id,
          rollNumber: s.roll,
          department: "Computer Science & Engineering",
          skills: s.skills,
          githubUrl: `https://github.com/example-${s.email.split("@")[0]}`,
          linkedinUrl: `https://linkedin.com/in/example-${s.email.split("@")[0]}`,
        },
        create: {
          userId: student.id,
          companyId: company.id,
          batchId: batch.id,
          rollNumber: s.roll,
          department: "Computer Science & Engineering",
          skills: s.skills,
          githubUrl: `https://github.com/example-${s.email.split("@")[0]}`,
          linkedinUrl: `https://linkedin.com/in/example-${s.email.split("@")[0]}`,
        },
      });
    }

    // ── Projects ──
    const projectDefs = [
      {
        name: `${comp.name.split(" ")[0]} Core Platform`,
        description: "Core full-stack web workspace with dashboard, telemetry, and workflow controls.",
        objective: "Design and implement scalable microservices and responsive interfaces.",
        techStack: comp.techStack.slice(0, 4),
        difficulty: "INTERMEDIATE" as const,
        deliverables: "1. Responsive Dashboard UI\n2. REST/GraphQL API\n3. Comprehensive Test Suite\n4. Documentation",
        status: "ACTIVE" as const,
        priority: "HIGH" as const,
      },
      {
        name: `${comp.name.split(" ")[0]} Mobile & Analytics`,
        description: "Mobile companion application with real-time sync and metrics reporting.",
        objective: "Build high-performance client applications with offline persistence.",
        techStack: comp.techStack.slice(2, 6),
        difficulty: "ADVANCED" as const,
        deliverables: "1. Cross-platform Mobile App\n2. Background Sync Engine\n3. Export & Reporting Module",
        status: "PLANNING" as const,
        priority: "MEDIUM" as const,
      },
    ];

    for (const [pIndex, def] of projectDefs.entries()) {
      let project = await prisma.project.findFirst({
        where: { companyId: company.id, name: def.name },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            ...def,
            companyId: company.id,
            batchId: batch.id,
            startDate: new Date("2026-06-08"),
            endDate: new Date("2026-08-28"),
            repositoryUrl: `https://github.com/${comp.slug}/${def.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            createdById: superAdmin.id,
          },
        });

        // Repository & RepoLinks
        const repo = await prisma.repository.create({
          data: {
            projectId: project.id,
            name: def.name,
            url: project.repositoryUrl!,
            defaultBranch: "main",
            createdById: superAdmin.id,
          },
        });

        await prisma.repoLink.createMany({
          data: [
            {
              repositoryId: repo.id,
              type: "BRANCH",
              url: `${project.repositoryUrl}/tree/feature/auth-v2`,
              title: "feature/auth-v2 branch",
              addedById: mentorUsers[0].id,
            },
            {
              repositoryId: repo.id,
              type: "PULL_REQUEST",
              url: `${project.repositoryUrl}/pull/14`,
              title: "PR #14: Role-based permissions and audit logging",
              addedById: studentUsers[0].id,
            },
            {
              repositoryId: repo.id,
              type: "COMMIT",
              url: `${project.repositoryUrl}/commit/a1b2c3d4e5f6`,
              title: "feat: add real-time telemetry metrics",
              addedById: studentUsers[1].id,
            },
          ],
        });

        // Mentors & Students on Project
        const assignedMentor = mentorUsers[pIndex % mentorUsers.length];
        await prisma.projectMentor.create({
          data: { projectId: project.id, userId: assignedMentor.id },
        });

        const assignedStudents = pIndex === 0 
          ? studentUsers.slice(0, 3) 
          : studentUsers.slice(2, 5);

        for (const s of assignedStudents) {
          await prisma.projectStudent.upsert({
            where: { projectId_userId: { projectId: project.id, userId: s.id } },
            update: {},
            create: { projectId: project.id, userId: s.id },
          });
        }

        // Milestones
        const m1 = await prisma.milestone.create({
          data: {
            projectId: project.id,
            title: "Phase 1: Architecture & Foundations",
            description: "System design specifications, database migrations, and authentication setup.",
            status: "COMPLETED",
            order: 0,
            dueDate: new Date("2026-06-25"),
            createdById: superAdmin.id,
          },
        });

        const m2 = await prisma.milestone.create({
          data: {
            projectId: project.id,
            title: "Phase 2: Core Feature Implementation",
            description: "Build business logic, API integrations, and user interfaces.",
            status: "IN_PROGRESS",
            order: 1,
            dueDate: new Date("2026-07-28"),
            createdById: superAdmin.id,
          },
        });

        const m3 = await prisma.milestone.create({
          data: {
            projectId: project.id,
            title: "Phase 3: QA, Performance & Handover",
            description: "Load testing, security reviews, user documentation, and final deployment.",
            status: "PENDING",
            order: 2,
            dueDate: new Date("2026-08-25"),
            createdById: superAdmin.id,
          },
        });

        // Team
        const team = await prisma.team.create({
          data: {
            companyId: company.id,
            projectId: project.id,
            name: `${def.name} Team`,
            createdById: superAdmin.id,
          },
        });

        for (const [si, s] of assignedStudents.entries()) {
          await prisma.teamMember.create({
            data: {
              teamId: team.id,
              userId: s.id,
              role:
                si === 0
                  ? "FULLSTACK_DEVELOPER"
                  : si === 1
                  ? "BACKEND_DEVELOPER"
                  : "FRONTEND_DEVELOPER",
              isLeader: si === 0,
            },
          });
        }

        // Tasks & Subtasks
        const task1 = await prisma.task.create({
          data: {
            companyId: company.id,
            projectId: project.id,
            milestoneId: m1.id,
            title: "Configure Database Schema and Migrations",
            description: "Set up PostgreSQL models, indexing strategies, and automated seed pipelines.",
            status: "COMPLETED",
            priority: "HIGH",
            deadline: new Date("2026-06-20"),
            estimatedHours: 16,
            actualHours: 14,
            assigneeId: assignedStudents[0].id,
            createdById: assignedMentor.id,
            completedAt: new Date("2026-06-19"),
          },
        });

        const task2 = await prisma.task.create({
          data: {
            companyId: company.id,
            projectId: project.id,
            milestoneId: m2.id,
            title: "Build Reusable UI Component Library",
            description: "Create accessible form components, tables, filters, and dynamic modal dialogs.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            deadline: new Date("2026-07-20"),
            estimatedHours: 24,
            actualHours: 12,
            assigneeId: assignedStudents[1].id,
            createdById: assignedMentor.id,
          },
        });

        const task3 = await prisma.task.create({
          data: {
            companyId: company.id,
            projectId: project.id,
            milestoneId: m2.id,
            title: "Integrate Audit Activity & Scoring Engine",
            description: "Calculate performance scores and trigger automated nightly snapshot aggregations.",
            status: "REVIEW",
            priority: "URGENT",
            deadline: new Date("2026-07-25"),
            estimatedHours: 20,
            actualHours: 18,
            assigneeId: assignedStudents[0].id,
            createdById: assignedMentor.id,
          },
        });

        const task4 = await prisma.task.create({
          data: {
            companyId: company.id,
            projectId: project.id,
            milestoneId: m3.id,
            title: "End-to-End Test Suite & Load Benchmarking",
            description: "Write automated Playwright E2E tests and benchmark server response latencies.",
            status: "PENDING",
            priority: "MEDIUM",
            deadline: new Date("2026-08-15"),
            estimatedHours: 18,
            assigneeId: assignedStudents[2].id,
            createdById: assignedMentor.id,
          },
        });

        // Subtask
        await prisma.task.create({
          data: {
            companyId: company.id,
            projectId: project.id,
            milestoneId: m2.id,
            parentId: task2.id,
            title: "Implement Multi-Select Filter with Combobox",
            description: "Add keyboard navigation and search debounce.",
            status: "COMPLETED",
            priority: "MEDIUM",
            assigneeId: assignedStudents[1].id,
            createdById: assignedMentor.id,
          },
        });

        // Task Comments
        await prisma.taskComment.create({
          data: {
            taskId: task3.id,
            authorId: assignedMentor.id,
            content: "Great work on the weighted calculation formula. Please ensure edge cases with zero working days are handled.",
          },
        });
        await prisma.taskComment.create({
          data: {
            taskId: task3.id,
            authorId: assignedStudents[0].id,
            content: "Added fallback guards for zero-day edge cases and added unit tests in `scoring.test.ts`.",
          },
        });

        // Daily Logs & Reviews
        for (const [dayOffset, dateStr] of ["2026-07-10", "2026-07-11", "2026-07-12"].entries()) {
          const logDate = new Date(dateStr);
          const student = assignedStudents[0];

          const dailyLog = await prisma.dailyLog.upsert({
            where: { studentId_date: { studentId: student.id, date: logDate } },
            update: {},
            create: {
              studentId: student.id,
              companyId: company.id,
              projectId: project.id,
              taskId: task3.id,
              date: logDate,
              hoursWorked: 7.5,
              description: `Completed implementation of performance scoring algorithms and connected daily metrics snapshot cron pipeline.`,
              achievements: `- Integrated trailing 30-day window scoring formulas.\n- Verified Green/Yellow/Red performance banding heuristics.`,
              blockers: "None. All API endpoints responded within normal SLAs.",
              tomorrowPlan: "Refactor student report export to stream large datasets via ExcelJS.",
              repositoryLink: `${project.repositoryUrl}/pull/14`,
              commitLinks: [`${project.repositoryUrl}/commit/b4d5e6f7`],
              status: "APPROVED",
            },
          });

          await prisma.review.create({
            data: {
              companyId: company.id,
              targetType: "DAILY_LOG",
              targetId: dailyLog.id,
              dailyLogId: dailyLog.id,
              revieweeId: student.id,
              reviewerId: assignedMentor.id,
              verdict: "APPROVED",
              rating: 5,
              feedback: "Comprehensive log with clear verification steps. Keep up the high standard!",
            },
          });

          // Attendance
          await prisma.attendance.upsert({
            where: { userId_date: { userId: student.id, date: logDate } },
            update: {},
            create: {
              userId: student.id,
              companyId: company.id,
              date: logDate,
              loginAt: new Date(`${dateStr}T09:05:00Z`),
              logoutAt: new Date(`${dateStr}T17:35:00Z`),
              workingMinutes: 510,
              status: "PRESENT",
            },
          });

          // Daily Timeline
          await prisma.dailyTimeline.upsert({
            where: { studentId_date: { studentId: student.id, date: logDate } },
            update: {},
            create: {
              studentId: student.id,
              date: logDate,
              loginAt: new Date(`${dateStr}T09:05:00Z`),
              workLogUpdatedAt: new Date(`${dateStr}T17:15:00Z`),
              submittedAt: new Date(`${dateStr}T17:20:00Z`),
              logoutAt: new Date(`${dateStr}T17:35:00Z`),
              workingMinutes: 510,
            },
          });
        }

        // Performance Snapshot for students
        for (const student of assignedStudents) {
          const snapshotDate = new Date("2026-07-12");
          await prisma.performanceSnapshot.upsert({
            where: { studentId_date: { studentId: student.id, date: snapshotDate } },
            update: {},
            create: {
              studentId: student.id,
              companyId: company.id,
              date: snapshotDate,
              submissionScore: 92.5,
              attendanceScore: 95.0,
              taskCompletionScore: 88.0,
              reviewScore: 90.0,
              deadlineScore: 85.0,
              githubScore: 80.0,
              overallScore: 89.2,
              band: "GREEN",
            },
          });
        }
      }
    }

    console.log(`✓ Seeded Company: ${comp.name} (${comp.slug})`);
  }

  // ── 7. Seed Sample Proposals (2026 Plans Pipeline) ──
  const apexCompany = await prisma.company.findFirst({ where: { slug: "apex-innovations" } });
  const mentorUser = await prisma.user.findFirst({ where: { role: "EXECUTIVE", companyId: apexCompany?.id } });
  const coordUser = await prisma.user.findFirst({ where: { role: "SENIOR", companyId: apexCompany?.id } });

  if (apexCompany && superAdmin) {
    await prisma.proposal.createMany({
      data: [
        {
          companyId: apexCompany.id,
          createdById: superAdmin.id,
          title: "Summer 2026 UI/UX & Design Systems Workshop",
          type: "WORKSHOP",
          scheduleType: "MULTI_DAYS",
          locationType: "STUDIO",
          locationName: "Apex Design Studio - Room 401",
          startDate: new Date("2026-07-10"),
          endDate: new Date("2026-07-12"),
          dailyHours: 4,
          totalHours: 12,
          capacity: 30,
          teacherName: "Angela Vance",
          teacherId: mentorUser?.id || null,
          pricing: 150,
          budget: 600,
          description: "A comprehensive 3-day workshop focusing on building scalable design systems, token architecture, Figma-to-code workflows, and high-conversion landing page UX.",
          objectives: "Master component libraries, responsive design tokens, and web performance optimization.",
          targetAudience: "Designers, Frontend Developers, Interns",
          status: "APPROVED",
          reviewFeedback: "Excellent curriculum and well-defined budget. Approved for production across Web, Design, and Marketing tracks.",
          reviewRating: 5,
          reviewerId: coordUser?.id || superAdmin.id,
          reviewedAt: new Date(),
        },
        {
          companyId: apexCompany.id,
          createdById: superAdmin.id,
          title: "Cloud-Native Backend & Microservices Retreat",
          type: "RETREAT",
          scheduleType: "MULTI_DAYS",
          locationType: "OUTDOOR",
          locationName: "Hillside Tech Camp, Pavilion B",
          startDate: new Date("2026-08-05"),
          endDate: new Date("2026-08-08"),
          dailyHours: 6,
          totalHours: 24,
          capacity: 20,
          teacherName: "Marcus Vance",
          pricing: 350,
          budget: 1200,
          description: "Hands-on architectural retreat covering distributed event buses, Redis caching layers, PostgreSQL indexing strategies, and Dockerized microservice deployments.",
          objectives: "Build and deploy resilient microservices with production-grade monitoring.",
          targetAudience: "Backend Developers, System Architects",
          status: "SUBMITTED",
        },
        {
          companyId: apexCompany.id,
          createdById: superAdmin.id,
          title: "Next.js 15 & Modern Web Performance Training",
          type: "TRAINING",
          scheduleType: "ONE_DAY",
          locationType: "STUDIO",
          locationName: "Main Auditorium & Live Stream",
          startDate: new Date("2026-07-25"),
          endDate: new Date("2026-07-25"),
          dailyHours: 6,
          totalHours: 6,
          capacity: 60,
          teacherName: "Gaurav Sharma",
          pricing: 0,
          budget: 200,
          description: "Intensive 1-day deep dive into Next.js 15 Server Components, Turbopack, App Router caching optimizations, and Lighthouse 100 score techniques.",
          objectives: "Optimize Largest Contentful Paint (LCP) and build fast dynamic web applications.",
          targetAudience: "Full Stack Developers, Web Interns",
          status: "DRAFT",
        },
      ],
    });
    console.log("✓ Seeded Sample Proposals (2026 Plans Pipeline)");
  }

  // ── 8. System Roles Demo Accounts & Role-Specific Tasks ──
  const apexComp = await prisma.company.findFirst({ where: { slug: "apex-innovations" } });
  const apexId = apexComp?.id ?? null;
  const sampleProject = await prisma.project.findFirst({
    where: apexId ? { companyId: apexId } : {},
  });
  const projectId = sampleProject?.id ?? null;

  const teacherUser = await createUser({
    name: "Prof. Sarah Williams",
    email: "teacher@example.com",
    role: "SENIOR",
    companyId: apexId,
    designation: "Lead Course Faculty & Teacher",
    phone: "+1 (555) 748-0001",
    password: PASSWORD,
  });

  const financeUser = await createUser({
    name: "David Fincher",
    email: "finance@example.com",
    role: "EXECUTIVE",
    companyId: apexId,
    designation: "Head of Finance & Budgeting",
    phone: "+1 (555) 748-0002",
    password: PASSWORD,
  });

  const designerUser = await createUser({
    name: "Maya Lin",
    email: "designer@example.com",
    role: "EXECUTIVE",
    companyId: apexId,
    designation: "Principal UI/UX Designer",
    phone: "+1 (555) 748-0003",
    password: PASSWORD,
  });

  const instructorUser = await createUser({
    name: "James Wilson",
    email: "instructor@example.com",
    role: "EXECUTIVE",
    companyId: apexId,
    designation: "Technical Workshop Instructor",
    phone: "+1 (555) 748-0004",
    password: PASSWORD,
  });

  const scheduleUser = await createUser({
    name: "Rachel Green",
    email: "schedule@example.com",
    role: "SENIOR",
    companyId: apexId,
    designation: "Operations & Schedule Manager",
    phone: "+1 (555) 748-0005",
    password: PASSWORD,
  });
  console.log("✓ Initialized System Roles (Teacher, Finance, Designer, Instructor, Schedule Manager)");

  // ── Seed Role-Specific Tasks ──
  if (apexId && projectId) {
    const roleTasks = [
      // Teacher Tasks
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: teacherUser.id,
        title: "Review CS Curriculum Syllabus & Assessment Rubrics",
        description: "Evaluate course modules, assignment deadlines, and performance evaluation sheets.",
        status: "PENDING" as const,
        priority: "HIGH" as const,
        estimatedHours: 8,
      },
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: teacherUser.id,
        title: "Prepare Mid-Term Technical Evaluation Sheet",
        description: "Compile student milestones and rubric criteria for mid-term defense.",
        status: "IN_PROGRESS" as const,
        priority: "MEDIUM" as const,
        estimatedHours: 6,
      },
      // Finance Tasks
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: financeUser.id,
        title: "Q3 Internship Stipend & Budget Allocation Review",
        description: "Review and approve stipend disbursements, cloud hosting costs, and tool subscriptions.",
        status: "IN_PROGRESS" as const,
        priority: "URGENT" as const,
        estimatedHours: 10,
      },
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: financeUser.id,
        title: "Audit Cloud Tool Invoices & License Subscriptions",
        description: "Cross-reference AWS, Vercel, and GitHub Enterprise invoices against departmental budgets.",
        status: "PENDING" as const,
        priority: "HIGH" as const,
        estimatedHours: 4,
      },
      // Designer Tasks
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: designerUser.id,
        title: "Design System Tokens & Sticky-Note Kanban Board UI",
        description: "Create pastel paper palettes, shadow elevations, rotation transforms, and badge styles.",
        status: "IN_PROGRESS" as const,
        priority: "URGENT" as const,
        estimatedHours: 12,
      },
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: designerUser.id,
        title: "Create High-Fidelity Mobile Responsive Layout Mockups",
        description: "Ensure touch targets, drawer menus, and collapsible sidebars comply with accessibility guidelines.",
        status: "REVIEW" as const,
        priority: "HIGH" as const,
        estimatedHours: 8,
      },
      // Instructor Tasks
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: instructorUser.id,
        title: "Setup Docker & PostgreSQL Lab Environments for Students",
        description: "Provision seed databases, Docker Compose configs, and verify dev ports.",
        status: "IN_PROGRESS" as const,
        priority: "HIGH" as const,
        estimatedHours: 6,
      },
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: instructorUser.id,
        title: "Draft Hands-On Next.js 15 REST API Exercise Handouts",
        description: "Prepare step-by-step workshop guide covering Server Actions and optimistic UI.",
        status: "PENDING" as const,
        priority: "MEDIUM" as const,
        estimatedHours: 5,
      },
      // Schedule Manager Tasks
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: scheduleUser.id,
        title: "Finalize Multi-Day Tech Workshop Timetable & Room Bookings",
        description: "Reserve studio halls, configure live-stream calendar invites, and assign presenters.",
        status: "IN_PROGRESS" as const,
        priority: "HIGH" as const,
        estimatedHours: 6,
      },
      {
        companyId: apexId,
        projectId,
        createdById: superAdmin.id,
        assigneeId: scheduleUser.id,
        title: "Coordinate Semester Milestone Schedules & Demo Days",
        description: "Align mentor review schedules with university holiday calendar.",
        status: "PENDING" as const,
        priority: "URGENT" as const,
        estimatedHours: 4,
      },
    ];

    for (const t of roleTasks) {
      const existing = await prisma.task.findFirst({
        where: { title: t.title, assigneeId: t.assigneeId },
      });
      if (!existing) {
        await prisma.task.create({ data: t });
      }
    }
    console.log("✓ Seeded Role-Specific Assigned Tasks (Teacher, Finance, Designer, Instructor, Schedule Manager)");
  }

  // ── 9. Permissions Seeding ──
  const { PERMISSION_DEFINITIONS, DEFAULT_ROLE_PERMISSIONS } = await import("../src/lib/permissions");
  
  for (const p of PERMISSION_DEFINITIONS) {
    await prisma.systemPermission.upsert({
      where: { code: p.code },
      update: {
        category: p.category,
        name: p.name,
        description: p.description,
      },
      create: {
        code: p.code,
        category: p.category,
        name: p.name,
        description: p.description,
      },
    });
  }

  for (const [roleName, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = roleName as Role;
    for (const def of PERMISSION_DEFINITIONS) {
      const allowed = role === "MANAGER" ? true : perms.includes(def.code);
      await prisma.rolePermission.upsert({
        where: {
          role_permissionCode: {
            role,
            permissionCode: def.code,
          },
        },
        create: {
          role,
          permissionCode: def.code,
          allowed,
        },
        update: {},
      });
    }
  }
  console.log("✓ Seeded System Permissions & Default Role Permission Matrix");

  // ── 10. Notifications & Activity Logs ──
  const allUsers = await prisma.user.findMany({ take: 10 });
  for (const user of allUsers) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "GENERAL",
        title: "Welcome to DRISHTI",
        message: "Your development workspace has been successfully provisioned with sample internship data.",
        isRead: false,
      },
    });
  }

  console.log("\n==================================================");
  console.log("🎉 DRISHTI SEED & ROLE INITIALIZATION COMPLETE!");
  console.log("==================================================");
  console.log("Sole Super Admin Account:");
  console.log("  • Email:             admin@example.com");
  console.log("  • Password:          Password@123\n");
  console.log("Role Demo Accounts (Password: Password@123):");
  console.log("  • Super Admin:       admin@example.com");
  console.log("  • Teacher:           teacher@example.com");
  console.log("  • Finance:           finance@example.com");
  console.log("  • Designer:          designer@example.com");
  console.log("  • Instructor:        instructor@example.com");
  console.log("  • Schedule Manager:  schedule@example.com");
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
