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
