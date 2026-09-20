import { NextResponse } from "next/server";
import { callAuroraDirector } from "@/lib/aurora-director";

export async function POST(request) {
  const token = process.env.AURORA_MCP_TOKEN?.trim();
  const auth = request.headers.get("authorization") || "";
  if (!token) return NextResponse.json({ error: "AURORA_MCP_TOKEN is not configured" }, { status: 503 });
  if (auth !== `Bearer ${token}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (typeof body?.instruction !== "string" || !body.instruction.trim()) {
    return NextResponse.json({ error: "instruction is required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await callAuroraDirector({
      instruction: body.instruction.trim(),
      context: body.context && typeof body.context === "object" ? body.context : undefined,
    }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
