import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getFacilities } from "@/lib/facilities";
import { requireUser } from "@/lib/session";
import { hasErrors, validateFacility } from "@/lib/validation";
//handles the GET and POST 
//only the admin can create a facility in the sportspace 


//get all the facilities from the database 
export async function GET() {
    //check if the user is logged in and has a admin role 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
//we return the facilities from the database 
  return NextResponse.json({ facilities: await getFacilities() });
}


//to create a new facility 
export async function POST(request) {
    //check if the user is admin 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
//return any error if the feild is invalid 
  const { values, errors } = validateFacility(await request.json());
  if (hasErrors(errors)) return NextResponse.json({ errors }, { status: 400 });

  //insert the new facility
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
