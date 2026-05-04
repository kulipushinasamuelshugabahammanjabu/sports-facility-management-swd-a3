import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";


//cencel a booking 
export async function PATCH(_request, { params }) {

//check if the user is logged in as attendee or admin
//attendee can cancel his 
//admin can cancel  any booking 


  const auth = await requireUser(["attendee", "admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

// delete based on role 
  const sql = auth.user.role === "admin"
    ? "UPDATE bookings SET status = 'cancelled' WHERE id = ?"
    : "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND attendee_id = ?";
  const args = auth.user.role === "admin" ? [id] : [id, auth.user.id];
  const result = await query(sql, args);


  // the booking needs to effect else it doesnt exist
  if (result.affectedRows === 0) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
