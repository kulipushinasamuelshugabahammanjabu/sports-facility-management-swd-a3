import { query } from "@/lib/db";

export async function getUsersByRole() {
  const rows = await query(
    "SELECT role, COUNT(*) AS total FROM users GROUP BY role ORDER BY role"
  );

  return rows.reduce(
    (summary, row) => ({
      ...summary,
      [row.role]: Number(row.total)
    }),
    { admin: 0, organiser: 0, attendee: 0 }
  );
}

export async function getBookingSummary() {
  const rows = await query(`
    SELECT
      COUNT(*) AS totalBookings,
      COUNT(CASE WHEN status = 'booked' THEN 1 END) AS activeBookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelledBookings
    FROM bookings
  `);

  return {
    totalBookings: Number(rows[0]?.totalBookings || 0),
    activeBookings: Number(rows[0]?.activeBookings || 0),
    cancelledBookings: Number(rows[0]?.cancelledBookings || 0)
  };
}

export async function getMostBookedFacilities(limit = 5) {
    const safeLimit = Number.isInteger(Number(limit)) ? Number(limit) : 5;
  
    return query(`
      SELECT
        f.id,
        f.name,
        f.sport_type AS sportType,
        f.location,
        COUNT(CASE WHEN b.status = 'booked' THEN 1 END) AS activeBookings
      FROM facilities f
      LEFT JOIN events e ON e.facility_id = f.id
      LEFT JOIN bookings b ON b.event_id = e.id
      GROUP BY f.id, f.name, f.sport_type, f.location
      ORDER BY activeBookings DESC, f.name ASC
      LIMIT ${safeLimit}
    `);
  }

export async function getUpcomingEventsCount() {
  const rows = await query(
    "SELECT COUNT(*) AS total FROM events WHERE event_date >= NOW()"
  );

  return Number(rows[0]?.total || 0);
}

export async function getAdminReport() {
  const [usersByRole, bookings, mostBookedFacilities, upcomingEvents] =
    await Promise.all([
      getUsersByRole(),
      getBookingSummary(),
      getMostBookedFacilities(),
      getUpcomingEventsCount()
    ]);

  return {
    usersByRole,
    bookings,
    mostBookedFacilities,
    upcomingEvents
  };
}