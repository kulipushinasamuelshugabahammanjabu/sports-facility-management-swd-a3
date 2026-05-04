import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cleanString, validateEmail } from "@/lib/validation";

export async function PUT(request, { params }) {

     //check if the user is logged and admin role 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const name = cleanString(body.name);
  const email = cleanString(body.email).toLowerCase();
  const role = ["admin", "organiser", "attendee"].includes(body.role) ? body.role : "attendee";
  const errors = {};


  //validate at the backend 
  if (name.length < 2) 
    errors.name = "Name must be at least 2 characters.";
  
  if (!validateEmail(email)) 
    errors.email = "Enter a valid email address.";
  
  if (Object.keys(errors).length)
     return NextResponse.json({ errors }, { status: 400 });
//update in the datatbase 
  await query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [name, email, role, id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
     //check if the user is logged and admin role 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  //what if we delete our own id
  if (Number(id) === auth.user.id) 
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });

  //delete the user 
  const result = await query("DELETE FROM users WHERE id = ?", [id]);

  //check if the user exist 
  if (result.affectedRows === 0) return NextResponse.json({ error: "User not found." }, { status: 404 });
  //else 
  return NextResponse.json({ ok: true });
}