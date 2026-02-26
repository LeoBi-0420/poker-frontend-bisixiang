import type { Metadata } from "next";
import Link from "next/link";
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
  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/rankings", label: "Rankings" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/venues", label: "Venues" },
  ];

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
              <nav className="app-nav" aria-label="Primary">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
