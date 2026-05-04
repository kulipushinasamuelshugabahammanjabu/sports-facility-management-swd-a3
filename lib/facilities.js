import { query } from "@/lib/db";


//get facilities sorted by type then name 
export async function getFacilities() {
  return query(
    `SELECT
       id,
       name,
       sport_type AS sportType,
       description,
       location,
       default_capacity AS defaultCapacity,
       hourly_rate AS hourlyRate,
       created_at AS createdAt
     FROM facilities
     ORDER BY sport_type ASC, name ASC`
  );
}


//return a single facility bu its id 
export async function getFacilityById(id) {
  const rows = await query(
    `SELECT
       id,
       name,
       sport_type AS sportType,
       description,
       location,
       default_capacity AS defaultCapacity,
       hourly_rate AS hourlyRate
     FROM facilities
     WHERE id = ?`,
    [id]
  );

  return rows[0] || null;
}
