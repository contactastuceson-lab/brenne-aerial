import React from 'react';

export default function SiteOfflinePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Sad face icon */}
      <div style={{ fontSize: 80, lineHeight: 1, color: '#9a9a9a', marginBottom: 24 }}>:(</div>

      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#444', margin: 0, marginBottom: 12 }}>
        Ce site est temporairement inaccessible.
      </h1>

      <p style={{ fontSize: 14, color: '#777', margin: 0, marginBottom: 32, textAlign: 'center', maxWidth: 420 }}>
        Le site <strong>brenneaerial.fr</strong> est actuellement hors ligne ou en cours de maintenance.
        Veuillez réessayer ultérieurement.
      </p>

      <div
        style={{
          background: '#d8d8d8',
          border: '1px solid #c4c4c4',
          borderRadius: 6,
          padding: '10px 20px',
          fontSize: 13,
          color: '#555',
          letterSpacing: 0.3,
        }}
      >
        ERR_CONNECTION_REFUSED &nbsp;·&nbsp; 503 Service Unavailable
      </div>

      <p style={{ marginTop: 48, fontSize: 12, color: '#aaa' }}>
        © Brenne Aerial — Si vous êtes l'administrateur, connectez-vous pour rétablir le service.
      </p>
    </div>
  );
}