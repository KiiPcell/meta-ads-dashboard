import './globals.css'

export const metadata = {
  title: 'Meta Ads Dashboard - GSD Works',
  description: 'Meta Ads performance analytics with Claude AI insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
