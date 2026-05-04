import { cookies } from "next/headers";
import { query } from "@/lib/db";


//i have  defiend 4 cookies to store the data 
const SESSION_COOKIES = {
  id: "sportspace_user_id",
  name: "sportspace_user_name",
  email: "sportspace_user_email",
  role: "sportspace_user_role"
};

const cookieOptions = {
  httpOnly: true,// only in httponly and not in javascript 
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24,// for 24 hours 
  path: "/"// cookie will work on all route 
};








//we set session 
export async function setSession(user) {
  const cookieStore = await cookies();

 //so when a user logs or register  this funtion will store the info in 4 separate cookie
  cookieStore.set(SESSION_COOKIES.id, String(user.id), cookieOptions);
  cookieStore.set(SESSION_COOKIES.name, user.name, cookieOptions);
  cookieStore.set(SESSION_COOKIES.email, user.email, cookieOptions);
  cookieStore.set(SESSION_COOKIES.role, user.role, cookieOptions);
}



//this is to clearn off the cookie when the user logsout 
export async function clearSession() {
  const cookieStore = await cookies();
  Object.values(SESSION_COOKIES).forEach((cookieName) => cookieStore.delete(cookieName));
}




//read the userID from the cookie then gets the user info
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIES.id)?.value);

  if (!Number.isInteger(userId)) return null;

  //we verify the user role from the database
  const rows = await query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [userId]
  );

  return rows[0] || null;
}



// i need this function to check the role in api
export async function requireUser(roles = []) {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in.", status: 401 };

 
  if (roles.length && !roles.includes(user.role)) {
    return { error: "You do not have permission to perform this action.", status: 403 };
  }
  return { user };
}
