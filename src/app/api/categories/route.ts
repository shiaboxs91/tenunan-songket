
import { NextResponse } from "next/server";
import { getCategoryCounts } from "@/lib/supabase/products";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategoryCounts();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
