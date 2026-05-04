export function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleanString(email).toLowerCase());
}

export function validatePassword(password) {
  return typeof password === "string" && password.length >= 8;
}

export function validateName(name) {
  const nameRegex = /^[A-Za-z\s'-]{2,}$/;
  return nameRegex.test(cleanString(name));
}

export function validateRegistration(data) {
  const errors = {};
  const name = cleanString(data.name);
  const email = cleanString(data.email).toLowerCase();
  const password = data.password || "";
  const role = ["admin", "organiser", "attendee"].includes(data.role) ? data.role : "attendee";

  if (!validateName(name)) errors.name = "Enter a valid name.";
  if (!validateEmail(email)) errors.email = "Enter a valid email address.";
  if (!validatePassword(password)) errors.password = "Password must be at least 8 characters.";

  return { values: { name, email, password, role }, errors };
}

export function validateLogin(data) {
  const errors = {};
  const email = cleanString(data.email).toLowerCase();
  const password = data.password || "";

  if (!validateEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";

  return { values: { email, password }, errors };
}

export function validateFacility(data) {
  const errors = {};
  const name = cleanString(data.name);
  const sportType = cleanString(data.sportType);
  const description = cleanString(data.description);
  const location = cleanString(data.location);
  const defaultCapacity = Number(data.defaultCapacity);
  const hourlyRate = Number(data.hourlyRate || 0);
  const textRegex = /^[A-Za-z0-9\s'-]{3,}$/;

  if (!textRegex.test(name)) errors.name = "Enter a valid facility name.";
  if (!textRegex.test(sportType)) errors.sportType = "Enter a valid sport type.";
  if (description.length < 10) errors.description = "Description must be at least 10 characters.";
  if (location.length < 3) errors.location = "Enter a valid location.";
  if (!Number.isInteger(defaultCapacity) || defaultCapacity < 1) errors.defaultCapacity = "Capacity must be at least 1.";
  if (Number.isNaN(hourlyRate) || hourlyRate < 0) errors.hourlyRate = "Rate cannot be negative.";

  return {
    values: { name, sportType, description, location, defaultCapacity, hourlyRate },
    errors
  };
}

export function validateEvent(data) {
  const errors = {};
  const facilityId = Number(data.facilityId);
  const title = cleanString(data.title);
  const description = cleanString(data.description);
  const eventDate = cleanString(data.eventDate);
  const titleRegex = /^[A-Za-z0-9\s'-]{4,}$/;

  if (!Number.isInteger(facilityId)) errors.facilityId = "Choose a valid facility.";
  if (!titleRegex.test(title)) errors.title = "Title must be at least 4 characters.";
  if (description.length < 10) errors.description = "Description must be at least 10 characters.";
  if (!eventDate || Number.isNaN(Date.parse(eventDate))) errors.eventDate = "Choose a valid date and time.";

  return {
    values: { facilityId, title, description, eventDate: eventDate.replace("T", " ") },
    errors
  };
}
