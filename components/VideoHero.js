'use client';
// components/VideoHero.js

import { useEffect, useRef } from 'react';
import Link from 'next/link';


export default function VideoHero() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <div className="video-hero-wrapper">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="video-hero-bg"
      >
        <source src="/frontvideo.mp4" type="video/mp4" />
      </video>

      <div className="video-hero-overlay"></div>

      <div className="video-hero-content">
        <p className="hero-kicker">
          GET IN THE GAME
        </p>
        
        <h1 className="hero-headline">
          EXPERIENCE WINNING FACILITY OPERATIONS WITH SPORTSPACE
        </h1>
        
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/events">
            Browse events
          </Link>
          <Link className="btn btn-secondary" href="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}