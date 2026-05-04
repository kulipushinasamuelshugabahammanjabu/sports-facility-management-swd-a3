import bcrypt from "bcryptjs";//for  password hasing 
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { setSession } from "@/lib/session";
import { cleanString, validateEmail } from "@/lib/validation";

export async function POST(request) {
  const body = await request.json();//gets email  and pass from body
  const email = cleanString(body.email).toLowerCase(); //convert the email if it has space bet. 
  const password = body.password || "";

  if (!validateEmail(email) || !password) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
//search from the database for the user with that email
  const rows = await query("SELECT id, name, email, password_hash, role FROM users WHERE email = ?", [email]);
  const user = rows[0];

  //to check is the user exist and check id the password is correcrt 
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
// this will set session from lib/session.js
  await setSession(user);
  //return the data to the front end   , i did not return the password 
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}