import type { Metadata } from 'next';
import '@/styles/globals.css';

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
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
