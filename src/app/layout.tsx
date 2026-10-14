import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/player.css';

export const metadata: Metadata = {
  title: 'Mentora | Adaptive Multimodal AI Virtual Classroom',
  description: 'The AI Teacher That Doesn\'t Just Answer. It Teaches. Real-time virtual classroom with interactive board, 3D simulations, and adaptive pedagogy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#09090B] text-[#F4F4F6] antialiased">
        {children}
      </body>
    </html>
  );
}

// Verified production theme bundle