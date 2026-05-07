"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getStoredUser } from "@/components/Navigation";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Dashboard() {
  const user = useMemo(() => getStoredUser(), []);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  async function loadBookings() {
    const response = await fetch("/api/bookings");
    const data = await response.json();
    if (response.ok) {
      setBookings(data.bookings || []);
    } else if (user?.role === "attendee" || user?.role === "admin") {
      setMessage(data.error || "Could not load bookings.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (user) {
      fetch("/api/bookings")
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (cancelled) return;
          if (ok) {
            setBookings(data.bookings || []);
          } else if (user.role === "attendee" || user.role === "admin") {
            setMessage(data.error || "Could not load bookings.");
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function cancelBooking(id) {
    const response = await fetch(`/api/bookings/${id}`, { method: "PATCH" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not cancel booking.");
      return;
    }
    setMessage("Booking cancelled.");
    await loadBookings();
  }

  if (!user) {
    return (
      <main className="page-shell">
        <section className="page-hero compact-hero">
          <div>
            <div className="section-kicker">Dashboard</div>
            <h1>Login to see your tools</h1>
            <p>Role-based dashboards are shown after the cookie session is created.</p>
          </div>
          <Link className="btn btn-primary" href="/login">
            Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-hero compact-hero">
        <div>
          <div className="section-kicker">Dashboard</div>
          <h1>Welcome back, {user.name}</h1>
          <p>Your current role is {user.role}. The backend checks this role again using cookies.</p>
        </div>
      </section>

      <section className="stats-grid">
        <Link className="action-tile" href="/events">
          <span>Browse</span>
          <strong>Events and tournaments</strong>
        </Link>
        {(user.role === "organiser" || user.role === "admin") && (
          <Link className="action-tile" href="/organiser">
            <span>Create</span>
            <strong>Organiser event</strong>
          </Link>
        )}
        {user.role === "admin" && (
          <Link className="action-tile" href="/admin">
            <span>Manage</span>
            <strong>Facilities and users</strong>
          </Link>
        )}
      </section>

      {message && <div className="notice">{message}</div>}

      {(user.role === "attendee" || user.role === "admin") && (
        <section className="management-panel">
          <div className="panel-heading">
            <h2>{user.role === "admin" ? "All bookings" : "My bookings"}</h2>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.title}</td>
                    <td>{formatDate(booking.eventDate)}</td>
                    <td>{booking.location}</td>
                    <td>
                      <span className={`status-pill ${booking.status}`}>{booking.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-small" type="button" onClick={() => cancelBooking(booking.id)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan="5">No bookings yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
