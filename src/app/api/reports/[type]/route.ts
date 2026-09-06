import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import { requireUser, projectScopeFilter } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PROJECT_STATUS_LABELS } from "@/config/labels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xlsxResponse(buffer: ArrayBuffer, filename: string) {
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await requireUser();
  if (!can(user.role, "report:generate")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const scope = projectScopeFilter(user);
  const { type } = await params;
  const stamp = format(new Date(), "yyyy-MM-dd");

  if (type === "projects") {
    const projects = await prisma.infrastructureProject.findMany({
      where: { ...scope, deletedAt: null },
      include: {
        state: { select: { name: true } },
        ministry: { select: { name: true } },
        department: { select: { name: true } },
        agency: { select: { name: true } },
        sector: { select: { name: true } },
      },
      orderBy: { projectName: "asc" },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Infrastructure Projects");
    ws.columns = [
      { header: "Project ID", key: "projectId", width: 16 },
      { header: "Project Name", key: "name", width: 34 },
      { header: "State", key: "state", width: 18 },
      { header: "Ministry", key: "ministry", width: 28 },
      { header: "Department", key: "dept", width: 24 },
      { header: "Agency", key: "agency", width: 24 },
      { header: "Sector", key: "sector", width: 18 },
      { header: "Sanction Cost (₹ Cr)", key: "cost", width: 20 },
      { header: "Expenditure (₹ Cr)", key: "expenditure", width: 20 },
      { header: "Physical Progress (%)", key: "progress", width: 20 },
      { header: "Status", key: "status", width: 18 },
    ];
    ws.getRow(1).font = { bold: true };
    projects.forEach((p) => {
      ws.addRow({
        projectId: p.projectId,
        name: p.projectName,
        state: p.state.name,
        ministry: p.ministry.name,
        dept: p.department?.name ?? "Unassigned",
        agency: p.agency?.name ?? "Pending Assignment",
        sector: p.sector.name,
        cost: p.originalCost,
        expenditure: p.expenditure,
        progress: `${p.physicalProgress}%`,
        status: PROJECT_STATUS_LABELS[p.projectStatus] || p.projectStatus,
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    return xlsxResponse(buffer, `drishti-projects-${stamp}.xlsx`);
  }

  if (type === "summary") {
    const [total, delayed, critical, completed, onTrack] = await Promise.all([
      prisma.infrastructureProject.count({ where: { ...scope, deletedAt: null } }),
      prisma.infrastructureProject.count({ where: { ...scope, projectStatus: "DELAYED", deletedAt: null } }),
      prisma.infrastructureProject.count({ where: { ...scope, projectStatus: "CRITICAL", deletedAt: null } }),
      prisma.infrastructureProject.count({ where: { ...scope, projectStatus: "COMPLETED", deletedAt: null } }),
      prisma.infrastructureProject.count({ where: { ...scope, projectStatus: "ON_TRACK", deletedAt: null } }),
    ]);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const ink = rgb(0.1, 0.1, 0.12);
    const muted = rgb(0.45, 0.45, 0.5);

    page.drawText("DRISHTI — National Infrastructure Summary", {
      x: 50,
      y: 780,
      size: 20,
      font: bold,
      color: ink,
    });
    page.drawText(`Generated on ${format(new Date(), "d MMM yyyy, HH:mm")} · PAIMANA / SIH26103`, {
      x: 50,
      y: 758,
      size: 10,
      font,
      color: muted,
    });

    const rows: [string, string][] = [
      ["Total Monitored Projects", String(total)],
      ["On-Track Projects", String(onTrack)],
      ["Delayed Projects", String(delayed)],
      ["Critical Projects", String(critical)],
      ["Completed Projects", String(completed)],
    ];
    let y = 700;
    rows.forEach(([label, value]) => {
      page.drawText(label, { x: 50, y, size: 13, font, color: ink });
      page.drawText(value, { x: 400, y, size: 13, font: bold, color: ink });
      y -= 30;
    });

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="drishti-summary-${stamp}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 404 });
}

