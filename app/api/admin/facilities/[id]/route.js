import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { hasErrors, validateFacility } from "@/lib/validation";

//handles the  PUT and DELETE 

export async function PUT(request, { params }) {
  //check if the user is logged and admin role 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });


  //get the facility id 
  const { id } = await params;

  //to validate the inputs 
  const { values, errors } = validateFacility(await request.json());
  if (hasErrors(errors)) return NextResponse.json({ errors }, { status: 400 });


  //update the facility in datsbase 
  await query(
    `UPDATE facilities
     SET name = ?, 
     sport_type = ?, 
     description = ?, location = ?, 
     default_capacity = ?, hourly_rate = ?
     WHERE id = ?`,
    [values.name,
       values.sportType, values.description,
        values.location, values.defaultCapacity,
         values.hourlyRate, id]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
    //check if the user is logged and admin role 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });



  const { id } = await params;

  //to check if the facility is in use
  const events = await query("SELECT id FROM events WHERE facility_id = ? LIMIT 1", [id]);
  
  //then wevreturn error 
  if (events.length) {
    return NextResponse.json(
      { error: "This facility is already used by an event, so it cannot be deleted." },
      { status: 400 }
    );
  }
// else we delete 
  const result = await query("DELETE FROM facilities WHERE id = ?", [id]);
  if (result.affectedRows === 0) return NextResponse.json({ error: "Facility not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
