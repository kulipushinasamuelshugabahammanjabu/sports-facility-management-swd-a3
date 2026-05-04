import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { hasErrors, validateFacility } from "@/lib/validation";

export async function PUT(request, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const { values, errors } = validateFacility(await request.json());
  if (hasErrors(errors)) return NextResponse.json({ errors }, { status: 400 });

  await query(
    `UPDATE facilities
     SET name = ?, sport_type = ?, description = ?, location = ?, default_capacity = ?, hourly_rate = ?
     WHERE id = ?`,
    [values.name, values.sportType, values.description, values.location, values.defaultCapacity, values.hourlyRate, id]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const events = await query("SELECT id FROM events WHERE facility_id = ? LIMIT 1", [id]);
  if (events.length) {
    return NextResponse.json(
      { error: "This facility is already used by an event, so it cannot be deleted." },
      { status: 400 }
    );
  }

  const result = await query("DELETE FROM facilities WHERE id = ?", [id]);
  if (result.affectedRows === 0) return NextResponse.json({ error: "Facility not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
