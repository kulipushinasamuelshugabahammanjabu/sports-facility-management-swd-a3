"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { storeUser } from "@/components/Navigation";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z\s'-]{2,}$/;

function validateAuth(values, mode) {
  const errors = {};

  if (mode === "register" && !nameRegex.test(values.name.trim())) {
    errors.name = "Use at least 2 letters for the name.";
  }

  if (!emailRegex.test(values.email.trim().toLowerCase())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password || values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

function FieldError({ message }) {
  return message ? <p className="field-error">{message}</p> : null;
}

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    const nextErrors = validateAuth(values, mode);
    setErrors(nextErrors);
    setServerMessage("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    let data = {};

    try {
  data = await response.json();
      }catch {
    data = { error: "Server returned an invalid response." };
    }
    setLoading(false);

    if (!response.ok) {
      setErrors(data.errors || {});
      setServerMessage(data.error || "Check the form and try again.");
      return;
    }

    storeUser(data.user);
    window.dispatchEvent(new Event("sportspace-user-change"));
    router.push("/dashboard");
  }

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="section-kicker">Secure access</div>
        <h1>{isRegister ? "Create your SportSpace account" : "Login to SportSpace"}</h1>
        <p>
          {isRegister
            ? "Choose the correct role so the system can show the right tools."
            : "Your session is stored with cookies after a successful login."}
        </p>

        <form className="stacked-form" onSubmit={submitForm}>
          {isRegister && (
            <label>
              Full name
              <input
                name="name"
                value={values.name}
                onChange={updateField}
                placeholder="Olivia Organiser"
              />
              <FieldError message={errors.name} />
            </label>
          )}

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={updateField}
              placeholder="name@example.com"
            />
            <FieldError message={errors.email} />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={values.password}
              onChange={updateField}
              placeholder="Minimum 8 characters"
            />
            <FieldError message={errors.password} />
          </label>

          {isRegister && (
            <label>
              Account role
              <select name="role" value={values.role} onChange={updateField}>
                <option value="attendee">Attendee</option>
                <option value="organiser">Organiser</option>
              </select>
            </label>
          )}

          {serverMessage && <div className="notice notice-error">{serverMessage}</div>}

          <button className="btn btn-primary btn-wide" type="submit" disabled={loading}>
            {loading ? "Please wait" : isRegister ? "Create account" : "Login"}
          </button>
        </form>
      </div>

      <aside className="auth-aside">
        <div className="stat-strip">
          <span>5 football pitches</span>
          <span>3 badminton courts</span>
          <span>Role-based dashboards</span>
        </div>
      </aside>
    </section>
  );
}
