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

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value || 0));
}

export default function EventsBrowser() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const user = useMemo(() => getStoredUser(), []);

  async function loadEvents(nextSearch = search) {
    setLoading(true);
    const response = await fetch(`/api/event?search=${encodeURIComponent(nextSearch)}`);
    const data = await response.json();
    setEvents(data.events || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/event?search=")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setEvents(data.events || []);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadEvents(search);
  }

  async function bookEvent(eventId) {
    setMessage("");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Login as an attendee before booking.");
      return;
    }

    setMessage("Booking confirmed.");
    await loadEvents(search);
  }

  return (
    <main className="page-shell">
      <section className="page-hero compact-hero">
        <div>
          <div className="section-kicker">Facilities, events, and tournaments</div>
          <h1>Book pitches, courts, pools, and sport events</h1>
          <p>
            Search available SportSpace activities, view capacity and price, then join as an attendee.
          </p>
        </div>
        {(user?.role === "organiser" || user?.role === "admin") && (
          <Link className="btn btn-primary" href="/organiser">
            Create event
          </Link>
        )}
      </section>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search sport, facility, tournament, or location"
        />
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      {message && <div className="notice">{message}</div>}

      <section className="event-grid" aria-live="polite">
        {loading ? (
          <div className="empty-state">Loading events...</div>
        ) : events.length ? (
          events.map((item) => (
            <article className="event-card" key={item.id}>
              <div className="card-topline">
                <span className="event-date">{formatDate(item.eventDate)}</span>
                <span className="sport-badge">{item.sportType}</span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>

              <dl className="detail-grid">
                <div>
                  <dt>Facility</dt>
                  <dd>{item.facilityName}</dd>
                </div>
                <div>
                  <dt>Sport</dt>
                  <dd>{item.sportType}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{item.location}</dd>
                </div>
                <div>
                  <dt>Organiser</dt>
                  <dd>{item.organiserName}</dd>
                </div>
                <div>
                  <dt>Places</dt>
                  <dd>{Number(item.spacesLeft)} left</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{formatMoney(item.price)}</dd>
                </div>
              </dl>

              <button
                className="btn btn-primary btn-wide"
                type="button"
                disabled={!user || user.role !== "attendee" || Number(item.spacesLeft) <= 0}
                onClick={() => bookEvent(item.id)}
              >
                {Number(item.spacesLeft) <= 0 ? "Fully booked" : "Book place"}
              </button>
            </article>
          ))
        ) : (
          <div className="empty-state">No matching events found.</div>
        )}
      </section>
    </main>
  );
}
