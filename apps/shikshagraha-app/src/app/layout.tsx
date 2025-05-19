import Head from 'next/head';

export const metadata = {
  title: 'Welcome to Shikshalokam',
  description: 'Welcome to Shikshalokam',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    // move themeColor here
    themeColor: '#000000',
  },
  icons: {
    icon: '/shikshalokam/icons/icon-192x192.png',
    apple: '/shikshalokam/icons/icon-192x192.png',
  },
  manifest: '/shikshalokam/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/shikshalokam/manifest.json" />
        <link
          rel="apple-touch-icon"
          href="/shikshalokam/icons/icon-192x192.png"
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
