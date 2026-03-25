import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "server_status")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch server status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: data.value });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { is_active } = await request.json();

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    const supabase = getAnonClient();

    // Get current status first
    const { data: current } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "server_status")
      .single();

    const currentValue = (current?.value as Record<string, unknown>) || {};

    const newValue = {
      ...currentValue,
      is_active,
      expired_at: is_active ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("site_settings")
      .update({ value: newValue, updated_at: new Date().toISOString() })
      .eq("key", "server_status")
      .select("value")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update server status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: data.value });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
