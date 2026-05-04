import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getEventById } from "@/lib/events";
import { getFacilityById } from "@/lib/facilities";
import { requireUser } from "@/lib/session";
import { hasErrors, validateEvent } from "@/lib/validation";

async function canManage(user, id) {

    //we fetch the event from the database
  const event = await getEventById(id);

  //check if th event exist 
  if (!event) 
    return { error: "Event not found.", status: 404 };

//admin can manage any event
//organiser can only manage thier own event
  if (user.role !== "admin" && event.organiserId !== user.id) {
    return { error: "You can only manage your own events and tournaments.", status: 403 };
  }
  //if user has persion then we return event data
  return { event };
}


//get the single event by id 
export async function GET(_request, { params }) {
    //extract the event from event id 
  const { id } = await params;


  const event = await getEventById(id);

  //check if th event exist 
  if (!event) 
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json({ event });
}


//to update an existing event 
export async function PUT(request, { params }) {
    //only the admin and organiser can update an event 

  const auth = await requireUser(["organiser", "admin"]);
  //check the above and return 
  if (auth.error) 
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  const access = await canManage(auth.user, id);
  if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });

  const { values, errors } = validateEvent(await request.json());

  if (hasErrors(errors)) 
    return NextResponse.json({ errors }, { status: 400 });


  //check if the facility exist inthe database 
  const facility = await getFacilityById(values.facilityId);
  if (!facility) {
    return NextResponse.json({ errors: { facilityId: "Choose a facility added by the admin." } }, { status: 400 });
  }


  //check the capicity of the booking , if u have 10 capicity and 10 booked u cant edit the event capicity to reduce to 5 when the booking is confirmed for 10
  if (facility.defaultCapacity < access.event.bookedCount) {
    return NextResponse.json({ errors: { facilityId: "This facility capacity is below current bookings." } }, { status: 400 });
  }

  //we update the event 
  await query(
    `UPDATE events
     SET facility_id = ?, title = ?, description = ?, location = ?, event_date = ?, capacity = ?, price = ?
     WHERE id = ?`,
    [
      values.facilityId,
      values.title,
      values.description,
      facility.location,
      values.eventDate,
      facility.defaultCapacity,
      facility.hourlyRate,
      id
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
     //only the admin and organiser can delete  an event 
  const auth = await requireUser(["organiser", "admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const access = await canManage(auth.user, id);
  if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });

  //delete the booking from te database 
  await query("DELETE FROM events WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
