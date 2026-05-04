import { NextResponse } from "next/server";
import { getFacilities } from "@/lib/facilities";
import { requireUser } from "@/lib/session";

export async function GET() {
    //cheack if the user is logged in and has organiser or admin as the role 
  const auth = await requireUser(["organiser", "admin"]);
  
  if (auth.error)  
    return NextResponse.json({ error: auth.error }, { status: auth.status });


//fetch all facilities from database and return 
  return NextResponse.json({ facilities: await getFacilities() });
}
