import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="section-kicker">Sports facility management</div>
          <h1>SportSpace</h1>
          <p>
            A full-stack Next.js and MySQL system for managing sports facilities,
            tournaments, bookings, and users across admin, organiser, and attendee roles.
          </p>
          <div className="hero-metrics" aria-label="Facility totals">
            <span>15 facilities</span>
            <span>6 sports</span>
            <span>3 user roles</span>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/events">
              Browse events
            </Link>
            <Link className="btn btn-secondary" href="/register">
              Create account
            </Link>
          </div>
        </div>

        <div className="facility-board" aria-label="Facility summary">
          <div className="facility-tile large">
            <span>Football</span>
            <strong>5 pitches</strong>
          </div>
          <div className="facility-tile">
            <span>Basketball</span>
            <strong>2 courts</strong>
          </div>
          <div className="facility-tile">
            <span>Badminton</span>
            <strong>3 courts</strong>
          </div>
          <div className="facility-tile">
            <span>Swimming</span>
            <strong>2 pools</strong>
          </div>
          <div className="facility-tile wide">
            <span>Volleyball and Rugby</span>
            <strong>3 fields</strong>
          </div>
        </div>
      </section>

      <section className="role-grid">
        <article>
          <span className="role-chip">Admin</span>
          <h2>Manage facilities and users</h2>
          <p>Admins add sports locations, update facility details, and oversee accounts.</p>
        </article>
        <article>
          <span className="role-chip">Organiser</span>
          <h2>Create events from facilities</h2>
          <p>Organisers choose admin-added pitches, courts, and pools when creating tournaments.</p>
        </article>
        <article>
          <span className="role-chip">Attendee</span>
          <h2>Book and attend sessions</h2>
          <p>Players and teams browse events, reserve places, and manage their bookings.</p>
        </article>
      </section>

      <section className="workflow-band" aria-label="System workflow">
        <div>
          <span>1</span>
          <strong>Admin adds facilities</strong>
          <p>Football pitches, courts, pools, and fields are created first.</p>
        </div>
        <div>
          <span>2</span>
          <strong>Organiser creates events</strong>
          <p>Events use the selected facility capacity, price, and location.</p>
        </div>
        <div>
          <span>3</span>
          <strong>Attendee books a place</strong>
          <p>The booking is saved and can be cancelled from the dashboard.</p>
        </div>
      </section>
    </main>
  );
}
