import { NextResponse } from "next/server";
import { getAdminReport } from "@/lib/reports";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);

    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const report = await getAdminReport();

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load admin report",
        details: error.message
      },
      { status: 500 }
    );
  }
}