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

    const headers: HeadersInit = {};
    const token = customToken || (await cookies()).get('pragya_jwt')?.value;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('https://pragya-yog.com/api_teacher.php', {
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
