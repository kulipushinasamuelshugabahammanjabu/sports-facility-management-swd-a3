"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const USER_KEY = "sportspace_current_user";

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const user = window.localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    function refreshUser() {
      setUser(getStoredUser());
    }

    const timer = window.setTimeout(refreshUser, 0);
    window.addEventListener("sportspace-user-change", refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("sportspace-user-change", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearStoredUser();
    window.dispatchEvent(new Event("sportspace-user-change"));
    router.push("/login");
  }

  const links = [
    { href: "/", label: "Home", roles: [] },
    { href: "/events", label: "Events", roles: [] },
    { href: "/dashboard", label: "Dashboard", roles: ["attendee", "organiser", "admin"] },
    { href: "/organiser", label: "Organiser", roles: ["organiser", "admin"] },
    { href: "/admin", label: "Admin", roles: ["admin"] },
  ].filter((link) => !link.roles.length || link.roles.includes(user?.role));

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/">
          <span className="brand-icon" aria-hidden="true">S</span>
          <span>SportSpace</span>
        </Link>

        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="role-chip">{user.role}</span>
              <button className="btn btn-ghost" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" href="/login">
                Login
              </Link>
              <Link className="btn btn-primary" href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
