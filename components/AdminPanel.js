"use client";

import { useEffect, useState } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyFacility = {
  name: "",
  sportType: "Football",
  description: "",
  location: "",
  defaultCapacity: 10,
  hourlyRate: 25,
};

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "attendee",
};

function validateFacility(values) {
  const errors = {};
  if (values.name.trim().length < 3) errors.name = "Facility name must be at least 3 characters.";
  if (values.description.trim().length < 10) errors.description = "Description must be at least 10 characters.";
  if (values.location.trim().length < 3) errors.location = "Location is required.";
  if (Number(values.defaultCapacity) < 1) errors.defaultCapacity = "Capacity must be at least 1.";
  if (Number(values.hourlyRate) < 0) errors.hourlyRate = "Price cannot be negative.";
  return errors;
}

function validateUser(values, isEdit) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (!emailRegex.test(values.email.trim().toLowerCase())) errors.email = "Enter a valid email address.";
  if (!isEdit && values.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
}

export default function AdminPanel() {
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [facilityForm, setFacilityForm] = useState(emptyFacility);
  const [userForm, setUserForm] = useState(emptyUser);
  const [facilityEditId, setFacilityEditId] = useState(null);
  const [userEditId, setUserEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  async function loadAdminData() {
    const [facilityResponse, userResponse] = await Promise.all([
      fetch("/api/admin/facilities"),
      fetch("/api/admin/users"),
    ]);

    const facilityData = await facilityResponse.json();
    const userData = await userResponse.json();

    if (!facilityResponse.ok || !userResponse.ok) {
      setMessage(facilityData.error || userData.error || "Login as admin to manage the system.");
      return;
    }

    setFacilities(facilityData.facilities || []);
    setUsers(userData.users || []);
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetch("/api/admin/facilities"), fetch("/api/admin/users")])
      .then(async ([facilityResponse, userResponse]) => {
        const facilityData = await facilityResponse.json();
        const userData = await userResponse.json();
        return { facilityResponse, userResponse, facilityData, userData };
      })
      .then(({ facilityResponse, userResponse, facilityData, userData }) => {
        if (cancelled) return;
        if (!facilityResponse.ok || !userResponse.ok) {
          setMessage(facilityData.error || userData.error || "Login as admin to manage the system.");
          return;
        }
        setFacilities(facilityData.facilities || []);
        setUsers(userData.users || []);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateFacility(event) {
    setFacilityForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function updateUser(event) {
    setUserForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function saveFacility(event) {
    event.preventDefault();
    const nextErrors = validateFacility(facilityForm);
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;

    const url = facilityEditId ? `/api/admin/facilities/${facilityEditId}` : "/api/admin/facilities";
    const method = facilityEditId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facilityForm),
    });
    const data = await response.json();

    if (!response.ok) {
      setErrors(data.errors || {});
      setMessage(data.error || "Facility could not be saved.");
      return;
    }

    setFacilityForm(emptyFacility);
    setFacilityEditId(null);
    setMessage("Facility saved.");
    await loadAdminData();
  }

  async function removeFacility(id) {
    if (!window.confirm("Delete this facility?")) return;
    const response = await fetch(`/api/admin/facilities/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Facility could not be deleted.");
      return;
    }
    setMessage("Facility deleted.");
    await loadAdminData();
  }

  async function saveUser(event) {
    event.preventDefault();
    const nextErrors = validateUser(userForm, Boolean(userEditId));
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;

    const url = userEditId ? `/api/admin/users/${userEditId}` : "/api/admin/users";
    const method = userEditId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    const data = await response.json();

    if (!response.ok) {
      setErrors(data.errors || {});
      setMessage(data.error || "User could not be saved.");
      return;
    }

    setUserForm(emptyUser);
    setUserEditId(null);
    setMessage("User saved.");
    await loadAdminData();
  }

  async function removeUser(id) {
    if (!window.confirm("Delete this user?")) return;
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "User could not be deleted.");
      return;
    }
    setMessage("User deleted.");
    await loadAdminData();
  }

  return (
    <main className="page-shell">
      <section className="page-hero compact-hero">
        <div>
          <div className="section-kicker">Admin area</div>
          <h1>Manage SportSpace facilities and users</h1>
          <p>Only admin cookie sessions can read, create, update, or delete these records.</p>
        </div>
      </section>

      {message && <div className="notice">{message}</div>}

      <section className="stats-grid">
        <div className="action-tile">
          <span>Facilities</span>
          <strong>{facilities.length} active records</strong>
        </div>
        <div className="action-tile">
          <span>Users</span>
          <strong>{users.length} accounts</strong>
        </div>
        <div className="action-tile">
          <span>Control</span>
          <strong>Admin-only CRUD</strong>
        </div>
      </section>

      <section className="admin-grid">
        <form className="management-panel stacked-form" onSubmit={saveFacility}>
          <div className="panel-heading">
            <h2>{facilityEditId ? "Edit facility" : "Add facility"}</h2>
            {facilityEditId && (
              <button
                className="btn btn-small"
                type="button"
                onClick={() => {
                  setFacilityForm(emptyFacility);
                  setFacilityEditId(null);
                }}
              >
                Clear
              </button>
            )}
          </div>

          <label>
            Facility name
            <input name="name" value={facilityForm.name} onChange={updateFacility} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </label>
          <label>
            Sport type
            <select name="sportType" value={facilityForm.sportType} onChange={updateFacility}>
              <option>Football</option>
              <option>Basketball</option>
              <option>Badminton</option>
              <option>Swimming</option>
              <option>Volleyball</option>
              <option>Rugby</option>
            </select>
          </label>
          <label>
            Description
            <textarea name="description" value={facilityForm.description} onChange={updateFacility} />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </label>
          <label>
            Location
            <input name="location" value={facilityForm.location} onChange={updateFacility} />
            {errors.location && <p className="field-error">{errors.location}</p>}
          </label>
          <div className="form-row">
            <label>
              Capacity
              <input
                name="defaultCapacity"
                type="number"
                min="1"
                value={facilityForm.defaultCapacity}
                onChange={updateFacility}
              />
              {errors.defaultCapacity && <p className="field-error">{errors.defaultCapacity}</p>}
            </label>
            <label>
              Price
              <input
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={facilityForm.hourlyRate}
                onChange={updateFacility}
              />
              {errors.hourlyRate && <p className="field-error">{errors.hourlyRate}</p>}
            </label>
          </div>
          <button className="btn btn-primary btn-wide" type="submit">
            Save facility
          </button>
        </form>

        <form className="management-panel stacked-form" onSubmit={saveUser}>
          <div className="panel-heading">
            <h2>{userEditId ? "Edit user" : "Add user"}</h2>
            {userEditId && (
              <button
                className="btn btn-small"
                type="button"
                onClick={() => {
                  setUserForm(emptyUser);
                  setUserEditId(null);
                }}
              >
                Clear
              </button>
            )}
          </div>

          <label>
            Name
            <input name="name" value={userForm.name} onChange={updateUser} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </label>
          <label>
            Email
            <input name="email" type="email" value={userForm.email} onChange={updateUser} />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </label>
          {!userEditId && (
            <label>
              Password
              <input name="password" type="password" value={userForm.password} onChange={updateUser} />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </label>
          )}
          <label>
            Role
            <select name="role" value={userForm.role} onChange={updateUser}>
              <option value="attendee">Attendee</option>
              <option value="organiser">Organiser</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="btn btn-primary btn-wide" type="submit">
            Save user
          </button>
        </form>
      </section>

      <section className="management-panel">
        <div className="panel-heading">
          <h2>Facilities</h2>
          <span className="role-chip">{facilities.length} records</span>
        </div>
        <div className="record-list">
          {facilities.map((facility) => (
            <article className="record-row" key={facility.id}>
              <div>
                <strong>{facility.name}</strong>
                <span>{facility.sportType} | {facility.location}</span>
              </div>
              <div className="row-actions">
                <button
                  className="btn btn-small"
                  type="button"
                  onClick={() => {
                    setFacilityForm(facility);
                    setFacilityEditId(facility.id);
                  }}
                >
                  Edit
                </button>
                <button className="btn btn-small danger" type="button" onClick={() => removeFacility(facility.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="management-panel">
        <div className="panel-heading">
          <h2>Users</h2>
          <span className="role-chip">{users.length} records</span>
        </div>
        <div className="record-list">
          {users.map((user) => (
            <article className="record-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span>{user.email} | {user.role}</span>
              </div>
              <div className="row-actions">
                <button
                  className="btn btn-small"
                  type="button"
                  onClick={() => {
                    setUserForm({ name: user.name, email: user.email, password: "", role: user.role });
                    setUserEditId(user.id);
                  }}
                >
                  Edit
                </button>
                <button className="btn btn-small danger" type="button" onClick={() => removeUser(user.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
