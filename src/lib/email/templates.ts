import "server-only";

export type NotificationType =
  | "DAILY_REMINDER"
  | "TASK_ASSIGNED"
  | "TASK_REMINDER"
  | "REVIEW_REQUESTED"
  | "REVIEW_COMPLETED"
  | "DEADLINE_REMINDER"
  | "MISSED_REPORT"
  | "INACTIVE_ALERT"
  | "GENERAL"
  | "SYSTEM"
  | "LOGIN_REMINDER"
  | "WORK_LOG_REMINDER"
  | "SUBMISSION_REMINDER"
  | "SUBMISSION_CONFIRMED"
  | "PROJECT_ASSIGNED"
  | "UPDATE_SUBMITTED"
  | "UPDATE_REVIEWED";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.BETTER_AUTH_URL?.trim() ||
  "http://localhost:3005";

/** Per-notification-type email metadata. */
const TYPE_META: Record<
  NotificationType,
  { subject: string; action: string; key: string }
> = {
  DAILY_REMINDER: { subject: "Submit your daily report", action: "Log today's work", key: "daily_reminder" },
  TASK_ASSIGNED: { subject: "A task was assigned to you", action: "View task", key: "task_assigned" },
  TASK_REMINDER: { subject: "Task reminder", action: "View task", key: "task_reminder" },
  REVIEW_REQUESTED: { subject: "Work is ready for your review", action: "Open review queue", key: "review_requested" },
  REVIEW_COMPLETED: { subject: "Your work was reviewed", action: "View feedback", key: "review_completed" },
  DEADLINE_REMINDER: { subject: "Upcoming deadline", action: "View task", key: "deadline_reminder" },
  MISSED_REPORT: { subject: "Missed daily report", action: "Submit report", key: "missed_report" },
  INACTIVE_ALERT: { subject: "We miss your updates", action: "Open DRISHTI", key: "inactive_alert" },
  GENERAL: { subject: "DRISHTI notification", action: "Open DRISHTI", key: "general" },
  SYSTEM: { subject: "DRISHTI system notice", action: "Open DRISHTI", key: "system" },
  // Daily workflow
  LOGIN_REMINDER: { subject: "Good morning — please login and acknowledge your tasks", action: "Go to Dashboard", key: "login_reminder" },
  WORK_LOG_REMINDER: { subject: "Please update your daily work log", action: "Update Work Log", key: "worklog_reminder" },
  SUBMISSION_REMINDER: { subject: "Please submit today's internship work before 6:30 PM", action: "Submit Report", key: "submission_reminder" },
  SUBMISSION_CONFIRMED: { subject: "Daily report submitted successfully", action: "View Report", key: "submission_confirmed" },
  PROJECT_ASSIGNED: { subject: "New Project Assigned", action: "View Project", key: "project_assigned" },
  UPDATE_SUBMITTED: { subject: "New Progress Update Submitted", action: "View Update", key: "update_submitted" },
  UPDATE_REVIEWED: { subject: "Progress Update Reviewed", action: "View Feedback", key: "update_reviewed" },
};

export type EmailContent = { subject: string; html: string };

function layout({
  title,
  message,
  actionLabel,
  actionUrl,
  recipientName,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
  recipientName?: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#0f172a;padding:20px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.5px;">DRISHTI</span>
                <span style="color:#94a3b8;font-size:12px;margin-left:8px;">Internship Management Platform</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${recipientName ? `<p style="margin:0 0 12px;color:#334155;font-size:14px;">Hi ${escapeHtml(recipientName)},</p>` : ""}
                <h1 style="margin:0 0 12px;color:#0f172a;font-size:20px;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">${escapeHtml(message)}</p>
                <a href="${actionUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px;font-weight:600;">${escapeHtml(actionLabel)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #e5e7eb;background:#f8fafc;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                  Department of Computer Science · Software Development Cell<br/>
                  You're receiving this because you have an account on DRISHTI.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Build the subject + HTML for a notification email. Looks up a DB
 * `EmailTemplate` override by key first (supports {{title}}, {{message}},
 * {{name}}, {{link}} placeholders), otherwise renders the built-in layout.
 */
export async function renderNotificationEmail(params: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  recipientName?: string;
}): Promise<EmailContent> {
  const meta = TYPE_META[params.type] ?? TYPE_META.GENERAL;
  const actionUrl = params.link
    ? `${APP_URL.replace(/\/$/, "")}${params.link.startsWith("/") ? "" : "/"}${params.link}`
    : APP_URL;

  return {
    subject: `${params.title} · DRISHTI`,
    html: layout({

      title: params.title,
      message: params.message,
      actionLabel: meta.action,
      actionUrl,
      recipientName: params.recipientName,
    }),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
