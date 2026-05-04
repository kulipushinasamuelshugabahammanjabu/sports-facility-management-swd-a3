import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getEvents } from "@/lib/events";
import { getFacilityById } from "@/lib/facilities";
import { requireUser } from "@/lib/session";
import { hasErrors, validateEvent } from "@/lib/validation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json({ events: await getEvents({ search: searchParams.get("search") || "" }) });
}


//create a new event 
export async function POST(request) {

  //only organiser and admin can create event 
  const auth = await requireUser(["organiser", "admin"]);
 
 //if the user is not loggged in  and also if he doesn't have the correct role
  if (auth.error)
     return NextResponse.json({ error: auth.error }, { status: auth.status });



  const { values, errors } = validateEvent(await request.json());


  if (hasErrors(errors))
     return NextResponse.json({ errors }, { status: 400 });


//to check if the selected  facility is in the database
  const facility = await getFacilityById(values.facilityId);
  if (!facility) {
    return NextResponse.json({ errors: { facilityId: "Choose a facility added by the admin." } }, { status: 400 });
  }


  //so we insert a new event into the database
  const result = await query(
    `INSERT INTO events (facility_id, organiser_id, title, description, location, event_date, capacity, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      values.facilityId,
      auth.user.id,
      values.title,
      values.description,
      facility.location,
      values.eventDate,
      facility.defaultCapacity,
      facility.hourlyRate
    ]
  );

  return NextResponse.json({ id: result.insertId }, { status: 201 });
}
