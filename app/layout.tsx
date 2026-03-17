import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poker Tournament Manager",
  description: "Track games, players, and results across poker tournaments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="site-bg">
          <header className="app-header">
            <div className="app-header-inner">
              <div>
                <p className="eyebrow">Poker Tournament Manager</p>
                <h1 className="app-title">Tournament Control Panel</h1>
              </div>
              <Navbar />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
