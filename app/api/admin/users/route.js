import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
       import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";
    import { cleanString, validateEmail } from "@/lib/validation";

export async function GET() {

     //check if the user is logged and admin role 
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const users = await query("SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC");
  return NextResponse.json({ users });
}


//create a new user

export async function POST(request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const name = cleanString(body.name);
  const email = cleanString(body.email).toLowerCase();
  const password = body.password || "";
  const role = ["admin", "organiser", "attendee"].includes(body.role) ? body.role : "attendee";
  const errors = {};

  //validation 
  if (name.length < 2) 
    errors.name = "Name must be at least 2 characters.";
  
  if (!validateEmail(email))
     errors.email = "Enter a valid email address.";

  if (password.length < 8)
     errors.password = "Password must be at least 8 characters.";

  if (Object.keys(errors).length) 
    return NextResponse.json({ errors }, { status: 400 });

  //hash password and inseert user 
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [name, email, passwordHash, role]);
  return NextResponse.json({ id: result.insertId }, { status: 201 });
}