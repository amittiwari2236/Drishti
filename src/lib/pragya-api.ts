import { cookies } from "next/headers";

export const fetchPragyaAPI = async (action: string, customToken?: string, extraData?: Record<string, string>) => {
  try {
    const f = new FormData();
    f.append('action', action);
    
    if (extraData) {
      for (const [key, value] of Object.entries(extraData)) {
        f.append(key, value);
      }
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    const token = customToken || (await cookies()).get('pragya_jwt')?.value;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Allow overriding via environment variable, fallback to prod site
    const apiUrl = process.env.PRAGYA_API_URL || 'https://pragya-yog.com/api_teacher.php';
    const res = await fetch(apiUrl, {
      method: 'POST',
      body: f,
      headers,
      next: { revalidate: 60 } // Reduced revalidate for real-time stats
    });
    
    const data = await res.json();
    return data; // Return full object so caller can see data.status and data.message
  } catch (error) {
    return { status: false, message: "Network error", data: [] };
  }
};

export async function syncRolesToUsers() {
  const { prisma } = await import("@/lib/prisma");
  const res = await fetchPragyaAPI("departments");
  if (!res?.status || !res.data) return;

  const roles = res.data.flatMap((d: any) => d.roles || []);
  
  for (const r of roles) {
    const email = `role_${r.id}@demo.com`;
    const rLevel = r.hierarchy_level || 4;
    let enumRole: "MANAGER" | "SENIOR" | "EXECUTIVE" | "INTERN" = "INTERN";
    
    if (rLevel === 1) enumRole = "MANAGER";
    else if (rLevel === 2) enumRole = "SENIOR";
    else if (rLevel === 3) enumRole = "EXECUTIVE";
    
    const data = {
      name: r.name || r.role,
      designation: r.name || r.role,
      hierarchyLevel: rLevel,
      role: enumRole,
      departmentId: null, // or mapping if needed
    };
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({ where: { email }, data });
    } else {
      await prisma.user.create({ data: { ...data, email, phone: "1111111111" } });
    }
  }
}
