

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const [facilities, setFacilities] = useState([]);
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalCapacity: 0,
    sportsTypes: 0
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  async function fetchFacilities() {
    try {
      const res = await fetch('/api/facilities');
      const data = await res.json();
      setFacilities(data.facilities || []);
      
     
      const total = data.facilities?.length || 0;
      const capacity = data.facilities?.reduce((sum, f) => sum + (f.defaultCapacity || 0), 0) || 0;
      const sports = new Set(data.facilities?.map(f => f.sportType)).size;
      
      setStats({
        totalFacilities: total,
        totalCapacity: capacity,
        sportsTypes: sports
      });
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  }

 
  const facilitiesBySport = facilities.reduce((acc, facility) => {
    const sport = facility.sportType || 'other';
    if (!acc[sport]) acc[sport] = [];
    acc[sport].push(facility);
    return acc;
  }, {});

  const sportIcons = {
    football: '⚽',
    basketball: '🏀',
    badminton: '🏸',
    swimming: '🏊',
    volleyball: '🏐',
    rugby: '🏉'
  };

  const sportNames = {
    football: 'Football',
    basketball: 'Basketball',
    badminton: 'Badminton',
    swimming: 'Swimming',
    volleyball: 'Volleyball',
    rugby: 'Rugby'
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <h1 className="hero-title">About SportSpace</h1>
          <p className="hero-subtitle">Premier Sports Facility Management Since 2020</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <span className="section-tag">OUR STORY</span>
              <h2 className="section-title">Building Champions, One Facility at a Time</h2>
              <p className="story-text">
                Founded in <strong>2020</strong>, SportSpace was born from a vision to create 
                a world-class sports facility that serves athletes of all levels. What started 
                as a single football pitch has grown into a comprehensive sports complex 
                spanning <strong>15+ acres</strong> of premium sports infrastructure.
              </p>
              <p className="story-text">
                Our facility officially opened its doors on <strong>March 15, 2021</strong>, 
                and since then, we've hosted over <strong>500+ tournaments</strong>, 
                trained <strong>10,000+ athletes</strong>, and become the go-to destination 
                for sports enthusiasts in the region.
              </p>
              <div className="milestones">
                <div className="milestone">
                  <span className="milestone-number">2020</span>
                  <span className="milestone-label">Founded</span>
                </div>
                <div className="milestone">
                  <span className="milestone-number">2021</span>
                  <span className="milestone-label">Grand Opening</span>
                </div>
                <div className="milestone">
                  <span className="milestone-number">500+</span>
                  <span className="milestone-label">Events Hosted</span>
                </div>
                <div className="milestone">
                  <span className="milestone-number">10K+</span>
                  <span className="milestone-label">Athletes Trained</span>
                </div>
              </div>
            </div>
           
          </div>
        </div>
      </section>

     
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.totalFacilities || 15}</span>
              <span className="stat-label">Sports Facilities</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.sportsTypes || 6}</span>
              <span className="stat-label">Sports Types</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.totalCapacity || 200}+</span>
              <span className="stat-label">Total Capacity</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">15+</span>
              <span className="stat-label">Acres of Land</span>
            </div>
          </div>
        </div>
      </section>

   
      <section className="facilities-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">OUR FACILITIES</span>
            <h2 className="section-title">World-Class Sports Infrastructure</h2>
            <p className="section-subtitle">
              We offer {stats.totalFacilities} premium facilities across {stats.sportsTypes} different sports
            </p>
          </div>

          <div className="sports-grid">
            {Object.entries(facilitiesBySport).map(([sport, items]) => (
              <div key={sport} className="sport-category">
                <div className="sport-header">
                  <span className="sport-icon">{sportIcons[sport] || '🏅'}</span>
                  <h3 className="sport-name">{sportNames[sport] || sport}</h3>
                  <span className="sport-count">{items.length} Facilities</span>
                </div>
                <div className="facility-list">
                  {items.map(facility => (
                    <div key={facility.id} className="facility-item">
                      <div className="facility-info">
                        <h4 className="facility-name">{facility.name}</h4>
                        <div className="facility-details">
                          <span className="facility-location">
                            📍 {facility.location === 'indoor' ? 'Indoor' : 'Outdoor'}
                          </span>
                          <span className="facility-capacity">
                            👥 Capacity: {facility.defaultCapacity}
                          </span>
                          <span className="facility-price">
                            💰 €{facility.hourlyRate}/hour
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WHY CHOOSE US</span>
            <h2 className="section-title">Premium Amenities & Services</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Professional Grade</h3>
              <p className="feature-description">
                International standard courts and pitches maintained to professional specifications
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🅿️</div>
              <h3 className="feature-title">Ample Parking</h3>
              <p className="feature-description">
                Free parking for 200+ vehicles with dedicated team bus parking
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏋️</div>
              <h3 className="feature-title">Gym & Training</h3>
              <p className="feature-description">
                State-of-the-art fitness center and warm-up areas
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛍️</div>
              <h3 className="feature-title">Pro Shop</h3>
              <p className="feature-description">
                Equipment rental and sports merchandise available on-site
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍔</div>
              <h3 className="feature-title">Cafe & Lounge</h3>
              <p className="feature-description">
                On-site cafe with healthy meals and spectator lounge
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🩺</div>
              <h3 className="feature-title">Medical Support</h3>
              <p className="feature-description">
                First aid and medical staff available during events
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="location-section">
        <div className="container">
          <div className="location-grid">
            <div className="location-info">
              <span className="section-tag">VISIT US</span>
              <h2 className="section-title">Location & Hours</h2>
              <div className="address-box">
                <p className="address">
                  <strong>SportSpace Sports Complex</strong><br />
                  123 Championship Drive<br />
                  Sports City, SC 12345<br />
                  United States
                </p>
              </div>
              <div className="hours-box">
                <h3>Opening Hours</h3>
                <ul className="hours-list">
                  <li><span>Monday - Friday:</span><span>6:00 AM - 10:00 PM</span></li>
                  <li><span>Saturday:</span><span>7:00 AM - 9:00 PM</span></li>
                  <li><span>Sunday:</span><span>8:00 AM - 8:00 PM</span></li>
                </ul>
              </div>
              <div className="contact-box">
                <p>📞 <strong>Phone:</strong> +1 (555) 123-4567</p>
                <p>✉️ <strong>Email:</strong> info@sportspace.com</p>
              </div>
            </div>
            <div className="story-image">
  <Image
    src="/map.png"  
    alt="SportSpace Sports Complex Aerial View - 15 acre facility with 5 football pitches, 2 basketball courts, 3 badminton courts, 2 swimming pools, 2 volleyball courts, and 1 rugby pitch"
    fill
    className="story-aerial-image"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
  />
</div>
          </div>
        </div>
      </section>

     
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Play?</h2>
            <p className="cta-text">
              Book your facility today and experience world-class sports infrastructure
            </p>
            <div className="cta-buttons">
              
              <Link href="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}