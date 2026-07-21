import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LibreAI — Frontier AI, Your Keys, Your Device',
  description:
    'Privacy-first AI client powered by Cloudflare Workers AI. Access Kimi K2.7, Llama, DeepSeek, and Flux with zero telemetry and 100% local storage.',
  openGraph: {
    title: 'LibreAI',
    description: 'Frontier AI. Your Keys. Your Device.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
