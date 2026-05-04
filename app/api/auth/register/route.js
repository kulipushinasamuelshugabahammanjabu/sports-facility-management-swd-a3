import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { setSession } from "@/lib/session";
import { hasErrors, validateRegistration } from "@/lib/validation";

//this file is created to support the sign up page like to create a new user 

export async function POST(request) {
  const { values, errors } = validateRegistration(await request.json());
  if (hasErrors(errors)) 
    return NextResponse.json({ errors }, { status: 400 });

// cheak if th email exist 
  const existing = await query("SELECT id FROM users WHERE email = ?", [values.email]);
  //if it return empty then this wont run 
  if (existing.length) {
    return NextResponse.json({ errors: { email: "This email is already registered." } }, { status: 409 });
  }

  //so we cant store the password in plain text becasue so security . so we hash it 
  const passwordHash = await bcrypt.hash(values.password, 10);//it will hash for 10 rounds 
  const result = await query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [values.name, values.email, passwordHash, values.role]//insert in database 
  );

  const user = { id: result.insertId, name: values.name, email: values.email, role: values.role };
  await setSession(user);//sets session 
  return NextResponse.json({ user }, { status: 201 });
}