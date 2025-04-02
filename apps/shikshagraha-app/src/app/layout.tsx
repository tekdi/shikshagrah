export const metadata = {
  title: 'Welcome to SOT',
  description: 'Welcome to SOT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
