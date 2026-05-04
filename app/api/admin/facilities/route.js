import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getFacilities } from "@/lib/facilities";
import { requireUser } from "@/lib/session";
import { hasErrors, validateFacility } from "@/lib/validation";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({ facilities: await getFacilities() });
}

export async function POST(request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { values, errors } = validateFacility(await request.json());
  if (hasErrors(errors)) return NextResponse.json({ errors }, { status: 400 });

  const result = await query(
    `INSERT INTO facilities (name, sport_type, description, location, default_capacity, hourly_rate, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      values.name,
      values.sportType,
      values.description,
      values.location,
      values.defaultCapacity,
      values.hourlyRate,
      auth.user.id
    ]
  );

  return NextResponse.json({ id: result.insertId }, { status: 201 });
}
