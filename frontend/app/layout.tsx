import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'UFRA Eventos – Campus Paragominas',
    template: '%s | UFRA Eventos',
  },
  description:
    'Plataforma oficial de eventos acadêmicos da Universidade Federal Rural da Amazônia – Campus Paragominas. Inscrições, certificados, programação e muito mais.',
  keywords: [
    'UFRA', 'Paragominas', 'eventos acadêmicos', 'certificados', 'inscrições',
    'Universidade Federal Rural da Amazônia', 'agronomia', 'ciências agrárias',
  ],
  authors: [{ name: 'UFRA Campus Paragominas' }],
  creator: 'UFRA Campus Paragominas',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'UFRA Eventos – Campus Paragominas',
    description: 'Plataforma oficial de eventos acadêmicos da UFRA Campus Paragominas.',
    siteName: 'UFRA Eventos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UFRA Eventos',
    description: 'Plataforma oficial de eventos da UFRA Campus Paragominas.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1B5E20' },
    { media: '(prefers-color-scheme: dark)', color: '#0d2e10' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
