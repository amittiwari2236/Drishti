import "server-only";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";

type LogActivityInput = {
  userId: string;
  companyId?: string | null;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: unknown;
};

/** Fire-and-forget audit log writer. Never throws into the caller. */
export async function logActivity(_input: LogActivityInput) {
  // Placeholder audit logger
}

