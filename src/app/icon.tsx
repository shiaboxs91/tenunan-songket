import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: '6px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="url(#gold)" />
          <path d="M6 8L8 12L6 16L4 12L6 8Z" fill="url(#gold)" />
          <path d="M18 8L20 12L18 16L16 12L18 8Z" fill="url(#gold)" />
          <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="url(#gold)" />
          <circle cx="12" cy="12" r="2.5" fill="#FFD700" />
          <defs>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size }
  );
}
