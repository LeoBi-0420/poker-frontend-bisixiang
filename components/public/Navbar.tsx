import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/players", label: "Players" },
  { href: "/games", label: "Games" },
  { href: "/rankings", label: "Rankings" },
  { href: "/venues", label: "Venues" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  return (
    <nav className="app-nav" aria-label="Primary">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="nav-link">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
