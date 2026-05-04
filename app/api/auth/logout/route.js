import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  await clearSession();//help to delete the session 
  return NextResponse.json({ ok: true });
}