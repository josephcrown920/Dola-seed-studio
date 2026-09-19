import './global.css'

export const metadata = {
  title: 'Dola Seed Studio',
  description: 'AI creative workstation for images, motion, and video'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}