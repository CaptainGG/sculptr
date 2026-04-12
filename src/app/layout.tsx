import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sculptr — Turn SVGs into 3D sculptures',
  description: 'Turn any SVG into an interactive 3D sculpture with animations, materials, and lighting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen overflow-hidden bg-[#0f172a]">{children}</body>
    </html>
  );
}
