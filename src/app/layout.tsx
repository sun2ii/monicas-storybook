import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monica's Storybook",
  description: "Photo storybook app with Dropbox integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
