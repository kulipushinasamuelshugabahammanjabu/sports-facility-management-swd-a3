import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";


//fetch all the booking for logged in user 
export async function GET() {

    // check if he user is logged in and is attendee and admin 
  const auth = await requireUser(["attendee", "admin"]);


  if (auth.error) 
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  //admin see all booking , and the attendee see only thier 
  const where = auth.user.role === "admin" ? "" : "WHERE b.attendee_id = ?";
  
  const args = auth.user.role === "admin" ? [] : [auth.user.id];
 
  const bookings = await query(
    `SELECT b.id, b.status, b.created_at AS createdAt, e.title, e.location, e.event_date AS eventDate
     FROM bookings b JOIN events e ON e.id = b.event_id ${where} ORDER BY b.created_at DESC`,
    args
  );

  return NextResponse.json({ bookings });
}



//attendee joind=s and books an event 
export async function POST(request) {
  
    // we set it so that the users that are loggedin only can book events
    const auth = await requireUser(["attendee"]);
 
 
    if (auth.error)
         return NextResponse.json({ error: auth.error }, { status: auth.status });

    //get the event id from body
  const { eventId } = await request.json();
  const id = Number(eventId);
 
 
  if (!Number.isInteger(id))
     return NextResponse.json({ error: "Choose a valid event." }, { status: 400 });

  //check if the event exist has spots left 
  const rows = await query(
    `SELECT e.id, e.capacity, COUNT(CASE WHEN b.status = 'booked' THEN 1 END) AS bookedCount
     FROM events e LEFT JOIN bookings b ON b.event_id = e.id WHERE e.id = ? GROUP BY e.id`,
    [id]
  );

  const event = rows[0];
  if (!event) 
    return NextResponse.json({ error: "Event not found." }, { status: 404 });

  if (event.bookedCount >= event.capacity)
     return NextResponse.json({ error: "This event is full." }, { status: 400 });


  //insert booking record 
  await query(
    "INSERT INTO bookings (event_id, attendee_id, status) VALUES (?, ?, 'booked') ON DUPLICATE KEY UPDATE status = 'booked', updated_at = CURRENT_TIMESTAMP",
    [id, auth.user.id]
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
