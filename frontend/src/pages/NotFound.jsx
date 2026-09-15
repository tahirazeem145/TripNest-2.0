import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d1117',
      color: '#f0f6fc',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        fontSize: '96px',
        fontWeight: '800',
        lineHeight: '1',
        background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px'
      }}>
        404
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
        Destination Not Found
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#8b949e',
        maxWidth: '480px',
        lineHeight: '1.6',
        marginBottom: '32px'
      }}>
        The travel coordinates you are looking for don't exist, were moved, or have wandered off the map.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/home"
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
          }}
        >
          Return to Feed
        </Link>
        <Link
          to="/travelers"
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#f0f6fc',
            borderRadius: '10px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          Discover Travelers
        </Link>
      </div>
    </div>
  );
}
