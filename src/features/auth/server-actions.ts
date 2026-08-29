"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fetchPragyaAPI } from "@/lib/pragya-api";
import { v4 as uuidv4 } from "uuid";

export async function loginWithPragya(email: string, passwordHash: string) {
  // --- BYPASS FOR DUMMY ACCOUNTS ---
  if (email.endsWith("@example.com")) {
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      return { error: "Dummy account not found in database." };
    }
    
    // Create Custom Session manually
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const cookieStore = await cookies();

    cookieStore.set("drishti_user_id", dbUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
    
    // Set a dummy pragya token so dashboard knows it's a local demo
    cookieStore.set("pragya_jwt", "DUMMY_TOKEN_FOR_DEMO", { path: "/" });

    return { success: true };
  }
  // ---------------------------------

  // 1. Call Pragya API Login
  const res = await fetchPragyaAPI("login", undefined, { email, password: passwordHash });
  
  if (!res.status) {
    return { error: res.message || "Invalid credentials" };
  }

  // 2. Extract Token and Profile
  const token = res.access_token || res.data?.access_token || res.token || res.data?.token;
  if (!token) {
    return { error: "Login succeeded but no token received from API" };
  }

  // 3. Save Pragya JWT to cookies
  const cookieStore = await cookies();
  cookieStore.set("pragya_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // 4. Sync User to Prisma
  // We need to fetch profile and role concurrently
  const [profileRes, roleRes] = await Promise.all([
    fetchPragyaAPI("get-profile", token),
    fetchPragyaAPI("my-role", token)
  ]);

  let name = email.split('@')[0];
  let phone = null;
  
  if (profileRes.status && profileRes.data) {
    name = profileRes.data.name || profileRes.data.username || name;
    phone = profileRes.data.mobile || profileRes.data.phone || null;
  }

  let role = "INTERN";
  let designation = "Staff";
  let departmentId = null;

  if (roleRes.status && roleRes.data) {
    const rData = roleRes.data;
    designation = rData.role || rData.name || "Staff";
    departmentId = rData.department_id ? String(rData.department_id) : null;
    const level = rData.hierarchy_level || 3;
    
    if (level === 1) role = "MANAGER";
    else if (level === 2) role = "SENIOR";
    else if (level === 3) role = "EXECUTIVE";
  }

  let dbUser = await prisma.user.findUnique({ where: { email } });
  
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        designation,
        role: role as any,
      }
    });
  } else {
    // Update existing user with latest role from API
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { name, phone, designation, role: role as any }
    });
  }

  // 5. Create Custom Session since Better Auth hashes session tokens
  cookieStore.set("drishti_user_id", dbUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { success: true };
}
