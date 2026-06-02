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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ background: 'transparent' }}>{children}</body>
    </html>
  )
}
