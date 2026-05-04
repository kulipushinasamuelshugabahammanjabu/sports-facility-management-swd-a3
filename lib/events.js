import { query } from "@/lib/db";

export async function getEvents({ search = "", organiserId = null, attendeeId = null } = {}) {
  
  //build array of SQL where condition
  const filters = [];
  const params = [];


//add search filter 
  if (search) {
    filters.push("(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ? OR f.name LIKE ? OR f.sport_type LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  //add organiser filter 
  if (organiserId) {
    filters.push("e.organiser_id = ?");
    params.push(organiserId);
  }

  // check if the attendee has booked this event 
  const bookingSelect = attendeeId
    ? "MAX(CASE WHEN b.attendee_id = ? AND b.status = 'booked' THEN 1 ELSE 0 END) AS is_booked,"
    : "0 AS is_booked,";
  
  
    const bookingParams = attendeeId ? [attendeeId] : [];
  
  
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    
  return query(
    `SELECT e.id, e.facility_id AS facilityId, e.title, e.description, e.location, e.event_date AS eventDate,
       e.capacity, e.price, e.organiser_id AS organiserId, u.name AS organiserName,
       f.name AS facilityName, f.sport_type AS sportType,
       COUNT(CASE WHEN b.status = 'booked' THEN 1 END) AS bookedCount,
       ${bookingSelect}
       (e.capacity - COUNT(CASE WHEN b.status = 'booked' THEN 1 END)) AS spacesLeft
     FROM events e
     JOIN facilities f ON f.id = e.facility_id
     JOIN users u ON u.id = e.organiser_id
     LEFT JOIN bookings b ON b.event_id = e.id
     ${where}
     GROUP BY e.id, u.name, f.name, f.sport_type
     ORDER BY e.event_date ASC`,
    [...bookingParams, ...params]
  );
}

export async function getEventById(id) {
  const rows = await query(
    `SELECT e.id, e.facility_id AS facilityId, e.title, e.description, e.location, e.event_date AS eventDate,
       e.capacity, e.price, e.organiser_id AS organiserId, u.name AS organiserName,
       f.name AS facilityName, f.sport_type AS sportType,
       COUNT(CASE WHEN b.status = 'booked' THEN 1 END) AS bookedCount
     FROM events e
     JOIN facilities f ON f.id = e.facility_id
     JOIN users u ON u.id = e.organiser_id
     LEFT JOIN bookings b ON b.event_id = e.id
     WHERE e.id = ?
     GROUP BY e.id, u.name, f.name, f.sport_type`,
    [id]
  );

  return rows[0] || null;
}
