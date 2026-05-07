"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredUser } from "@/components/Navigation";

const titleRegex = /^[A-Za-z0-9\s'-]{4,}$/;

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value || 0));
}

function validateEventForm(values) {
  const errors = {};
  if (!values.facilityId) errors.facilityId = "Choose one admin-added facility.";
  if (!titleRegex.test(values.title.trim())) errors.title = "Use at least 4 letters or numbers.";
  if (values.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }
  if (!values.eventDate) errors.eventDate = "Choose a date and time.";
  return errors;
}

export default function OrganiserTools() {
  const user = useMemo(() => getStoredUser(), []);
  const [facilities, setFacilities] = useState([]);
  const [values, setValues] = useState({
    facilityId: "",
    title: "",
    description: "",
    eventDate: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedFacility = facilities.find((facility) => String(facility.id) === values.facilityId);
  const groupedFacilities = facilities.reduce((groups, facility) => {
    const sport = facility.sportType || "Other";
    return {
      ...groups,
      [sport]: [...(groups[sport] || []), facility],
    };
  }, {});

  useEffect(() => {
    async function loadFacilities() {
      const response = await fetch("/api/facilities");
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Login as an organiser or admin to create events.");
      } else {
        setFacilities(data.facilities || []);
      }
      setLoading(false);
    }

    loadFacilities();
  }, []);

  function updateField(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitEvent(event) {
    event.preventDefault();
    const nextErrors = validateEventForm(values);
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;

    const response = await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      setErrors(data.errors || {});
      setMessage(data.error || "The event could not be created.");
      return;
    }

    setMessage("Event created successfully.");
    setValues({ facilityId: "", title: "", description: "", eventDate: "" });
  }

  return (
    <main className="page-shell">
      <section className="page-hero compact-hero">
        <div>
          <div className="section-kicker">Organiser tools</div>
          <h1>Create tournaments from admin-approved facilities</h1>
          <p>
            Pick a facility from the dropdown, then SportSpace uses that facility location,
            capacity, and price when the event is saved.
          </p>
        </div>
      </section>

      {user && <div className="notice">Signed in as {user.name} ({user.role}).</div>}
      {message && <div className={message.includes("success") ? "notice notice-success" : "notice"}>{message}</div>}

      <section className="split-layout">
        <form className="management-panel stacked-form" onSubmit={submitEvent}>
          <h2>Create event or tournament</h2>

          <label>
            Admin-added facility
            <select name="facilityId" value={values.facilityId} onChange={updateField} disabled={loading}>
              <option value="">Choose a facility</option>
              {Object.entries(groupedFacilities).map(([sport, sportFacilities]) => (
                <optgroup label={sport} key={sport}>
                  {sportFacilities.map((facility) => (
                    <option value={facility.id} key={facility.id}>
                      {facility.name} - {facility.location}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.facilityId && <p className="field-error">{errors.facilityId}</p>}
          </label>

          <label>
            Event title
            <input
              name="title"
              value={values.title}
              onChange={updateField}
              placeholder="Friday Five-a-Side Tournament"
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={values.description}
              onChange={updateField}
              placeholder="Explain who can participate and what the event is for."
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </label>

          <label>
            Date and time
            <input name="eventDate" type="datetime-local" value={values.eventDate} onChange={updateField} />
            {errors.eventDate && <p className="field-error">{errors.eventDate}</p>}
          </label>

          <button className="btn btn-primary btn-wide" type="submit">
            Save event
          </button>
        </form>

        <aside className="preview-panel">
          <h2>Facility preview</h2>
          {selectedFacility ? (
            <dl className="detail-grid">
              <div>
                <dt>Name</dt>
                <dd>{selectedFacility.name}</dd>
              </div>
              <div>
                <dt>Sport</dt>
                <dd>{selectedFacility.sportType}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{selectedFacility.location}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{selectedFacility.defaultCapacity}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{formatMoney(selectedFacility.hourlyRate)}</dd>
              </div>
            </dl>
          ) : (
            <p>Choose a facility to preview the location, capacity, and price.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
