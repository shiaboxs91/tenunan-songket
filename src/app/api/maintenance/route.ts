import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET - Check maintenance status
export async function GET() {
  const cookieStore = await cookies();
  const maintenanceMode = cookieStore.get("maintenanceMode")?.value === "true";
  
  return NextResponse.json({ 
    maintenanceMode,
    envMode: process.env.MAINTENANCE_MODE === "true"
  });
}

// POST - Toggle maintenance mode (sets a server-side cookie)
export async function POST(request: Request) {
  try {
    const { enabled } = await request.json();
    
    const response = NextResponse.json({ 
      success: true, 
      maintenanceMode: enabled 
    });
    
    // Set cookie that will be readable by middleware
    response.cookies.set("maintenanceMode", String(enabled), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false, // Allow client-side reading
      sameSite: "lax",
    });
    
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
