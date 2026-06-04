import './globals.css'

export const metadata = {
  title: 'Blush & Boujee Atelier | Curated Luxury Bags',
  description: 'Timeless. Feminine. Sophisticated. Discover curated luxury handbags.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#07000f' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* viewport: allow user zoom but prevent iOS 16 auto-zoom on inputs (need font-size ≥16px, handled in CSS) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Mobile browser chrome color */}
        <meta name="theme-color" content="#07000f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ background: 'transparent' }}>{children}</body>
    </html>
  )
}
