"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function loginWithPragya(email: string, passwordHash: string) {
  // Bypassed Pragya API completely as requested.
  return { error: "API Login is currently disabled. Please use the Demo Login options." };
}

export async function mockSuperAdminLogin() {
  try {
    const cookieStore = await cookies();
    const email = "admin@example.com";
    
    let dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          name: "System Administrator",
          phone: "0000000000",
          designation: "Chief System Administrator & Super Admin",
          departmentId: null,
          hierarchyLevel: 1,
          role: "MANAGER",
        }
      });
    } else {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { hierarchyLevel: 1, role: "MANAGER" }
      });
    }

    // Set user ID cookie
    cookieStore.set("drishti_user_id", dbUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // Ensure they are NOT acting as any sub-role
    cookieStore.delete("drishti_active_role");

    return { success: true, user: { name: dbUser.name, role: dbUser.role } };
  } catch (error: any) {
    console.error("mockSuperAdminLogin error:", error);
    return { error: error.message || "An error occurred during super admin login" };
  }
}

export async function mockRoleLogin(context: {
  roleId: number | string;
  roleName: string;
  hierarchyLevel: number;
  departmentId: string | number;
  isSubRole: boolean;
}) {
  try {
    const cookieStore = await cookies();
    const email = "demo-teacher@example.com";
    
    let dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          name: context.roleName || "Demo User",
          phone: "1111111111",
          designation: context.roleName || "Demo Staff Member",
          departmentId: null,
          hierarchyLevel: 3,
          role: "EXECUTIVE", // Strictly a teacher/staff role, not a MANAGER
        }
      });
    } else {
      // Ensure they don't have MANAGER role and update name
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { 
          name: context.roleName || "Demo User",
          designation: context.roleName || "Demo Staff Member",
          hierarchyLevel: 3, 
          role: "EXECUTIVE" 
        }
      });
    }

    // Set user ID cookie
    cookieStore.set("drishti_user_id", dbUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // Actively set their role context so permissions apply
    cookieStore.set("drishti_active_role", JSON.stringify(context), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return { success: true, user: { name: dbUser.name, role: dbUser.role } };
  } catch (error: any) {
    console.error("mockRoleLogin error:", error);
    return { error: error.message || "An error occurred during role login" };
  }
}

export async function logoutWithPragya() {
  const cookieStore = await cookies();
  cookieStore.delete("pragya_jwt");
  cookieStore.delete("drishti_user_id");
  cookieStore.delete("drishti_active_role");
  return { success: true };
}

export async function switchActiveRoleContext(context: {
  roleId: number | string;
  roleName: string;
  hierarchyLevel: number;
  departmentId: string | number;
  isSubRole: boolean;
}) {
  const cookieStore = await cookies();
  cookieStore.set("drishti_active_role", JSON.stringify(context), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return { success: true };
}

export async function clearActiveRoleContext() {
  const cookieStore = await cookies();
  cookieStore.delete("drishti_active_role");
  return { success: true };
}
